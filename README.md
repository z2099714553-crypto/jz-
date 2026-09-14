# jz的分身

追踪中英文商业分析领域博客的自动阅读流。GitHub Actions 定时抓取 RSS，Claude 生成中文摘要并判断是否值得细读，结果发布成网页。

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

### 2. 配置 Claude API Key（可选，但没有就没有摘要）

**Settings → Secrets and variables → Actions → New repository secret**

| 名称 | 值 |
|---|---|
| `ANTHROPIC_API_KEY` | 你的 key，在 [console.anthropic.com](https://console.anthropic.com/) 申请 |

没配这个 secret 的话，抓取和页面照常工作，只是每篇文章显示「摘要待生成」。

### 3. 调成本（可选）

同一页面的 **Variables** 标签（不是 Secrets）：

| 变量 | 默认 | 说明 |
|---|---|---|
| `SUMMARY_MODEL` | `claude-opus-5` | 换成 `claude-haiku-4-5` 可把成本降到约 1/5 |
| `MAX_SUMMARIES_PER_RUN` | `25` | 每轮最多处理多少篇，是成本的硬上限 |

按每天约 30 篇新文章估算：Opus 5 大约 $15–20/月，Haiku 4.5 大约 $3–4/月。
每轮实际花费会打印在 Actions 日志里。

### 4. 手动跑一次

**Actions → 更新阅读流 → Run workflow**。第一次会回溯最近 45 天的文章。

## 管理订阅源

编辑 `feeds.yml`。停用某个源用 `enabled: false`，不用删掉。

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
*更新于 2026-09-14 16:03 UTC*

**[🎙️ How I AI: How two SpaceXAI designers use Grok Bot to do their jobs](https://www.lennysnewsletter.com/p/how-i-ai-how-two-spacexai-designers)**  
`Lenny Rachitsky` · 1 小时前  

**[How Grok Bot designers use AI agents to build personal sites and product prototypes \| John Bai & Peng Zheng](https://www.lennysnewsletter.com/p/how-grok-bot-designers-use-ai-agents)**  
`Lenny Rachitsky` · 3 小时前  

**[AI, Redistribution, and the Size of the Pie](https://marginalrevolution.com/marginalrevolution/2026/09/ai-redistribution-and-the-size-of-the-pie.html?utm_source=rss&utm_medium=rss&utm_campaign=ai-redistribution-and-the-size-of-the-pie)**  
`Tyler Cowen` · 4 小时前  

**[Pacing the Frontier, AI’s Digital Limits, AI Commissars](https://stratechery.com/2026/pacing-the-frontier-ais-digital-limits-ai-commissars/)**  
`Ben Thompson` · 6 小时前  

**[派评｜近期值得关注的 App](https://sspai.com/post/114577)**  
`少数派` · 6 小时前  

**[Excel AI 辅助工作流横评：数据分析高手还是照葫芦画瓢？](https://sspai.com/prime/story/ai-assisted-spreadsheeting-a-survey)**  
`少数派` · 7 小时前  

**[新 iPhone 相机如何记录照片真实性？开发者视角的猜想和尝试](https://sspai.com/post/114453)**  
`少数派` · 8 小时前  

**[Is it the screens? Or education systems?](https://marginalrevolution.com/marginalrevolution/2026/09/is-it-the-screens-or-education-systems.html?utm_source=rss&utm_medium=rss&utm_campaign=is-it-the-screens-or-education-systems)**  
`Tyler Cowen` · 9 小时前  

**[专访爆火「机器鸭」背后的硬件推手：这是个信号，未来推动新故事的并非硬件](http://www.geekpark.net/news/370269)**  
`极客公园` · 10 小时前  

**[Does AI assistance enhance or erode expertise?](https://marginalrevolution.com/marginalrevolution/2026/09/does-ai-assistance-enhance-or-erode-expertise.html?utm_source=rss&utm_medium=rss&utm_campaign=does-ai-assistance-enhance-or-erode-expertise)**  
`Tyler Cowen` · 11 小时前  

**[众测招募｜泡泡骚 Low Pro：给新 iPhone 添一件极简「背心」](https://sspai.com/post/114410)**  
`少数派` · 13 小时前  

**[派早报：美国 AI 高管呼吁放缓研发，特朗普反对](https://sspai.com/post/114539)**  
`少数派` · 17 小时前  

**[苹果的折叠屏等了十五年，体验还差临门一脚](http://www.geekpark.net/news/370231)**  
`极客公园` · 22 小时前  

**[Sunday assorted links](https://marginalrevolution.com/marginalrevolution/2026/09/saturday-assorted-links-578.html?utm_source=rss&utm_medium=rss&utm_campaign=saturday-assorted-links-578)**  
`Tyler Cowen` · 23 小时前  

**[Diversity Is Our Strength?](https://marginalrevolution.com/marginalrevolution/2026/09/diversity-is-our-strength.html?utm_source=rss&utm_medium=rss&utm_campaign=diversity-is-our-strength)**  
`Tyler Cowen` · 1 天前  

<!-- POSTS:END -->
