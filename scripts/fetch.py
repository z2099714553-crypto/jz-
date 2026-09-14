"""抓取 feeds.yml 里的所有源,增量合并进 data/posts.json。

设计要点:
  - 已有文章只补字段,绝不覆盖已生成的摘要(摘要要花钱,不能白扔)
  - 每个源的成败记进 data/health.json,连续失败的源在页面上会标出来
  - 首次运行只回溯 BACKFILL_DAYS 天,避免一次灌进几千篇
"""
import concurrent.futures as futures
import sys
import time
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

import feedparser
import requests
import yaml

from common import (
    FEEDS_FILE, HEALTH_FILE, canonical_url, env_int, iso, load_json,
    load_posts, now_utc, save_json, save_posts, strip_html,
)

BACKFILL_DAYS = env_int("BACKFILL_DAYS", 45)
TIMEOUT = env_int("FETCH_TIMEOUT", 25)
WORKERS = env_int("FETCH_WORKERS", 8)
MAX_ENTRIES_PER_FEED = env_int("MAX_ENTRIES_PER_FEED", 30)

UA = "Mozilla/5.0 (compatible; jz-fenshen/1.0; +https://github.com/z2099714553-crypto/jz-)"
# 默认用上面这个能表明身份的 UA;只在被 403 拦下时才退回伪装成浏览器
BROWSER_UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36")


def parse_date(entry) -> str | None:
    """RSS 的日期格式五花八门,挨个试。"""
    for key in ("published", "updated", "created"):
        raw = entry.get(key)
        if not raw:
            continue
        try:
            dt = parsedate_to_datetime(raw)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return iso(dt)
        except (TypeError, ValueError):
            pass
    for key in ("published_parsed", "updated_parsed"):
        st = entry.get(key)
        if st:
            try:
                return iso(datetime(*st[:6], tzinfo=timezone.utc))
            except (TypeError, ValueError):
                pass
    return None


def entry_text(entry) -> str:
    """优先取全文 content,退回 summary。"""
    blocks = entry.get("content") or []
    best = max((b.get("value", "") for b in blocks), key=len, default="")
    if len(best) < len(entry.get("summary", "") or ""):
        best = entry.get("summary", "")
    return strip_html(best)


ITUNES_LOOKUP = "https://itunes.apple.com/lookup"
ITUNES_SEARCH = "https://itunes.apple.com/search"


def resolve_apple(feed_cfg: dict) -> tuple[str | None, str | None, str | None]:
    """把 Apple Podcasts 的 ID 或节目名换成真实 RSS 地址。

    播客的 RSS 地址五花八门(megaphone/transistor/libsyn/自建),靠猜命中率很低,
    但 Apple 的公开接口能直接给出。返回 (rss地址, Apple上的节目名, 错误)。
    节目名一并返回,用于核对按名字搜索时有没有匹配错节目。
    """
    try:
        if feed_cfg.get("apple_id"):
            r = requests.get(ITUNES_LOOKUP, params={"id": str(feed_cfg["apple_id"])},
                             timeout=TIMEOUT, headers={"User-Agent": UA})
        else:
            r = requests.get(ITUNES_SEARCH,
                             params={"term": feed_cfg["apple_search"], "entity": "podcast", "limit": 1},
                             timeout=TIMEOUT, headers={"User-Agent": UA})
        r.raise_for_status()
        results = r.json().get("results") or []
    except (requests.RequestException, ValueError) as exc:
        return None, None, f"Apple 接口失败: {type(exc).__name__}: {exc}"

    if not results:
        return None, None, "Apple 上找不到这个节目"
    feed_url = results[0].get("feedUrl")
    matched = results[0].get("collectionName")
    if not feed_url:
        return None, matched, f"Apple 有该节目({matched})但没给 RSS 地址"
    return feed_url, matched, None


