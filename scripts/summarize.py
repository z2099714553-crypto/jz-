"""给还没有中文摘要的文章补摘要。

后端按以下顺序自动选择(可用 SUMMARY_BACKEND 强制指定 claude/github/none):
  1. claude —— 设了 ANTHROPIC_API_KEY 时使用,质量最好,按量付费
  2. github —— GitHub Models,用 Actions 内置 GITHUB_TOKEN,免费但有速率上限
  3. 都没有则整个环节跳过,流水线其余部分照常跑

成本/配额控制:
  - MAX_SUMMARIES_PER_RUN 卡死每轮处理篇数
  - 摘要写回 posts.json 后永不重算
  - github 后端在每次请求间隔 REQUEST_DELAY 秒,避开 RPM 限制
"""
import json
import os
import sys
import time

import requests

from common import env_int, iso, load_posts, now_utc, save_posts

SCHEMA_VERSION = 1
MAX_PER_RUN = env_int("MAX_SUMMARIES_PER_RUN", 25)

CLAUDE_MODEL = os.environ.get("SUMMARY_MODEL", "claude-opus-5").strip() or "claude-opus-5"
GITHUB_MODEL = os.environ.get("GITHUB_MODEL", "openai/gpt-4o-mini").strip() or "openai/gpt-4o-mini"
GITHUB_ENDPOINT = "https://models.github.ai/inference/chat/completions"
GITHUB_CATALOG = "https://models.github.ai/catalog/models"

# GitHub Models 免费额度限制单次请求 8K 输入,中文约 1 字符 1 token,留足余量
CLAUDE_MAX_CHARS = env_int("SUMMARY_MAX_CHARS", 12000)
GITHUB_MAX_CHARS = env_int("GITHUB_MAX_CHARS", 5500)
REQUEST_DELAY = float(os.environ.get("REQUEST_DELAY", "7"))

SYSTEM = """你在为一个商业分析读者做信息过滤。读者是中文母语者,关注商业战略、公司分析、行业结构、创投。

对每篇文章:
1. summary_zh —— 3 到 5 句中文,说清作者的核心论点和关键论据。不要写"本文讨论了...",直接讲内容。英文原文要翻译成中文,不要中英夹杂。
2. key_points —— 2 到 4 条要点,每条一句话,是文章里具体的判断或数据,不是泛泛的概括。
3. topics —— 1 到 3 个中文主题词,比如"AI基础设施""订阅制""渠道变革"。
4. worth_reading —— 这篇值不值得读者点进去读原文。判断标准是:有没有提出非显然的观点或一手信息。纯新闻转述、公关稿、榜单给 false。

只依据提供的文本作判断。如果给的是文章开头部分,基于开头能看出的内容作答即可。
必须返回 JSON。"""

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


def needs_summary(post: dict) -> bool:
    if not (post.get("raw_text") or "").strip():
        return False
    summary = post.get("summary")
    return not summary or summary.get("schema_version") != SCHEMA_VERSION


def build_prompt(post: dict, max_chars: int) -> str:
    text = post["raw_text"]
    truncated = len(text) > max_chars
    if truncated:
        text = text[:max_chars]
    header = (
        f"标题: {post['title']}\n"
        f"作者/来源: {post.get('author')} ({post.get('source')})\n"
        f"语言: {'中文' if post.get('lang') == 'zh' else '英文'}\n"
    )
    label = "正文(仅文章开头部分,原文更长):" if truncated else "正文:"
    return f"{header}\n{label}\n{text}"


def record(data: dict, model: str, tokens_in: int, tokens_out: int) -> dict:
    return {
        "schema_version": SCHEMA_VERSION,
        "summary_zh": data["summary_zh"],
        "key_points": data["key_points"],
        "topics": data["topics"],
        "worth_reading": data["worth_reading"],
        "model": model,
        "generated_at": iso(now_utc()),
        "input_tokens": tokens_in,
        "output_tokens": tokens_out,
    }


# ---------------------------------------------------------------- Claude 后端

