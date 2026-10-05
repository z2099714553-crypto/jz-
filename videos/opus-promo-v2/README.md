# Opus 宣传片 v2（Remotion）

成片：`out/opus-promo-v2.mp4`（1080×1920 / 30fps / 约 87s），封面：`out/cover.png`，台词与分镜：`SCRIPT.md`。

## 流水线

```
scripts/lines.json ──voice.py──▶ public/voice/*.wav + src/timeline.json   离线 TTS（Kokoro v1.1-zh，sherpa-onnx）
src/timeline.json  ──bgm.py────▶ public/music.wav                         上一条视频的 BGM（assets/bgm.m4a），人声处自动压低
                   （music.py 为备用的程序合成配乐：npm run music:synth）
src/ + scripts/    ──stats.mjs─▶ src/stats.json                           统计真实代码行数，写进“N 行代码”卡片
remotion render                ─▶ out/opus-promo-v2.mp4
```

## 重新生成

```bash
npm i
pip install sherpa-onnx soundfile numpy
# 下载 TTS 模型: https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_1.tar.bz2
KOKORO_DIR=./kokoro-multi-lang-v1_1 python3 scripts/voice.py --sid 62   # 改台词后重跑；--sid 3~57 为女声，58+ 为男声
python3 scripts/bgm.py
npm run studio          # 预览
npm run render          # 渲染成片
npm run cover           # 导出封面
```

改台词时，只改 `scripts/lines.json` 里的 `text`（字幕）和 `tts`（读音，英文词用中文谐音写）。镜头时长会跟着配音自动调整。

节奏参数（环境变量，传给 voice.py）：`SPEED` 语速（默认 1.05），`TAIL` 每句话后的停顿（默认 0.9s），`MIN_SCALE` 每镜最短时长倍数（默认 1.4）。镜头切点会吸附到 BGM 的节拍上（112.65 BPM）。