def fetch_one(feed_cfg: dict) -> tuple[dict, list, str | None]:
    """返回 (源配置, 文章列表, 错误信息)。异常一律转成错误信息,不让单个源拖垮整轮。"""
    url = feed_cfg.get("url")
    matched_name = None
    if not url:
        url, matched_name, err = resolve_apple(feed_cfg)
        if err:
            return feed_cfg, [], err
        feed_cfg = {**feed_cfg, "url": url, "apple_matched": matched_name}
    accept = "application/rss+xml, application/xml, text/xml, */*"
    try:
        resp = requests.get(url, timeout=TIMEOUT, headers={"User-Agent": UA, "Accept": accept})
        # 小宇宙等平台会按 UA 拦爬虫,换成浏览器 UA 再试一次
        if resp.status_code == 403:
            resp = requests.get(url, timeout=TIMEOUT, headers={"User-Agent": BROWSER_UA, "Accept": accept})
        resp.raise_for_status()
    except requests.RequestException as exc:
        return feed_cfg, [], f"{type(exc).__name__}: {exc}"

    parsed = feedparser.parse(resp.content)
    if not parsed.entries:
        ctype = resp.headers.get("content-type", "未知")
        head = resp.text[:160].replace("\n", " ").strip()
        if parsed.bozo:
            reason = f"解析失败: {parsed.get('bozo_exception', '未知错误')}"
        else:
            reason = "源可访问但没有条目"
        # 返回的常常不是 XML 而是反爬页面,带上这两项才看得出是哪种情况
        return feed_cfg, [], f"{reason} | content-type={ctype} | 开头: {head}"

    cutoff = iso(now_utc() - timedelta(days=BACKFILL_DAYS))
    out = []
    for entry in parsed.entries[:MAX_ENTRIES_PER_FEED]:
        link = canonical_url(entry.get("link", ""))
        title = (entry.get("title") or "").strip()
        if not link or not title:
            continue
        published = parse_date(entry)
        # 没有日期的条目保留(有些源就是不给),但排序时会排在最后
        if published and published < cutoff:
            continue
        out.append({
            "id": link,
            "title": title,
            "link": entry.get("link", link),
            "published": published,
            "source": feed_cfg["name"],
            "author": feed_cfg.get("author") or feed_cfg["name"],
            "lang": feed_cfg.get("lang", "en"),
            "tags": list(feed_cfg.get("tags") or []),
            "type": feed_cfg.get("type", "blog"),
            "raw_text": entry_text(entry),
            "fetched_at": iso(now_utc()),
        })
    return feed_cfg, out, None


def main() -> int:
    with FEEDS_FILE.open(encoding="utf-8") as f:
        config = yaml.safe_load(f)
    feeds = [f for f in config.get("feeds", []) if f.get("enabled", True)]
    bad = [f.get("name", "?") for f in feeds
           if not (f.get("url") or f.get("apple_id") or f.get("apple_search"))]
    if bad:
        print(f"[error] 这些源没写 url/apple_id/apple_search: {', '.join(bad)}")
        return 1
    if not feeds:
        print("[error] feeds.yml 里没有启用的源")
        return 1

    print(f"开始抓取 {len(feeds)} 个源 (并发 {WORKERS}, 回溯 {BACKFILL_DAYS} 天)\n")
    started = time.monotonic()

    results = []
    with futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for feed_cfg, entries, error in pool.map(fetch_one, feeds):
            results.append((feed_cfg, entries, error))
            mark = "✗" if error else "✓"
            detail = error if error else f"{len(entries)} 篇"
            print(f"  {mark} {feed_cfg['name']:<26} {detail}")

    existing = {p["id"]: p for p in load_posts()}
    added = 0

    # 停用某个源后,它此前留下的文章也要清掉,否则会一直挂在页面上
    active_names = {f["name"] for f in feeds}
    stale = [pid for pid, post in existing.items() if post.get("source") not in active_names]
    for pid in stale:
        del existing[pid]
    for _, entries, _ in results:
        for post in entries:
            prior = existing.get(post["id"])
            if prior is None:
                existing[post["id"]] = post
                added += 1
            else:
                # 保住已有摘要,只刷新可能变动的元数据
                prior["title"] = post["title"] or prior.get("title")
                prior["published"] = prior.get("published") or post["published"]
                if len(post["raw_text"]) > len(prior.get("raw_text", "")):
                    prior["raw_text"] = post["raw_text"]

    save_posts(list(existing.values()))

    # 健康度:连续失败次数攒着,方便判断某个源是彻底死了还是偶发
    health = load_json(HEALTH_FILE, {"feeds": {}}).get("feeds", {})
    # 只保留当前启用的源,否则停用后的旧记录会一直留在统计里
    health = {n: r for n, r in health.items() if n in active_names}
    for feed_cfg, entries, error in results:
        name = feed_cfg["name"]
        record = health.get(name, {"consecutive_failures": 0})
        record.update({
            "url": feed_cfg.get("url") or f"apple:{feed_cfg.get('apple_id') or feed_cfg.get('apple_search')}",
            "type": feed_cfg.get("type", "blog"),
            "lang": feed_cfg.get("lang", "en"),
            "apple_matched": feed_cfg.get("apple_matched"),
            "last_checked": iso(now_utc()),
            "last_status": "error" if error else "ok",
            "last_error": error,
            "entries_last_run": len(entries),
        })
        record["consecutive_failures"] = record.get("consecutive_failures", 0) + 1 if error else 0
        if not error:
            record["last_success"] = iso(now_utc())
        health[name] = record
    save_json(HEALTH_FILE, {"generated_at": iso(now_utc()), "feeds": health})

    ok = sum(1 for _, _, e in results if not e)
    broken = [n for n, r in health.items() if r.get("consecutive_failures", 0) >= 3]
    print(f"\n完成: {ok}/{len(feeds)} 个源正常, 新增 {added} 篇, 库存 {len(existing)} 篇"
          f" ({time.monotonic() - started:.1f}s)")
    if stale:
        print(f"清理 {len(stale)} 篇来自已停用源的旧文章")
    if broken:
        print(f"[warn] 连续失败 3 次以上的源: {', '.join(broken)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
