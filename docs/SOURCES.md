# 订阅源说明

## 收录标准

只收两类：**行业大 V 的个人博客**（署名个人，不是机构号或媒体）和**对这些人的深度访谈**。

按这个标准，原先的极客公园、少数派、虎嗅、36氪、品玩、机器之心、a16z、First Round Review、
HBR、Every 全部停用 —— 它们是媒体或机构，不是个人。这些条目仍保留在 `feeds.yml` 里并标了
`enabled: false`，随时可以改回来。

代价是中文内容大幅减少：停用前极客公园一家就占每轮 30 篇。补充主要靠中文访谈播客
（张小珺商业访谈录、晚点聊、硅谷101）。

## 为什么中文源比英文源少

英文商业分析圈基本人手一个 Substack 或独立博客，都带标准 RSS。中文这边最有价值的内容（刘润、42章经、caoz的梦呓、半佛仙人等）绝大多数只发微信公众号，而公众号没有对外的 RSS 接口。

`feeds.yml` 里默认启用的中文源都是有官方 RSS 的站点：虎嗅、36氪、少数派、品玩、机器之心、极客公园、阮一峰的博客。这些质量参差，但至少能稳定抓到。

## 想抓公众号怎么办

需要自己搭一个转换服务，两个常见选择：

**RSSHub** —— 开源的通用 RSS 生成器，支持几百个站点。
公共实例 `rsshub.app` 长期被限流，基本不能用于定时抓取，必须自建：

```bash
docker run -d --name rsshub -p 1200:1200 diygod/rsshub
```

部署到任意有公网 IP 的机器后，把 `feeds.yml` 里对应源的 URL 换成 `http://你的地址:1200/wechat/...`，并把 `enabled` 改成 `true`。

**wechat2rss** —— 专门做公众号转 RSS，比 RSSHub 在这一类源上更稳，但需要自己解决账号和反爬的问题。

两种方案都要自己维护，公众号的反爬策略变动频繁，做好定期修的心理准备。

## 源列表的取舍

英文源选的是持续输出原创分析的博客，不是新闻聚合：

- **战略分析**：Stratechery、Benedict Evans、Platformer
- **公司/行业研究**：Not Boring、The Generalist、SemiAnalysis、The Diff、Net Interest
- **创投视角**：a16z、Above the Crowd、Elad Gil、First Round Review
- **产品增长**：Lenny's Newsletter、Andrew Chen、Tomasz Tunguz
- **经济与管理**：Marginal Revolution、HBR

有几个源（Stratechery、The Diff、Net Interest）有付费墙，RSS 里通常只有免费文章或摘要。摘要环节会基于拿到的部分内容生成，不会假装读过全文。

## 加源

```yaml
  - name: 显示名
    url: https://example.com/feed
    lang: en          # zh 或 en
    author: 作者名
    tags: [标签一, 标签二]
```

加完手动触发一次 workflow，然后看 `data/health.json` 确认抓到了。
