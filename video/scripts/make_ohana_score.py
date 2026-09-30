"""为《零极限 · 家》合成声音：海浪声 + 配乐，输出 public/ohana/score.wav。

全部用程序合成（噪声滤波做海浪，正弦波叠加做乐器），不使用任何外部音频素材。
时间点与 src/ohana/script.ts 和各场景动画对齐（30fps）。
目前完成第一章（0–36 秒），之后的章节做好画面后再补。

运行：
    pip install numpy
    npm run score:ohana
"""

import sys
import wave
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_score import SR, bell, env_adsr, hz, pad_voice, place, pluck, reverb  # noqa: E402

TOTAL = 178.0
FPS = 30
OUT = Path(__file__).resolve().parent.parent / "public" / "ohana" / "score.wav"
rng = np.random.default_rng(11)


def buf(seconds: float) -> np.ndarray:
    return np.zeros((2, int(seconds * SR)))


def f2s(frame: float, scene_start: float) -> float:
    return scene_start + frame / FPS


# ── 海浪 ────────────────────────────────────────────────────

def filtered_noise(n: int, lo: float, hi: float, tilt: float) -> np.ndarray:
    """频域里做带通 + 斜率，速度快；tilt < 0 越往高频越弱"""
    spec = np.fft.rfft(rng.normal(0, 1, n))
    f = np.fft.rfftfreq(n, 1 / SR)
    edge = 0.25
    shape = np.clip(np.minimum((f - lo * (1 - edge)) / (lo * edge + 1e-9), 1), 0, 1) * np.clip((hi * (1 + edge) - f) / (hi * edge), 0, 1)
    shape *= np.power(np.maximum(f, 20) / 200, tilt)
    y = np.fft.irfft(spec * shape, n)
    return y / (np.std(y) + 1e-12)


def swell_envelope(n: int, seed: int) -> np.ndarray:
    """一浪接一浪：缓缓涌起，拍岸后慢慢退去"""
    r = np.random.default_rng(seed)
    env = np.zeros(n)
    t = r.uniform(0, 2.0)
    while t * SR < n:
        period = r.uniform(5.5, 8.5)
        rise, fall = period * 0.42, period * 0.9
        peak = r.uniform(0.6, 1.0)
        i0, i1, i2 = int(t * SR), int((t + rise) * SR), int((t + rise + fall) * SR)
        up = np.linspace(0, 1, max(1, i1 - i0)) ** 2.2
        down = np.exp(-np.linspace(0, 4, max(1, i2 - i1)))
        seg = np.concatenate([up, down]) * peak
        end = min(n, i0 + len(seg))
        env[i0:end] = np.maximum(env[i0:end], seg[: end - i0])
        t += period * r.uniform(0.75, 1.0)
    return env


def ocean(seconds: float) -> np.ndarray:
    n = int(seconds * SR)
    out = np.zeros((2, n))
    for ch, seed in enumerate((3, 8)):
        env = swell_envelope(n, seed)
        dark = filtered_noise(n, 40, 700, -0.9)
        bright = filtered_noise(n, 500, 7000, -0.6)
        out[ch] = (0.35 + 0.65 * env) * dark * 0.5 + env ** 1.6 * bright * 0.35
    # 两声道稍微混一点，听起来像一片海而不是两股噪声
    mix = out.copy()
    mix[0] = out[0] * 0.8 + out[1] * 0.2
    mix[1] = out[1] * 0.8 + out[0] * 0.2
    return mix


def water_drop() -> np.ndarray:
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 700 + 1100 * (1 - np.exp(-t / 0.02))
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(phase) * np.exp(-t / 0.06) * env_adsr(n, 0.002, 0.05)


def drum(seconds: float = 1.2) -> np.ndarray:
    """低沉的鼓（pahu 的感觉）：音高下滑的低频正弦 + 一点皮面噪声"""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    f = 55 + 45 * np.exp(-t / 0.05)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.35)
    skin = rng.normal(0, 1, n) * np.exp(-t / 0.015) * 0.15
    return (body + skin) * env_adsr(n, 0.002, 0.2)


# ── 第一章 · 海的中央（0–36 秒） ──────────────────────────────

