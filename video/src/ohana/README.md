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

五章都已完成。`scenes/Placeholder.tsx` 只在新增场景还没画面时兜底，显示场号和分镜说明。

```bash
npx remotion render Ohana-1-Sea out/ohana-ch1.mp4
npx remotion render Ohana-Full out/ohana.mp4
```

## 照片

照片放在 `public/photos/`，抠图放在 `public/ohana/cutouts/`。
这两个目录在 `.gitignore` 里：仓库是公开的，家人照片不上传。
在别的电脑上预览第四、五章，需要把照片和抠图都放回这两个目录。照片的文件名：

| 文件名 | 内容 |
|---|---|
| `mom.jpg` | 图 1，妈妈和我 |
| `dad.jpg` | 图 2，爸爸和我 |
| `niannian_window.jpg` | 图 3，窗台上的念念 |
| `niannian_sofa.jpg` | 图 4，沙发上的念念 |
| `niannian_table.jpg` | 图 5，茶几上的念念 |

抠图用 rembg：人物是 `birefnet-portrait`，爸爸那张和三张猫是 `birefnet-general`，没有开 alpha matting。
两张合照沿接触线手工拆成单人（`mom.png`、`me_a.png`、`dad.png`、`me_b.png`）。
第四章拍肩和第五章全家合影要用的分层图，由下面的脚本从抠图生成：

```bash
python scripts/prepare_ohana_layers.py   # 需要 numpy、scipy、opencv-python-headless、pillow
```

## 画面结构

所有场景都在 1920×1080 的坐标里画，`common.tsx` 里的 `Stage` 把它缩放进竖屏中间的横向画面框，上下留黑。

| 文件 | 内容 |
|---|---|
| `Film.tsx` | 按时间轴排场景，相邻两场交叉淡化；整片和各章共用 |
| `Subtitle.tsx` | 小标签、逐字淡入、红点、英文；长句自动断行；第 10、20、28 场分句轮播 |
| `Photo.tsx` | 人物照片层：呼吸、摆动、暖色调、发丝衣角的局部飘动；只落在人物身上的光影 |
| `Cat.tsx` | 念念的照片层：呼吸、眨眼（用真实的毛滑成眼皮）、耳朵抖动 |
| `scenes/Ch1Sea.tsx` | 第一章：海平线、火山岛、围坐、松开的线、海藻、字母归位 |
| `scenes/Ch2Phrases.tsx` | 第二章：老照片、病历与台灯、飞过海的书、四句话 |
| `scenes/Ch3Distance.tsx` | 第三章：航线地图、分屏时差、北仑港、海边背影 |
| `scenes/Ch4Home.tsx` | 第四章：妈妈、光点、爸爸、拍肩、两张照片、四句话 |
| `scenes/Ch5Niannian.tsx` | 第五章：「0」、三张念念、全家、四句话、特写、片尾 |
| `scenes/Seascape.tsx` | 共用的海面与星空 |
| `scenes/Placeholder.tsx` | 新增场景还没画面时的占位 |
| `theme.ts` | 夏威夷章节的深蓝海色、家庭章节的暖米白、字体 |

## 字体与声音

- 字体子集在 `public/ohana/fonts/`，改台词出现新字后运行 `npm run fonts:ohana`。
- 海浪声和配乐由 `scripts/make_ohana_score.py` 合成，不用任何音频素材。改了时间轴后运行 `npm run score:ohana`（需要 numpy）。
