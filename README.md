# jz的分身

追踪**行业大 V 的个人博客与深度访谈**的自动阅读流，主题聚焦商业分析。

只收两类内容：

- **个人博客** —— 署名个人的博客和 newsletter，不收机构号和媒体
- **采访** —— 对这些人的深度访谈，主要是访谈类播客

GitHub Actions 定时抓取，可选地用 Claude 生成中文摘要并判断是否值得细读，结果发布成网页。

**[→ 在线阅读](https://z2099714553-crypto.github.io/jz-/)**（需先按下面的步骤开启 GitHub Pages）

## 它做什么

每 3 小时跑一次：

1. `scripts/fetch.py` 抓取 `feeds.yml` 里的所有源，增量合并进 `data/posts.json`
2. `scripts/summarize.py` 给新文章生成中文摘要、要点和主题词，并判断 `worth_reading`
3. `scripts/render.py` 渲染 `docs/index.html` 和本页下方的最新列表
4. 变更提交回仓库

已经生成过的摘要永不重算 —— 每篇文章只花一次钱。

## 启用步骤

### 1. 开启 GitHub Pages

仓库 **Settings → Pages → Source** 选 **Deploy from a branch**，分支选 `main`，目录选 `/docs`。
免费版 Pages 要求仓库是 public。

### 2. 中文摘要（可选，默认关闭）

**默认不生成摘要，整套东西零成本运行** —— 抓取、去重、网页、README 全都照常，
只是每篇文章显示「摘要待生成」，英文源保持英文标题和原文摘录。

想要中文摘要就加一个 secret：**Settings → Secrets and variables → Actions → New repository secret**

| 名称 | 值 |
|---|---|
| `ANTHROPIC_API_KEY` | 在 [console.anthropic.com](https://console.anthropic.com/) 申请 |

加了之后每轮自动给新文章生成中文摘要、要点和「是否值得读」判断。
同一页面的 **Variables** 标签（不是 Secrets）可以调：

| 变量 | 默认 | 说明 |
|---|---|---|
| `SUMMARY_MODEL` | `claude-opus-5` | 换成 `claude-haiku-4-5` 成本约为 1/5 |
| `MAX_SUMMARIES_PER_RUN` | `25` | 每轮最多处理多少篇，成本的硬上限 |
| `SUMMARY_BACKEND` | 自动 | 设成 `none` 可强制关闭摘要 |

## 保留期

超过 **90 天**的文章会在每轮抓取时从 `data/posts.json` 清掉，防止库无限增长。
用仓库变量 `RETENTION_DAYS` 可以改（比如 `180` 表示留半年）。

没有发布时间的文章按抓取时间算，不会因为缺字段而永远留着。

按当前每天约 3.2 篇的更新速度，90 天保留期意味着库稳定在 **300 篇上下、约 3 MB**，
不再继续增长。

按每天约 30 篇新文章估算：Opus 5 约 $15–20/月，Haiku 4.5 约 $3–4/月。
每轮实际花费会打印在 Actions 日志里。

> **关于免费摘要**：GitHub Models 曾经是可行的免费方案（Actions 内置 token 即可调用），
> 但该服务已于 2026-07-30 彻底关停，现在请求返回 `410 github_models_retirement_brownout`。
> 相关代码已移除，不要再尝试。

### 3. 手动跑一次

**Actions → 更新阅读流 → Run workflow**。第一次会回溯最近 45 天的文章。

## 管理订阅源

编辑 `feeds.yml`。每个源必须标 `type: blog`（个人博客）或 `type: interview`（采访）。

地址有三种写法，播客推荐用后两种 —— 播客的 RSS 托管方五花八门，靠猜命中率很低，
但 Apple 的公开接口能直接给出准确地址：

```yaml
  - name: 某人的博客
    url: https://example.com/feed        # 直接写 RSS 地址
    type: blog

  - name: 某访谈节目
    apple_id: 1634356920                 # Apple Podcasts 的节目 ID,自动解析
    type: interview

  - name: 另一档节目
    apple_search: 节目名称                # 按名字搜索,取第一个结果
    type: interview
```

用 `apple_search` 时，解析到的节目名会记进 `data/health.json`，可以核对有没有匹配错节目。

停用某个源用 `enabled: false`，不用删掉 —— **停用后它此前抓到的文章也会自动从库里清掉**。

每轮抓取的结果记在 `data/health.json`，Actions 的运行摘要页会列出失败的源。连续失败 3 次以上的源会在网页顶部标出来。

中文公众号（刘润、42章经等）没有官方 RSS，需要自建 RSSHub 才能抓 —— 见 [docs/SOURCES.md](docs/SOURCES.md)。

## 本地运行

```bash
pip install -r requirements.txt
python scripts/fetch.py
ANTHROPIC_API_KEY=sk-ant-... MAX_SUMMARIES_PER_RUN=3 python scripts/summarize.py
python scripts/render.py
open docs/index.html
```

## 最新文章

<!-- POSTS:START -->
*更新于 2026-11-11 06:22 UTC*

**[Spying makes a comeback](https://marginalrevolution.com/marginalrevolution/2026/11/spying-makes-a-comeback.html?utm_source=rss&utm_medium=rss&utm_campaign=spying-makes-a-comeback)**  
`Tyler Cowen` · 刚刚  

**[Following: Jensen Huang’s affair with an alleged Chinese spy and GPU smuggler](https://www.platformer.news/following-jensen-huangs-affair-with-an-alleged-chinese-spy-and-gpu-smuggler/)**  
`Casey Newton` · 5 小时前  

**[Are RCTs underpowered?](https://marginalrevolution.com/marginalrevolution/2026/11/are-rcts-underpowered.html?utm_source=rss&utm_medium=rss&utm_campaign=are-rcts-underpowered)**  
`Tyler Cowen` · 10 小时前  

**[Tuesday assorted links](https://marginalrevolution.com/marginalrevolution/2026/11/tuesday-assorted-links-594.html?utm_source=rss&utm_medium=rss&utm_campaign=tuesday-assorted-links-594)**  
`Tyler Cowen` · 13 小时前  

**[State of the tech job market: late 2026](https://www.lennysnewsletter.com/p/state-of-the-tech-job-market-late)**  
`Lenny Rachitsky` · 15 小时前  

**[Checking the AI audit of Saez and Zucman’s research.](https://marginalrevolution.com/marginalrevolution/2026/11/checking-the-ai-audit-of-saez-and-zucmans-research.html?utm_source=rss&utm_medium=rss&utm_campaign=checking-the-ai-audit-of-saez-and-zucmans-research)**  
`Tyler Cowen` · 18 小时前  

**[The Jensen Huang Story Gets Worse, Washington vs. New York, Silicon Valley](https://stratechery.com/2026/the-jensen-huang-story-gets-worse-washington-vs-new-york-silicon-valley/)**  
`Ben Thompson` · 19 小时前  

**[*Godzilla: Minus Zero* (no spoilers)](https://marginalrevolution.com/marginalrevolution/2026/11/godzilla-minus-zero-no-spoilers.html?utm_source=rss&utm_medium=rss&utm_campaign=godzilla-minus-zero-no-spoilers)**  
`Tyler Cowen` · 21 小时前  

**[*Unbeatable: The Brutally Honest Case for Free Markets*](https://marginalrevolution.com/marginalrevolution/2026/11/unbeatable-the-brutally-honest-case-for-free-markets.html?utm_source=rss&utm_medium=rss&utm_campaign=unbeatable-the-brutally-honest-case-for-free-markets)**  
`Tyler Cowen` · 1 天前  

**[We Are All Junior Talent Now](https://tomtunguz.com/we-are-all-junior-talent-now/)**  
`Tomasz Tunguz` · 1 天前  

**[E258｜聊聊硅谷创业“修道院”HF0与OpenRouter早期故事](https://sv101.fireside.fm/272)**  
`陈茜` · 1 天前  

**[Claude Fable 5.2 review: fast, creative, and finally not annoying](https://www.lennysnewsletter.com/p/claude-fable-52-review-fast-creative)**  
`Lenny Rachitsky` · 1 天前  

**[Monday assorted links](https://marginalrevolution.com/marginalrevolution/2026/11/monday-assorted-links-585.html?utm_source=rss&utm_medium=rss&utm_campaign=monday-assorted-links-585)**  
`Tyler Cowen` · 1 天前  

**[🎙️ How I AI: How this founder built a better Duolingo with Codex](https://www.lennysnewsletter.com/p/how-i-ai-how-this-founder-built-a)**  
`Lenny Rachitsky` · 1 天前  

**[How this founder built a better Duolingo with Codex \| William Imoh](https://www.lennysnewsletter.com/p/how-this-founder-built-a-better-duolingo)**  
`Lenny Rachitsky` · 1 天前  

<!-- POSTS:END -->