def chapter1() -> np.ndarray:
    L = 40.0  # 多留几秒让尾音和海浪自然淡出
    mix = buf(L)

    # 海浪贯穿整章，开头从无到有，章末渐弱
    sea = ocean(L)
    n = sea.shape[1]
    t = np.arange(n) / SR
    level = np.interp(t, [0, 2.5, 5, 30, 36, 39.5], [0, 1, 0.8, 0.55, 0.5, 0])
    mix += sea * level * 0.3

    def pad(t0, t1, notes, gain, attack=2.5, release=2.5):
        for i, nm in enumerate(notes):
            place(mix, pad_voice(hz(nm), t1 - t0, attack=attack, release=release), t0, gain * (0.7 if i == 0 else 0.85), pan=(i - 1.5) * 0.3)

    # 02 岛屿与海雾：Bm(add9)，深而空
    pad(5.0, 11.8, ["B1", "F#3", "C#4", "D4"], 0.05, attack=3.5)
    # 03 围坐：G 大七
    pad(11.0, 17.8, ["G1", "D3", "F#3", "B3"], 0.05)
    # 04 松开之前：Em9，kala 之后转到 D 大调
    kala = f2s(166, 17)
    pad(17.0, kala + 0.8, ["E2", "B2", "G3", "F#4"], 0.055, release=1.2)
    pad(kala, 30.8, ["D2", "A2", "F#3", "E4"], 0.06, attack=0.8)
    # 06 字母归位后：G/D，温暖地收住
    settle = f2s(150, 30)
    pad(29.5, settle + 0.4, ["D2", "A2", "D3", "A3"], 0.05, release=1.0)
    pad(settle, 39.5, ["D2", "G2", "B3", "D4"], 0.06, attack=0.6, release=3.5)

    # 01 海平线亮起时一个极轻的高音
    place(mix, bell(hz("A5"), 5.0), 1.2, 0.05, 0.2)

    # 03 长者出现：一记低鼓；之后缓慢的心跳般的鼓，直到 kala
    place(mix, bell(hz("D4"), 4.0), f2s(10, 11), 0.08, -0.2)
    beat = 11.4
    while beat < kala - 0.2:
        place(mix, drum(), beat, 0.16, 0.0)
        beat += 1.5

    # 04 线一根根松开，最后一起松开
    for i, (fr, nm) in enumerate(zip([58, 80, 100, 120, 140], ["B4", "A4", "F#4", "E4", "D4"])):
        place(mix, pluck(hz(nm)), f2s(fr, 17), 0.2, -0.4 + i * 0.2)
    place(mix, bell(hz("D5"), 5.0), kala, 0.16, -0.15)
    place(mix, bell(hz("A5"), 5.0), kala + 0.12, 0.12, 0.15)
    place(mix, bell(hz("F#5"), 5.0), kala + 0.24, 0.08, 0.0)

    # 05 碗：水滴，以及缓慢的琶音
    for i, fr in enumerate([20, 72, 124]):
        place(mix, water_drop(), f2s(fr, 24), 0.2, (-0.3, 0.2, 0.0)[i])
    for k, nm in enumerate(["D4", "A4", "F#4", "E4", "D4", "A4", "B4", "A4"]):
        place(mix, pluck(hz(nm)), 24.4 + k * 0.7, 0.07, -0.3 + (k % 3) * 0.3)

    # 06 字母逐个浮现：D 大调五声音阶一路向上；归位前一阵上扬，归位时一声钟
    scale = ["D4", "E4", "F#4", "A4", "B4", "D5", "E5", "F#5", "A5", "B5", "D6", "E6"]
    for i, nm in enumerate(scale):
        place(mix, pluck(hz(nm)), f2s(8 + i * 7, 30), 0.1 + 0.004 * i, -0.5 + i / 11)
    place(mix, bell(hz("D5"), 6.0), settle, 0.14, -0.1)
    place(mix, bell(hz("A5"), 6.0), settle + 0.15, 0.1, 0.1)

    return reverb(mix, seconds=3.2, wet=0.34)


def main() -> None:
    full = buf(TOTAL)
    c1 = chapter1()
    full[:, : c1.shape[1]] += c1

    peak = np.max(np.abs(full))
    full *= 0.89 / peak
    pcm = (np.clip(full.T, -1, 1) * 32767).astype("<i2")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"已写入 {OUT}  时长 {full.shape[1] / SR:.1f}s")


if __name__ == "__main__":
    main()
