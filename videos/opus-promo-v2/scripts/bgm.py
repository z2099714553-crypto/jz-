"""Lay the previous video's BGM (assets/bgm.m4a) under the timeline -> public/music.wav.

Trims to the video length, fades in/out, and ducks the music while the voice speaks.
Usage: python3 scripts/bgm.py   (requires ffmpeg)
"""
import json, os, subprocess
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
DUCK = float(os.environ.get("DUCK", "0.42"))  # music gain while the voice speaks
BED = float(os.environ.get("BED", "0.8"))     # music gain otherwise

tl = json.load(open(os.path.join(ROOT, "src/timeline.json"), encoding="utf-8"))
FPS = tl["fps"]
T = tl["totalFrames"] / FPS
N = int(T * SR)

tmp = os.path.join(ROOT, "public/.bgm.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(ROOT, "assets/bgm.m4a"),
                "-ac", "2", "-ar", str(SR), tmp], check=True)
x, _ = sf.read(tmp, dtype="float32")
os.remove(tmp)
if len(x) < N:  # loop if the video ever outgrows the track
    x = np.concatenate([x] * (N // len(x) + 1))
x = x[:N].copy()

gain = np.full(N, BED)
for s in tl["scenes"]:
    a = (s["from"] + s["voiceFrom"]) / FPS - 0.1
    b = a + 0.1 + s["voiceFrames"] / FPS + 0.15
    gain[int(a * SR): min(int(b * SR), N)] = DUCK
k = int(0.25 * SR)
gain = np.convolve(np.pad(gain, k, mode="edge"), np.ones(k) / k, mode="same")[k:-k]

fi, fo = int(0.3 * SR), int(2.0 * SR)
gain[:fi] *= np.linspace(0, 1, fi)
gain[-fo:] *= np.linspace(1, 0, fo) ** 2
x *= gain[:, None]
sf.write(os.path.join(ROOT, "public/music.wav"), x, SR)
print(f"music.wav {T:.1f}s from assets/bgm.m4a")
