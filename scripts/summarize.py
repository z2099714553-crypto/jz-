"""给还没有中文摘要的文章补摘要。

成本控制:
  - MAX_SUMMARIES_PER_RUN 卡死每轮最多处理多少篇(默认 25)
  - 摘要写回 posts.json 后永不重算
  - 正文超长时截断,并在 prompt 里明说"只给了开头部分",不做无声截断
没有 ANTHROPIC_API_KEY 时整个脚本跳过,流水线其余部分照常跑。
"""
import json
import os
import sys

from common import env_int, iso, load_posts, now_utc, save_posts

MODEL = os.environ.get("SUMMARY_MODEL", "claude-opus-5").strip() or "claude-opus-5"
MAX_PER_RUN = env_int("MAX_SUMMARIES_PER_RUN", 25)
MAX_CHARS = env_int("SUMMARY_MAX_CHARS", 12000)
SCHEMA_VERSION = 1

SYSTEM = """你在为一个商业分析读者做信息过滤。读者是中文母语者,关注商业战略、公司分析、行业结构、创投。

对每篇文章:
1. summary_zh —— 3 到 5 句中文,说清作者的核心论点和关键论据。不要写"本文讨论了...",直接讲内容。英文原文要翻译成中文,不要中英夹杂。
2. key_points —— 2 到 4 条要点,每条一句话,是文章里具体的判断或数据,不是泛泛的概括。
3. topics —— 1 到 3 个中文主题词,比如"AI基础设施""订阅制""渠道变革"。
4. worth_reading —— 这篇值不值得读者点进去读原文。判断标准是:有没有提出非显然的观点或一手信息。纯新闻转述、公关稿、榜单给 false。

只依据提供的文本作判断。如果给的是文章开头部分,基于开头能看出的内容作答即可。"""

OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "summary_zh": {"type": "string"},
        "key_points": {"type": "array", "items": {"type": "string"}},
        "topics": {"type": "array", "items": {"type": "string"}},
        "worth_reading": {"type": "boolean"},
    },
    "required": ["summary_zh", "key_points", "topics", "worth_reading"],
    "additionalProperties": False,
}

# 账号若没开 server-side fallback beta,第一次 400 后就永久走普通通道
_use_fallback = True


def needs_summary(post: dict) -> bool:
    if not (post.get("raw_text") or "").strip():
        return False
    summary = post.get("summary")
    return not summary or summary.get("schema_version") != SCHEMA_VERSION


def build_prompt(post: dict) -> str:
    text = post["raw_text"]
    truncated = len(text) > MAX_CHARS
    if truncated:
        text = text[:MAX_CHARS]
    header = (
        f"标题: {post['title']}\n"
        f"作者/来源: {post.get('author')} ({post.get('source')})\n"
        f"语言: {'中文' if post.get('lang') == 'zh' else '英文'}\n"
        f"链接: {post.get('link')}\n"
    )
    body_label = "正文(仅文章开头部分,原文更长):" if truncated else "正文:"
    return f"{header}\n{body_label}\n{text}"


def summarize(client, anthropic, post: dict) -> dict | None:
    global _use_fallback

    kwargs = dict(
        model=MODEL,
        max_tokens=2000,
        system=SYSTEM,
        messages=[{"role": "user", "content": build_prompt(post)}],
        output_config={"format": {"type": "json_schema", "schema": OUTPUT_SCHEMA}, "effort": "low"},
    )

    try:
        if _use_fallback:
            # 安全分类器拒答时自动路由到备用模型,而不是整篇丢掉
            response = client.beta.messages.create(
                betas=["server-side-fallback-2026-07-01"], fallbacks="default", **kwargs
            )
        else:
            response = client.messages.create(**kwargs)
    except anthropic.BadRequestError as exc:
        message = str(exc).lower()
        if _use_fallback and ("beta" in message or "fallback" in message):
            print("    [info] 账号不支持 server-side fallback beta,后续改用普通请求")
            _use_fallback = False
            return summarize(client, anthropic, post)
        print(f"    [skip] 请求被拒: {exc}")
        return None
    except anthropic.RateLimitError as exc:
        raise RuntimeError(f"触发限流,本轮提前结束: {exc}") from exc
    except (anthropic.APIStatusError, anthropic.APIConnectionError) as exc:
        print(f"    [skip] API 错误: {exc}")
        return None

    if response.stop_reason == "refusal":
        detail = getattr(response, "stop_details", None)
        print(f"    [skip] 模型拒答 ({getattr(detail, 'category', '未知')})")
        return None

    try:
        text = next(b.text for b in response.content if b.type == "text")
        data = json.loads(text)
    except (StopIteration, json.JSONDecodeError) as exc:
        print(f"    [skip] 返回内容无法解析: {exc}")
        return None

    usage = response.usage
    return {
        "schema_version": SCHEMA_VERSION,
        "summary_zh": data["summary_zh"],
        "key_points": data["key_points"],
        "topics": data["topics"],
        "worth_reading": data["worth_reading"],
        "model": MODEL,
        "generated_at": iso(now_utc()),
        "input_tokens": usage.input_tokens,
        "output_tokens": usage.output_tokens,
    }


def main() -> int:
    if not (os.environ.get("ANTHROPIC_API_KEY") or "").strip():
        print("[skip] 没有设置 ANTHROPIC_API_KEY,跳过摘要环节。")
        print("       在仓库 Settings → Secrets and variables → Actions 里加上即可启用。")
        return 0

    try:
        import anthropic
    except ImportError:
        print("[error] 没装 anthropic 包,跑 pip install -r requirements.txt")
        return 1

    posts = load_posts()
    pending = [p for p in posts if needs_summary(p)]
    if not pending:
        print("所有文章都已有摘要,无需处理。")
        return 0

    # 新的先做:读者最关心最近的
    pending.sort(key=lambda p: p.get("published") or "", reverse=True)
    batch = pending[:MAX_PER_RUN]
    print(f"待摘要 {len(pending)} 篇,本轮处理 {len(batch)} 篇 (模型 {MODEL})\n")

    client = anthropic.Anthropic()
    done = 0
    tokens_in = tokens_out = 0

    for i, post in enumerate(batch, 1):
        print(f"  [{i}/{len(batch)}] {post['title'][:58]}")
        try:
            summary = summarize(client, anthropic, post)
        except RuntimeError as exc:
            print(f"  [stop] {exc}")
            break
        if summary:
            post["summary"] = summary
            tokens_in += summary["input_tokens"]
            tokens_out += summary["output_tokens"]
            done += 1

    save_posts(posts)

    # 按当前 Opus 5 价目估算,方便你盯住花销
    cost = tokens_in / 1e6 * 5 + tokens_out / 1e6 * 25
    print(f"\n完成 {done}/{len(batch)} 篇 | tokens: {tokens_in:,} in / {tokens_out:,} out")
    if MODEL == "claude-opus-5":
        print(f"本轮约 ${cost:.3f} (Opus 5 $5/$25 per MTok)")
    if len(pending) > len(batch):
        print(f"还剩 {len(pending) - len(batch)} 篇待处理,下一轮继续。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