class ClaudeBackend:
    name = "claude"
    model = CLAUDE_MODEL
    max_chars = CLAUDE_MAX_CHARS
    delay = 0.0

    def __init__(self):
        import anthropic
        self.anthropic = anthropic
        self.client = anthropic.Anthropic()
        self.use_fallback = True

    def summarize(self, post: dict) -> dict | None:
        a = self.anthropic
        kwargs = dict(
            model=self.model,
            max_tokens=2000,
            system=SYSTEM,
            messages=[{"role": "user", "content": build_prompt(post, self.max_chars)}],
            output_config={"format": {"type": "json_schema", "schema": OUTPUT_SCHEMA}, "effort": "low"},
        )
        try:
            if self.use_fallback:
                # 安全分类器拒答时自动路由到备用模型,而不是整篇丢掉
                resp = self.client.beta.messages.create(
                    betas=["server-side-fallback-2026-07-01"], fallbacks="default", **kwargs
                )
            else:
                resp = self.client.messages.create(**kwargs)
        except a.BadRequestError as exc:
            msg = str(exc).lower()
            if self.use_fallback and ("beta" in msg or "fallback" in msg):
                print("    [info] 账号不支持 server-side fallback beta,后续用普通请求")
                self.use_fallback = False
                return self.summarize(post)
            print(f"    [skip] 请求被拒: {exc}")
            return None
        except a.RateLimitError as exc:
            raise RuntimeError(f"触发限流: {exc}") from exc
        except (a.APIStatusError, a.APIConnectionError) as exc:
            print(f"    [skip] API 错误: {exc}")
            return None

        if resp.stop_reason == "refusal":
            print(f"    [skip] 模型拒答 ({getattr(getattr(resp, 'stop_details', None), 'category', '未知')})")
            return None
        try:
            data = json.loads(next(b.text for b in resp.content if b.type == "text"))
        except (StopIteration, json.JSONDecodeError) as exc:
            print(f"    [skip] 返回无法解析: {exc}")
            return None
        return record(data, self.model, resp.usage.input_tokens, resp.usage.output_tokens)

    def report(self, tin: int, tout: int) -> None:
        if self.model == "claude-opus-5":
            print(f"本轮约 ${tin / 1e6 * 5 + tout / 1e6 * 25:.3f} (Opus 5 $5/$25 per MTok)")


# --------------------------------------------------------- GitHub Models 后端

class GitHubBackend:
    """GitHub Models,免费。用 Actions 内置 GITHUB_TOKEN,workflow 需要 permissions: models: read。"""
    name = "github"
    model = GITHUB_MODEL
    max_chars = GITHUB_MAX_CHARS
    delay = REQUEST_DELAY

    def __init__(self, token: str):
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/vnd.github+json",
        })
        self.catalog_shown = False

    def show_catalog(self) -> None:
        """模型名报错时把可用列表打出来,省得靠猜。"""
        if self.catalog_shown:
            return
        self.catalog_shown = True
        try:
            r = self.session.get(GITHUB_CATALOG, timeout=20)
            r.raise_for_status()
            ids = [m.get("id") or m.get("name") for m in r.json()]
            print(f"    [info] 可用模型 ({len(ids)} 个): {', '.join(str(i) for i in ids[:25])}")
            print(f"    [info] 用仓库变量 GITHUB_MODEL 指定其中一个")
        except (requests.RequestException, ValueError, TypeError) as exc:
            print(f"    [info] 模型列表也拿不到: {exc}")

    def summarize(self, post: dict) -> dict | None:
        body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": build_prompt(post, self.max_chars)},
            ],
            "max_tokens": 1500,
            "response_format": {
                "type": "json_schema",
                "json_schema": {"name": "summary", "strict": True, "schema": OUTPUT_SCHEMA},
            },
        }
        try:
            r = self.session.post(GITHUB_ENDPOINT, json=body, timeout=90)
        except requests.RequestException as exc:
            print(f"    [skip] 网络错误: {exc}")
            return None

        if r.status_code == 429:
            raise RuntimeError(f"GitHub Models 配额用尽 (429)。剩余额度: {r.headers.get('x-ratelimit-remaining', '未知')}")
        if r.status_code in (400, 404) and self.model.lower() in r.text.lower():
            print(f"    [skip] 模型名 {self.model} 可能不对: {r.text[:180]}")
            self.show_catalog()
            return None
        if r.status_code >= 400:
            print(f"    [skip] HTTP {r.status_code}: {r.text[:200]}")
            if r.status_code in (401, 403):
                raise RuntimeError("认证失败。检查 workflow 里有没有 permissions: models: read")
            return None

        try:
            payload = r.json()
            data = json.loads(payload["choices"][0]["message"]["content"])
            usage = payload.get("usage") or {}
        except (ValueError, KeyError, IndexError, TypeError) as exc:
            print(f"    [skip] 返回无法解析: {exc}")
            return None

        for key in ("summary_zh", "key_points", "topics", "worth_reading"):
            if key not in data:
                print(f"    [skip] 返回缺字段 {key}")
                return None
        return record(data, self.model, usage.get("prompt_tokens", 0), usage.get("completion_tokens", 0))

    def report(self, tin: int, tout: int) -> None:
        print("费用: $0 (GitHub Models 免费额度)")


