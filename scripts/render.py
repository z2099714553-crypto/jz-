"""把 data/posts.json 渲染成 docs/index.html,并刷新 README 里的最新列表。"""
import html
import json
import sys
from datetime import datetime, timezone

from common import HEALTH_FILE, ROOT, env_int, iso, load_json, load_posts, now_utc

PAGE_LIMIT = env_int("PAGE_POST_LIMIT", 300)
README_LIMIT = env_int("README_POST_LIMIT", 15)
README_START = "<!-- POSTS:START -->"
README_END = "<!-- POSTS:END -->"


def relative_time(published: str | None) -> str:
    if not published:
        return "时间未知"
    try:
        dt = datetime.strptime(published, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except ValueError:
        return "时间未知"
    delta = now_utc() - dt
    hours = delta.total_seconds() / 3600
    if hours < 1:
        return "刚刚"
    if hours < 24:
        return f"{int(hours)} 小时前"
    if delta.days < 30:
        return f"{delta.days} 天前"
    return dt.strftime("%Y-%m-%d")


def build_page(posts: list, health: dict) -> str:
    visible = posts[:PAGE_LIMIT]
    payload = [{
        "title": p["title"],
        "link": p.get("link", ""),
        "source": p.get("source", ""),
        "author": p.get("author", ""),
        "lang": p.get("lang", "en"),
        "published": p.get("published"),
        "when": relative_time(p.get("published")),
        "summary": (p.get("summary") or {}).get("summary_zh", ""),
        "points": (p.get("summary") or {}).get("key_points", []),
        "topics": (p.get("summary") or {}).get("topics", []),
        "worth": (p.get("summary") or {}).get("worth_reading"),
    } for p in visible]

    authors = sorted({p["author"] for p in payload if p["author"]})
    topics = sorted({t for p in payload for t in p["topics"]})
    broken = [n for n, r in health.items() if r.get("consecutive_failures", 0) >= 3]
    summarized = sum(1 for p in payload if p["summary"])

    data_json = json.dumps(payload, ensure_ascii=False)
    authors_json = json.dumps(authors, ensure_ascii=False)
    topics_json = json.dumps(topics, ensure_ascii=False)
    updated = now_utc().strftime("%Y-%m-%d %H:%M UTC")
    broken_note = (
        f'<p class="warn">{len(broken)} 个源连续抓取失败：{html.escape("、".join(broken))}</p>'
        if broken else ""
    )

    return f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>jz的分身 · 商业分析阅读流</title>
<style>
:root {{
  --bg: #fbfaf8; --surface: #ffffff; --border: #e5e1da; --text: #1c1a17;
  --muted: #6f6a62; --accent: #9a5b2c; --accent-soft: #f3ebe3; --warn: #8a4b2a;
}}
@media (prefers-color-scheme: dark) {{
  :root {{
    --bg: #16150f; --surface: #1e1d17; --border: #33302a; --text: #ece8e0;
    --muted: #9c968c; --accent: #d79a63; --accent-soft: #2a241d; --warn: #d79a63;
  }}
}}
* {{ box-sizing: border-box; }}
body {{
  margin: 0; background: var(--bg); color: var(--text);
  font: 16px/1.65 "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
}}
.wrap {{ max-width: 860px; margin: 0 auto; padding: 40px 20px 80px; }}
header {{ border-bottom: 1px solid var(--border); padding-bottom: 24px; margin-bottom: 28px; }}
h1 {{ font-size: 1.75rem; margin: 0 0 6px; letter-spacing: -0.01em; }}
.sub {{ color: var(--muted); font-size: 0.9rem; margin: 0; }}
.warn {{ color: var(--warn); font-size: 0.85rem; margin: 10px 0 0; }}
.filters {{ display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }}
select, .chip {{
  font: inherit; font-size: 0.85rem; padding: 6px 12px; border-radius: 999px;
  border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer;
}}
.chip[aria-pressed="true"] {{ background: var(--accent); border-color: var(--accent); color: #fff; }}
article {{
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 20px 22px; margin-bottom: 14px;
}}
article h2 {{ font-size: 1.06rem; margin: 0 0 8px; line-height: 1.45; }}
article h2 a {{ color: var(--text); text-decoration: none; }}
article h2 a:hover {{ color: var(--accent); text-decoration: underline; }}
.meta {{ font-size: 0.82rem; color: var(--muted); margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }}
.badge {{ background: var(--accent-soft); color: var(--accent); padding: 2px 9px; border-radius: 999px; font-size: 0.75rem; }}
.summary {{ margin: 0 0 12px; }}
ul.points {{ margin: 0 0 12px; padding-left: 20px; color: var(--muted); font-size: 0.92rem; }}
ul.points li {{ margin-bottom: 4px; }}
.topics {{ display: flex; flex-wrap: wrap; gap: 6px; }}
.topic {{ font-size: 0.75rem; color: var(--muted); border: 1px solid var(--border); padding: 2px 9px; border-radius: 999px; }}
.pending {{ color: var(--muted); font-style: italic; font-size: 0.9rem; margin: 0 0 12px; }}
.empty {{ text-align: center; color: var(--muted); padding: 60px 20px; }}
footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border); color: var(--muted); font-size: 0.82rem; }}
footer a {{ color: var(--accent); }}
</style>
</head>
<body>
<div class="wrap">
<header>
  <h1>jz的分身</h1>
  <p class="sub">商业分析阅读流 · 共 {len(payload)} 篇（{summarized} 篇已生成摘要）· 更新于 {updated}</p>
  {broken_note}
