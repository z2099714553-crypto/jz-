# 规则拆解视频模板

写一份 JSON 脚本，输出一条 55 到 65 秒的竖版视频（1080×1920），同一份脚本还能出一条横版（1920×1080）。

- 第 0 帧就是满屏大字结论，没有淡入
- 3 到 5 个要点，每个都可以挂一张图（条形图或折线图），数值随动画往上跳
- 字幕按口播自动断句、自动计时，落在各平台界面遮挡之外的安全区
- 顶部是分段进度条，告诉观众还剩几段

## 一期的流程

```bash
npm install                                   # 只需第一次
cp episodes/ep01-kanyidao.json episodes/ep02-xxx.json
# 改脚本 ……
npm run check -- episodes/ep02-xxx.json       # 看时间轴、字幕切分、时长够不够
npm run studio                                # 预览，右侧面板可以直接改 props
npm run render -- episodes/ep02-xxx.json      # 出 out/ep02-xxx-竖版.mp4 和 -横版.mp4
```

`npm run render` 会先跑检查，时长不在 55 到 65 秒就拒绝渲染，并告诉你大约要加几个字或删几个字。
只要竖版：`npm run render -- episodes/xxx.json --only=vertical`。

需要 Node 22.6 或更高版本，检查脚本直接用 Node 跑 TypeScript。

## 脚本格式

```jsonc
{
  "title": "规则拆解 · 砍一刀",            // 顶部小字
  "hook": {
    "text": "最后 **1%** 才是真正的门槛",  // 开头大字，**包起来** 的部分用强调色，最好不超过 14 字
    "narration": "砍一刀砍到99%很快，……"   // 口播，即字幕内容
  },
  "points": [                               // 3 到 5 个
    {
      "text": "每一刀只砍剩下的一小部分",    // 要点标题，最好不超过 16 字
      "narration": "……",
      "chart": {                            // 可选
        "type": "bar",                      // bar 条形图 | line 折线图
        "title": "砍到这个进度需要多少人",
        "unit": "人",
        "items": [{"label": "50%", "value": 9}, {"label": "99%", "value": 56}],
        "highlight": 1,                     // 高亮第几项，从 0 开始，默认最后一项
        "source": "数据来源，必须写"
      }
    }
  ],
  "outro": {"text": "结论重申", "narration": "……", "cta": "关注，下周拆下一条规则"},

  "voiceover": "ep02.mp3",                  // 可选，放在 public/ 下
  "accent": "#FF5A36",                      // 可选，强调色
  "charsPerSecond": 4.5                     // 可选，语速
}
```

### 配图

开头、每个要点、结尾都可以加一个 `"visual"`，挂在大字或标题下面。要点里已经有 `chart` 的，优先显示图表。

| type | 画的是什么 | 字段 |
|---|---|---|
| `progress` | 砍价式进度条：前 95% 一下冲上去，剩下的慢慢挪 | `value` 百分比，`label`，`note` 底下一行字 |
| `people` | 小人方阵一个个蹦出来，计数往上跳 | `count` 人数（最多画 100 个），`highlight` 最后几个标成强调色，`label` |
| `network` | 中心是"你"，连线射向一圈人 | `count`（最多 24），`center` 中心文字，`label` |
| `number` | 一个大数字从 0 跳上去 | `value`，`unit`，`label` |
| `image` | 你自己的图片或截图，缓慢推近 | `src` 是 public/ 下的文件名，`caption` |

```jsonc
"visual": {"type": "people", "count": 50, "label": "个人已经帮你砍过"}
"visual": {"type": "image", "src": "kanjia-screenshot.png", "caption": "某平台活动页截图"}
```

### 时长怎么算

每段时长按口播字数估算：汉字和数字各算 1 个音节，`%` 算 3 个（读作"百分之"），标点算半个停顿，默认语速每秒 4.5 字。
带图的要点至少 4.5 秒，给动画留时间。

**录了配音以后**，在每段加上 `"seconds": 实际秒数`，覆盖估算值，字幕就会跟着配音走。
配音文件放进 `public/`，脚本里写 `"voiceover": "文件名"`。

## 文件

| 路径 | 作用 |
|---|---|
| `src/lib/timeline.ts` | 脚本格式、时长估算、字幕切分、校验。不依赖任何包 |
| `src/lib/layout.ts` | 竖版和横版的安全区、字号 |
| `src/lib/theme.ts` | 配色和字体 |
| `src/scenes/` | 开头、要点、结尾三种场景 |
| `src/components/` | 条形图、折线图、字幕、进度条 |
| `src/components/visuals/` | 配图：进度条、小人方阵、关系网、大数字、图片 |
| `episodes/` | 每期一份脚本 |

## 示例这期的数据

`episodes/ep01-kanyidao.json` 里的数字来自一个示意模型：每刀砍掉剩余金额的 8%。
它不是任何平台的真实参数，正式发之前，换成真实数据或你自己的模拟结果。
