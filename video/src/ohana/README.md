# 《零极限 · 家》

竖屏宣传片，1080×1920，30fps，2 分 58 秒。只有字幕，没有旁白。
台词与分镜见 `script.md`，程序用的数据在 `script.ts`。

## 预览与渲染

```bash
cd video
npm install
npm run dev
```

Studio 左侧「零极限-家」文件夹里，每一章一个 Composition，外加整片：

| Composition | 内容 | 时间 |
|---|---|---|
| `Ohana-1-Sea` | 第一章 · 海的中央 | 0:00–0:36 |
| `Ohana-2-FourPhrases` | 第二章 · 四句话 | 0:36–1:01 |
| `Ohana-3-8000km` | 第三章 · 八千公里 | 1:01–1:24 |
| `Ohana-4-Home` | 第四章 · 家 | 1:24–2:00 |
| `Ohana-5-Niannian` | 第五章 · 念念 | 2:00–2:58 |
| `Ohana-Full` | 整片 | 0:00–2:58 |

还没做完的场景显示占位画面（场号 + 分镜说明），字幕照常出现，方便先看整片节奏。

```bash
npx remotion render Ohana-1-Sea out/ohana-ch1.mp4
npx remotion render Ohana-Full out/ohana.mp4
```

## 照片

照片放在 `public/photos/`，抠图放在 `public/ohana/cutouts/`。
这两个目录在 `.gitignore` 里：仓库是公开的，家人照片不上传。
在别的电脑上预览，需要自己把照片放进 `public/photos/`：

| 文件名 | 内容 |
|---|---|
| `mom.jpg` | 图 1，妈妈和我 |
| `dad.jpg` | 图 2，爸爸和我 |
| `niannian_window.jpg` | 图 3，窗台上的念念 |
| `niannian_sofa.jpg` | 图 4，沙发上的念念 |
| `niannian_table.jpg` | 图 5，茶几上的念念 |

## 画面结构

所有场景都在 1920×1080 的坐标里画，`common.tsx` 里的 `Stage` 把它缩放进竖屏中间的横向画面框，上下留黑。

| 文件 | 内容 |
|---|---|
| `Film.tsx` | 按时间轴排场景，相邻两场交叉淡化；整片和各章共用 |
| `Subtitle.tsx` | 小标签、逐字淡入、红点、英文；长句自动断行；第 10、20、28 场分句轮播 |
| `scenes/Ch1Sea.tsx` | 第一章六场 |
| `scenes/Placeholder.tsx` | 未完成场景的占位画面 |
| `theme.ts` | 夏威夷章节的深蓝海色、家庭章节的暖米白、字体 |

## 字体与声音

- 字体子集在 `public/ohana/fonts/`，改台词出现新字后运行 `npm run fonts:ohana`。
- 海浪声和配乐由 `scripts/make_ohana_score.py` 合成，不用任何音频素材。改了时间轴后运行 `npm run score:ohana`（需要 numpy）。