def pick_backend():
    choice = (os.environ.get("SUMMARY_BACKEND") or "").strip().lower()
    anthropic_key = (os.environ.get("ANTHROPIC_API_KEY") or "").strip()
    gh_token = (os.environ.get("GITHUB_TOKEN") or "").strip()

    if choice == "none":
        print("[skip] SUMMARY_BACKEND=none,跳过摘要环节。")
        return None
    if choice == "claude" or (not choice and anthropic_key):
        if not anthropic_key:
            print("[error] SUMMARY_BACKEND=claude 但没有 ANTHROPIC_API_KEY")
            return None
        try:
            return ClaudeBackend()
        except ImportError:
            print("[error] 没装 anthropic 包,跑 pip install -r requirements.txt")
            return None
    if choice == "github" or (not choice and gh_token):
        if not gh_token:
            print("[error] SUMMARY_BACKEND=github 但没有 GITHUB_TOKEN")
            return None
        return GitHubBackend(gh_token)

    print("[skip] 没有可用的摘要后端,跳过。")
    print("       免费方案: workflow 里加 permissions: models: read (用 GitHub Models)")
    print("       付费方案: 仓库 Secrets 里加 ANTHROPIC_API_KEY (用 Claude,质量更好)")
    return None


def main() -> int:
    backend = pick_backend()
    if backend is None:
        return 0

    posts = load_posts()
    pending = [p for p in posts if needs_summary(p)]
    if not pending:
        print("所有文章都已有摘要,无需处理。")
        return 0

    pending.sort(key=lambda p: p.get("published") or "", reverse=True)  # 新的先做
    batch = pending[:MAX_PER_RUN]
    print(f"待摘要 {len(pending)} 篇,本轮处理 {len(batch)} 篇")
    print(f"后端: {backend.name} / 模型: {backend.model}\n")

    done = tin = tout = 0
    for i, post in enumerate(batch, 1):
        print(f"  [{i}/{len(batch)}] {post['title'][:58]}")
        try:
            summary = backend.summarize(post)
        except RuntimeError as exc:
            print(f"  [stop] {exc}")
            break
        if summary:
            post["summary"] = summary
            tin += summary["input_tokens"]
            tout += summary["output_tokens"]
            done += 1
        if backend.delay and i < len(batch):
            time.sleep(backend.delay)

    save_posts(posts)
    print(f"\n完成 {done}/{len(batch)} 篇 | tokens: {tin:,} in / {tout:,} out")
    backend.report(tin, tout)
    if len(pending) > len(batch):
        print(f"还剩 {len(pending) - len(batch)} 篇待处理,下一轮继续。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
