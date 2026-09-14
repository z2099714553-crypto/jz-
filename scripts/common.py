"""共享工具:路径、读写、链接规范化。"""
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
POSTS_FILE = DATA_DIR / "posts.json"
HEALTH_FILE = DATA_DIR / "health.json"
FEEDS_FILE = ROOT / "feeds.yml"

# 各家统计参数,去掉后同一篇文章的链接才能对上
_TRACKING_PREFIXES = ("utm_", "mc_", "ref_")
_TRACKING_KEYS = {"ref", "source", "fbclid", "gclid", "igshid", "spm", "from", "share_token"}


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def canonical_url(url: str) -> str:
    """去掉追踪参数和 fragment,作为文章的去重键。"""
    if not url:
        return ""
    parts = urlsplit(url.strip())
    kept = [
        (k, v)
        for k, v in parse_qsl(parts.query, keep_blank_values=True)
        if not k.lower().startswith(_TRACKING_PREFIXES) and k.lower() not in _TRACKING_KEYS
    ]
    path = parts.path.rstrip("/") or "/"
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, urlencode(kept), ""))


def strip_html(raw: str) -> str:
    """RSS 的 summary/content 基本都是 HTML,转成纯文本给摘要用。"""
    if not raw:
        return ""
    text = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", raw)
    text = re.sub(r"(?i)<br\s*/?>|</p>|</div>|</li>", "\n", text)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    for entity, char in (
        ("&nbsp;", " "), ("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"),
        ("&quot;", '"'), ("&#39;", "'"), ("&mdash;", "—"), ("&hellip;", "…"),
    ):
        text = text.replace(entity, char)
    text = re.sub(r"&#x?[0-9a-fA-F]+;", " ", text)
    text = re.sub(r"[ \t ]+", " ", text)
    return re.sub(r"\n\s*\n\s*\n+", "\n\n", text).strip()


def load_json(path: Path, default):
    if not path.exists():
        return default
    try:
        with path.open(encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as exc:
        print(f"[warn] 读取 {path.name} 失败,用默认值: {exc}")
        return default


def save_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2, sort_keys=False)
        f.write("\n")
    tmp.replace(path)


def load_posts() -> list:
    return load_json(POSTS_FILE, {"posts": []}).get("posts", [])


def save_posts(posts: list) -> None:
    posts = sorted(posts, key=lambda p: p.get("published") or "", reverse=True)
    save_json(POSTS_FILE, {"generated_at": iso(now_utc()), "count": len(posts), "posts": posts})


def env_int(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, "").strip() or default)
    except ValueError:
        return default
