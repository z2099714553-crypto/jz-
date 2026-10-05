"""Synthesize the voice-over offline (sherpa-onnx + Kokoro v1.1-zh) and write the timeline.

Usage: KOKORO_DIR=/path/to/kokoro-multi-lang-v1_1 python3 scripts/voice.py [--sid N]
Each scene lasts max(line["min"] * MIN_SCALE, lead + voice + tail) seconds, then its end is
snapped to the next beat of the BGM (BEAT/PHASE, measured from public/bgm-source) so cuts land on beats.
"""
import json, os, sys
import numpy as np
import sherpa_onnx
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
TAIL = float(os.environ.get("TAIL", "0.9"))  # breathing room after each line, seconds
LEAD = float(os.environ.get("LEAD", "0.35"))  # silence before the voice starts in a scene
MIN_SCALE = float(os.environ.get("MIN_SCALE", "1.4"))
# Beat grid of the previous video's BGM (112.65 BPM, first beat at 0.465s).
BEAT = float(os.environ.get("BEAT", "0.5326"))
PHASE = float(os.environ.get("PHASE", "0.465"))
OUTRO = float(os.environ.get("OUTRO", "2.0"))

kdir = os.environ.get("KOKORO_DIR", "kokoro-multi-lang-v1_1")
sid = int(sys.argv[sys.argv.index("--sid") + 1]) if "--sid" in sys.argv else 50
speed = float(os.environ.get("SPEED", "1.05"))

cfg = sherpa_onnx.OfflineTtsConfig(
    model=sherpa_onnx.OfflineTtsModelConfig(
        kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
            model=f"{kdir}/model.onnx",
            voices=f"{kdir}/voices.bin",
            tokens=f"{kdir}/tokens.txt",
            data_dir=f"{kdir}/espeak-ng-data",
            dict_dir=f"{kdir}/dict",
            lexicon=f"{kdir}/lexicon-us-en.txt,{kdir}/lexicon-zh.txt",
        ),
        num_threads=4,
    ),
    rule_fsts=f"{kdir}/phone-zh.fst,{kdir}/date-zh.fst,{kdir}/number-zh.fst",
    max_num_sentences=1,
)
tts = sherpa_onnx.OfflineTts(cfg)

lines = json.load(open(os.path.join(ROOT, "scripts/lines.json"), encoding="utf-8"))
os.makedirs(os.path.join(ROOT, "public/voice"), exist_ok=True)

timeline, start = [], 0
for i, line in enumerate(lines):
    audio = tts.generate(line.get("tts", line["text"]), sid=sid, speed=speed)
    samples = np.array(audio.samples, dtype=np.float32)
    # trim leading/trailing near-silence so cuts land on the words
    idx = np.where(np.abs(samples) > 0.01)[0]
    if len(idx):
        samples = samples[max(idx[0] - 1600, 0): idx[-1] + 2400]
    peak = np.max(np.abs(samples)) or 1.0
    samples = samples / peak * 0.89
    name = f"{i:02d}-{line['id']}.wav"
    sf.write(os.path.join(ROOT, "public/voice", name), samples, audio.sample_rate)
    vdur = len(samples) / audio.sample_rate
    dur = max(line["min"] * MIN_SCALE, LEAD + vdur + TAIL)
    end = start / FPS + dur
    if BEAT > 0:
        end = PHASE + np.ceil((end - PHASE) / BEAT) * BEAT
    frames = int(round(end * FPS)) - start
    timeline.append({
        "id": line["id"], "text": line["text"], "file": f"voice/{name}",
        "from": start, "frames": frames,
        "voiceFrom": int(round(LEAD * FPS)), "voiceFrames": int(np.ceil(vdur * FPS)),
    })
    start += frames
    print(f"{name}: voice {vdur:.2f}s scene {dur:.2f}s")

out = {"fps": FPS, "totalFrames": start + int(OUTRO * FPS), "scenes": timeline}
json.dump(out, open(os.path.join(ROOT, "src/timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"total {out['totalFrames'] / FPS:.1f}s")
