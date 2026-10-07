# PIPELINE_STATE — 随机漫步的傻瓜

- **slug**: fooled-by-randomness
- **方法**: cangjie-skill v2.5（RIA-TV++），来源 github.com/kangarooking/cangjie-skill
- **源文本**: 用户上传的中译本 EPUB（中信出版社），已转为纯文本并按章切成 5 段
- **使用目的**: 用户已读完全书，用于复盘、内化与日常决策；倾向 single 输出 + 针对用户的追问题

## 进度

| 阶段 | 状态 | 产出 |
|---|---|---|
| 0 整书理解 | 已完成，用户已确认（重点：投资、职业选择、日常决策） | BOOK_OVERVIEW.md |
| 1 并行提取 | 已完成 | candidates/（约 396 条）|
| 1.5 三重验证 | 已完成，用户已确认 | verified.md、coverage-audit.md、references.md、needs-review.md |
| 1.6 晋级门 | 已完成：用户选 single，14 个能力全部 router | .cangjie/capabilities/destinations.json |
| 2 能力卡 | 已完成：14 张，R 段 41 段原文全部逐字核验 | .cangjie/capabilities/cards/、verified.yaml |
| 3 链接 | 已完成 | also_read、GLOSSARY.md、book/overview.md |
| 4 压力测试 | 已完成：路由盲测 34/34；输出评测 6/6（基线 5/6） | eval/ |
| 5 交付 | 已完成：编译 single（validate 0 error）、DIGEST、追问题；安装待用户决定 | dist/fooled-by-randomness/、DIGEST.md、QUESTIONS.md |

## 备注
- 5 个子代理已完整精读全书并返回带章节出处的笔记（阶段 0 素材）。
- EPUB 中表 1、表 3-1、表 6-1、图 6-1、图 11-1/2 只有标题无内容。
- 中文版"各方赞誉""专家推荐（刘建位）"为非作者内容，不入能力卡。
