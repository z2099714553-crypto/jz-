# 《一根算筹》

一条约 104 秒、只有字幕没有旁白的短片。从一根算筹讲到 Claude，最后落回这根算筹。

## 预览与渲染

```bash
cd video
npm install
npm run dev                        # Studio 左侧「一根算筹」文件夹里有两个版本
npm run render:suanchou            # 横版 1920×1080 → out/suanchou.mp4
npm run render:suanchou-vertical   # 竖版 1080×1920 → out/suanchou-vertical.mp4
```

竖版是黑底中间放横向画面，和抖音上播放横屏视频的样子一致。
直接上传横版，抖音也会自动这样显示。

想渲染无声版，在命令后面加 `--props='{"music":false}'`。

## 文件说明

| 文件 | 内容 |
|---|---|
| `script.ts` | 每场的时间、标签、中英文台词。改台词只改这里 |
| `Subtitle.tsx` | 字幕样式：小标签、逐字淡入、红点细线、英文斜体 |
| `SuanChou.tsx` | 把各场按时间排好，相邻两场交叉淡化 |
| `scenes/Ancient.tsx` | 01–04：竹签落下、算筹纵横、割圆术、圆周率 |
| `scenes/Mechanical.tsx` | 05–06：帕斯卡的齿轮与进位 |
| `scenes/Modern.tsx` | 07–10：布尔、图灵纸带、晶体管、阿波罗 |
| `scenes/Claude.tsx` | 11–17 与片尾 |
| `rodNumeral.ts` | 算筹记数的纵式、横式摆法 |

## 改了台词之后

字体是按台词里用到的字下载的子集，放在 `public/suanchou/fonts/`，渲染时不联网。
台词里出现新汉字时，运行下面的命令重新下载（需要能访问 Google Fonts）：

```bash
npm run fonts
```

不重新下载也能渲染，新字会用系统自带的宋体顶上，字形会略有不同。

## 配乐

`public/suanchou/score.mp3` 由 `scripts/make_score.py` 用正弦波合成，没有使用任何音频素材。
里面的时间点与画面动画对齐，比如竹签落桌的木声、圆周率每一位对应的音、第 11 场前 1 秒的完全静音。
改了时间轴后可以重新生成：

```bash
pip install numpy
npm run score
```