</header>

<div class="filters">
  <button class="chip" id="worthOnly" aria-pressed="false">只看值得读</button>
  <select id="langSel"><option value="">全部语言</option><option value="zh">中文</option><option value="en">英文</option></select>
  <select id="authorSel"><option value="">全部作者</option></select>
  <select id="topicSel"><option value="">全部主题</option></select>
</div>

<div id="list"></div>

<footer>
  由 GitHub Actions 定时抓取，Claude 生成中文摘要。
  <a href="https://github.com/z2099714553-crypto/jz-">源码</a>
</footer>
</div>

<script>
const POSTS = {data_json};
const AUTHORS = {authors_json};
const TOPICS = {topics_json};

const $ = id => document.getElementById(id);
const esc = s => {{ const d = document.createElement('div'); d.textContent = s ?? ''; return d.innerHTML; }};

for (const a of AUTHORS) $('authorSel').insertAdjacentHTML('beforeend', `<option value="${{esc(a)}}">${{esc(a)}}</option>`);
for (const t of TOPICS) $('topicSel').insertAdjacentHTML('beforeend', `<option value="${{esc(t)}}">${{esc(t)}}</option>`);

function render() {{
  const lang = $('langSel').value, author = $('authorSel').value, topic = $('topicSel').value;
  const worthOnly = $('worthOnly').getAttribute('aria-pressed') === 'true';

  const rows = POSTS.filter(p =>
    (!lang || p.lang === lang) &&
    (!author || p.author === author) &&
    (!topic || p.topics.includes(topic)) &&
    (!worthOnly || p.worth === true)
  );

  if (!rows.length) {{
    $('list').innerHTML = '<p class="empty">没有符合条件的文章。</p>';
    return;
  }}

  $('list').innerHTML = rows.map(p => `
    <article>
      <h2><a href="${{esc(p.link)}}" target="_blank" rel="noopener">${{esc(p.title)}}</a></h2>
      <div class="meta">
        <span>${{esc(p.author)}}</span><span>·</span><span>${{esc(p.when)}}</span>
        ${{p.worth === true ? '<span class="badge">值得读</span>' : ''}}
        ${{p.lang === 'en' ? '<span class="badge">EN</span>' : ''}}
      </div>
      ${{p.summary
        ? `<p class="summary">${{esc(p.summary)}}</p>`
        : '<p class="pending">摘要待生成</p>'}}
      ${{p.points.length ? `<ul class="points">${{p.points.map(x => `<li>${{esc(x)}}</li>`).join('')}}</ul>` : ''}}
      ${{p.topics.length ? `<div class="topics">${{p.topics.map(t => `<span class="topic">${{esc(t)}}</span>`).join('')}}</div>` : ''}}
    </article>`).join('');
}}

$('worthOnly').addEventListener('click', e => {{
  const btn = e.currentTarget;
  btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  render();
}});
for (const id of ['langSel', 'authorSel', 'topicSel']) $(id).addEventListener('change', render);
render();
</script>
</body>
</html>
"""


def build_readme_block(posts: list) -> str:
    lines = [f"*更新于 {now_utc().strftime('%Y-%m-%d %H:%M UTC')}*", ""]
    picked = [p for p in posts if (p.get("summary") or {}).get("worth_reading")] or posts
    for post in picked[:README_LIMIT]:
        summary = post.get("summary") or {}
        title = post["title"].replace("|", "\\|")
        lines.append(f"**[{title}]({post.get('link', '')})**  ")
        lines.append(f"`{post.get('author', '')}` · {relative_time(post.get('published'))}  ")
        if summary.get("summary_zh"):
            lines.append(summary["summary_zh"])
        lines.append("")
    return "\n".join(lines)


def update_readme(posts: list) -> bool:
    path = ROOT / "README.md"
    content = path.read_text(encoding="utf-8")
    if README_START not in content or README_END not in content:
        print("[warn] README 里没有 POSTS 标记,跳过更新")
        return False
    head, rest = content.split(README_START, 1)
    _, tail = rest.split(README_END, 1)
    updated = f"{head}{README_START}\n{build_readme_block(posts)}\n{README_END}{tail}"
    if updated == content:
        return False
    path.write_text(updated, encoding="utf-8")
    return True


def main() -> int:
    posts = load_posts()
    health = load_json(HEALTH_FILE, {"feeds": {}}).get("feeds", {})

    page = ROOT / "docs" / "index.html"
    page.parent.mkdir(parents=True, exist_ok=True)
    page.write_text(build_page(posts, health), encoding="utf-8")
    print(f"已生成 docs/index.html ({len(posts[:PAGE_LIMIT])} 篇)")

    print("README 已更新" if update_readme(posts) else "README 无变化")
    return 0


if __name__ == "__main__":
    sys.exit(main())
