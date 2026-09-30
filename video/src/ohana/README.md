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

## 念念的卡通形象

第四、五章不出现人物（爸爸、妈妈、我都用空镜和意象代替：湖上的太阳、树荫下的水洼、沙滩上的脚印），
只有念念是由照片转换的卡通形象。这里的画面与 `script.md` 原分镜不同，以代码为准。

照片放在 `public/photos/`，抠图放在 `public/ohana/cutouts/`，卡通版放在 `public/ohana/cartoon/`（片子里用的是这一份）。
这三个目录都在 `.gitignore` 里：仓库是公开的，家人的照片和由照片生成的图都不上传。
在别的电脑上预览第五章，需要把照片和抠图放回去，再生成卡通版。用到的照片：

| 文件名 | 内容 |
|---|---|
| `niannian_window.jpg` | 图 3，窗台上的念念 |
| `niannian_sofa.jpg` | 图 4，沙发上的念念 |
| `niannian_table.jpg` | 图 5，茶几上的念念 |

抠图用 rembg 的 `birefnet-general`，没有开 alpha matting。
卡通版用 AnimeGANv2 的 `celeba_distill` 生成器，在原尺寸上转换，和原图逐像素对齐，眨眼、耳朵的坐标不用改。
整体偏金；生成器会把眼睛涂成一整块黑，所以把原照片里的眼睛（瞳孔、浅金绿的虹膜、反光）柔化后贴回去；
最后沿外轮廓描一道细的暖棕线。

```bash
python scripts/make_ohana_cartoon.py   # 需要 torch、numpy、opencv-python-headless、pillow；第一次会下载 8 MB 权重
```

## 画面结构

所有场景都在 1920×1080 的坐标里画，`common.tsx` 里的 `Stage` 把它缩放进竖屏中间的横向画面框，上下留黑。

| 文件 | 内容 |
|---|---|
| `Film.tsx` | 按时间轴排场景，相邻两场交叉淡化；整片和各章共用 |
| `Subtitle.tsx` | 小标签、逐字淡入、红点、英文；长句自动断行；第 10、20、28 场分句轮播 |
| `Cat.tsx` | 念念：呼吸、眨眼（用眼睛上方的毛滑成眼皮）、耳朵抖动 |
| `scenes/Ch1Sea.tsx` | 第一章：海平线、火山岛、围坐、松开的线、海藻、字母归位 |
| `scenes/Ch2Phrases.tsx` | 第二章：老照片、病历与台灯、飞过海的书、四句话 |
| `scenes/Ch3Distance.tsx` | 第三章：航线地图、分屏时差、北仑港、海边背影 |
| `scenes/Ch4Home.tsx` | 第四章：清晨的湖、绕着太阳的光点、树荫小路、落进水洼的叶子、两张风景照、四句话 |
| `scenes/Ch5Niannian.tsx` | 第五章：「0」、三张念念、沙滩上的脚印、四句话、特写、片尾 |
| `scenes/Seascape.tsx` | 共用的海面与星空 |
| `scenes/Placeholder.tsx` | 新增场景还没画面时的占位 |
| `theme.ts` | 夏威夷章节的深蓝海色、家庭章节的暖米白、字体 |

## 字体与声音

- 字体子集在 `public/ohana/fonts/`，改台词出现新字后运行 `npm run fonts:ohana`。
- 海浪声和配乐由 `scripts/make_ohana_score.py` 合成，不用任何音频素材。改了时间轴后运行 `npm run score:ohana`（需要 numpy）。
