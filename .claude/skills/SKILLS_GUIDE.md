# 本仓库已安装的 skills

全部放在 `.claude/skills/` 下，在本仓库里打开 Claude Code 就会自动加载。
标了「只能手动」的要自己输入 `/名字` 才会启动，其余的 Claude 判断相关时会自动调用。

| skill | 一句话作用 | 怎么触发 | 来源（安装时的 commit） |
|---|---|---|---|
| `find-skills` | 帮你搜索、安装新的 skill（`npx skills find/add`） | 自动；「有没有做 X 的 skill」 | [vercel-labs/skills](https://github.com/vercel-labs/skills/tree/main/skills/find-skills) `18f96ea` |
| `i-have-adhd` | 改变 Claude 的回答方式：第一句就给下一步动作、步骤编号、每轮报进度、列表不超过 5 项、不说客套话 | 只能手动 `/i-have-adhd`；说「stop adhd mode」关闭 | [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) `839872f` |
| `planning-with-files-zh` | 把计划写进 `task_plan.md` / `findings.md` / `progress.md`，跨会话、上下文压缩后都能接着干 | 自动；「帮我规划」「拆解项目」或 `/planning-with-files-zh` | [OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files)（中文版）`dab9d16` |
| `brainstorming` | 动手前先把需求问清楚、出设计方案，你批准后才允许写代码 | 自动（任何「做个新功能」类请求都会触发） | [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills/brainstorming) `8ca22db` |
| `handoff` | 把当前对话压缩成一份交接文档，换新会话/换 agent 时不丢上下文 | 只能手动 `/handoff 下个会话要做什么` | [mattpocock/skills](https://github.com/mattpocock/skills/tree/main/skills/productivity/handoff) `4588b32` |
| `grill-me` + `grilling` | 一轮一轮地追问你的计划，每个问题附推荐答案，直到没有隐含假设 | `/grill-me`，或说「grill me / 拷问一下这个想法」 | 同上，`grill-me` 只是调用 `grilling` 的入口 |
| `desktop-controller` | 操控 Windows 桌面：点击、打字、截屏、发微信/钉钉/飞书消息；网页用 Playwright | 自动；「操控电脑」「给某某发微信」 | [24kchengYe/desktop-controller-skill](https://github.com/24kchengYe/desktop-controller-skill) `e565ca7` |
| `anysearch` | 实时搜索：网页搜索、23 个垂直领域（金融、学术、法律……）、批量搜索、抓取网页全文 | 自动；需要查资料时 | [anysearch-ai/anysearch-skill](https://github.com/anysearch-ai/anysearch-skill) `9b91ee2`（脚本已对过 SHA256SUMS） |
| `cangjie-skill`（仓颉） | 把一本书、长视频字幕、播客、访谈「蒸馏」成一组可调用的 skill（五阶段流水线 + 三重验证 + 压力测试） | 自动；「把《XX》蒸馏成 skill」「拆书」 | [cautionsign/cangjie-skill](https://github.com/cautionsign/cangjie-skill)（袋鼠帝的 2.0 版，支持视频/播客）`f5e4b97` |

## 使用限制

- **desktop-controller 只能在你自己的 Windows 电脑上用。** 它调用 PowerShell 和 Win32 API，在 Claude Code 云端会话（Linux 容器）里不能运行。
- **anysearch 在当前云端环境连不上**：网络策略拦截了 `api.anysearch.com`（代理返回 403）。在本地电脑上可以匿名使用；要提高额度，就把 `ANYSEARCH_API_KEY=...` 写进 `.claude/skills/anysearch/.env`（已加入 gitignore，不会被提交）。想在云端用，需要在环境的网络设置里放行这个域名。
- **brainstorming 会自动触发，而且很严格**：批准设计之前不许动代码，完成后会要求调用 `writing-plans`（本仓库没装）。这一步可以用 `planning-with-files-zh` 代替。
- **仓颉** 只装了运行需要的文件（方法论、提取器、模板），没装 README 里的二维码和 star 图。

## 它们如何协作

```
想法 ──► grill-me（拷问想法，找出漏洞）
     ──► brainstorming（定需求、出设计）
     ──► planning-with-files-zh（把设计变成磁盘上的计划和进度）
            │   执行中需要资料 ──► anysearch / 内置 WebSearch
            │   执行中需要操作桌面 ──► desktop-controller（仅本地 Windows）
     ──► handoff（会话要结束了，写交接文档，下次新会话接着干）

全程可开 i-have-adhd：只改回答格式，和上面任何一个都能叠加
缺能力时 ──► find-skills 去找新的 skill 装上
读到好书/好访谈 ──► 仓颉 蒸馏成新 skill ──► 和 life-decision-guide 一样成为可调用的知识
```

`handoff` 和 `planning-with-files-zh` 是互补的：前者记录「这次对话的上下文」，
后者记录「整个任务的计划与进度」。交接文档里可以直接引用 `task_plan.md`，不用重复内容。
