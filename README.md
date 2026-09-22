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
*更新于 2026-09-22 04:58 UTC*

**[Banning self-recursive improvement in AI models?](https://marginalrevolution.com/marginalrevolution/2026/09/banning-self-recursive-improvement-in-ai-models.html?utm_source=rss&utm_medium=rss&utm_campaign=banning-self-recursive-improvement-in-ai-models)**  
`Tyler Cowen` · 刚刚  

**[Further results on AI and labor market reallocation](https://marginalrevolution.com/marginalrevolution/2026/09/further-results-on-ai-and-labor-market-reallocation.html?utm_source=rss&utm_medium=rss&utm_campaign=further-results-on-ai-and-labor-market-reallocation)**  
`Tyler Cowen` · 10 小时前  

**[Monday assorted links](https://marginalrevolution.com/marginalrevolution/2026/09/monday-assorted-links-578.html?utm_source=rss&utm_medium=rss&utm_campaign=monday-assorted-links-578)**  
`Tyler Cowen` · 11 小时前  

**[🎙️ How I AI: Meta’s Muse review + How Warp ships 2,000 PRs a month with AI factories](https://www.lennysnewsletter.com/p/how-i-ai-metas-muse-review-how-warp)**  
`Lenny Rachitsky` · 13 小时前  

**[How Warp ships 2,000 PRs a month with AI factories \| Zach Lloyd (CEO, Warp)](https://www.lennysnewsletter.com/p/how-warp-ships-2000-prs-a-month-with)**  
`Lenny Rachitsky` · 16 小时前  

**[The Tragedy of Nikole Hannah-Jones](https://marginalrevolution.com/marginalrevolution/2026/09/the-tragedy-of-nikole-hannah-jones.html?utm_source=rss&utm_medium=rss&utm_campaign=the-tragedy-of-nikole-hannah-jones)**  
`Tyler Cowen` · 17 小时前  

**[Frontier Overhangs](https://stratechery.com/2026/frontier-overhangs/)**  
`Ben Thompson` · 18 小时前  

**[20VC: Why AI Cannot Replace Humans in Enterprise \| Why Work Processes Not Models Will Be The Most Valuable Asset in AI \| Why Europe Has Lost and Building in the US vs EU with Daniel Dines, UiPath](https://thetwentyminutevc.libsyn.com/20vc-why-ai-cannot-replace-humans-in-enterprise-why-work-processes-not-models-will-be-the-most-valuable-asset-in-ai-why-europe-has-lost-and-building-in-the-us-vs-eu-with-daniel-dines-uipath)**  
`Harry Stebbings` · 21 小时前  

**[Obama on agentic AI](https://marginalrevolution.com/marginalrevolution/2026/09/obama-on-agentic-ai.html?utm_source=rss&utm_medium=rss&utm_campaign=obama-on-agentic-ai)**  
`Tyler Cowen` · 1 天前  

**[AI Comes for the If Statement](https://tomtunguz.com/ai-comes-for-the-if-statement/)**  
`Tomasz Tunguz` · 1 天前  

**[Sunday assorted links](https://marginalrevolution.com/marginalrevolution/2026/09/sunday-assorted-links-583.html?utm_source=rss&utm_medium=rss&utm_campaign=sunday-assorted-links-583)**  
`Tyler Cowen` · 1 天前  

**[Muse](https://marginalrevolution.com/marginalrevolution/2026/09/muse.html?utm_source=rss&utm_medium=rss&utm_campaign=muse)**  
`Tyler Cowen` · 1 天前  

**[90 minutes of unfiltered product advice from Snap and Discord’s product chief \| Peter Sellis](https://www.lennysnewsletter.com/p/90-minutes-of-unfiltered-product)**  
`Lenny Rachitsky` · 1 天前  

**[Empathy gaps](https://marginalrevolution.com/marginalrevolution/2026/09/empathy-gaps.html?utm_source=rss&utm_medium=rss&utm_campaign=empathy-gaps)**  
`Tyler Cowen` · 1 天前  

**[UK productivity higher than we had thought](https://marginalrevolution.com/marginalrevolution/2026/09/uk-productivity-higher-than-we-had-thought.html?utm_source=rss&utm_medium=rss&utm_campaign=uk-productivity-higher-than-we-had-thought)**  
`Tyler Cowen` · 2 天前  

<!-- POSTS:END -->
