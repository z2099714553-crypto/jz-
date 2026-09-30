"""为《零极限 · 家》合成声音：海浪声 + 配乐，输出 public/ohana/score.wav。

全部用程序合成（噪声滤波做海浪，正弦波叠加做乐器），不使用任何外部音频素材。
时间点与 src/ohana/script.ts 和各场景动画对齐（30fps）。
五章全部完成（0–178 秒）。

运行：
    pip install numpy
    npm run score:ohana
"""

import sys
import wave
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_score import SR, bell, env_adsr, hz, pad_voice, place, pluck, reverb, swell  # noqa: E402

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


def pad_chord(mix: np.ndarray, t0: float, t1: float, notes, gain: float, attack=2.5, release=2.5) -> None:
    for i, nm in enumerate(notes):
        place(mix, pad_voice(hz(nm), t1 - t0, attack=attack, release=release), t0, gain * (0.7 if i == 0 else 0.85), pan=(i - 1.5) * 0.3)


def rustle(seconds: float = 0.45) -> np.ndarray:
    """翻纸声：高频噪声加一串细碎的起伏"""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    noise = filtered_noise(n, 900, 8000, -0.3)
    grain = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * rng.uniform(18, 26) * t + rng.uniform(0, 6)))
    env = np.minimum(t / 0.08, 1) * np.exp(-np.maximum(t - 0.08, 0) / 0.12)
    return noise * grain * env * 0.5


def crackle(seconds: float) -> np.ndarray:
    """老唱片的噼啪声和底噪"""
    n = int(seconds * SR)
    out = filtered_noise(n, 2000, 9000, -0.5) * 0.02
    clicks = rng.random(n) < 14 / SR
    idx = np.nonzero(clicks)[0]
    for i in idx:
        L = int(rng.uniform(0.0005, 0.002) * SR)
        seg = rng.normal(0, 1, L) * np.exp(-np.arange(L) / (L / 3)) * rng.uniform(0.1, 0.5)
        out[i : i + L] += seg[: max(0, min(L, n - i))]
    return out


def thump() -> np.ndarray:
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (90 + 60 * np.exp(-t / 0.03)) * t) * np.exp(-t / 0.09)
    slap = filtered_noise(n, 300, 4000, -0.5) * np.exp(-t / 0.012) * 0.4
    return body + slap


def flap() -> np.ndarray:
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    return filtered_noise(n, 150, 1800, -0.8) * np.sin(np.pi * t / t[-1]) ** 2 * 0.5


def glide(seconds: float, f0: float, f1: float) -> np.ndarray:
    """一道细长的上滑音，带一点颤音"""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    f = np.geomspace(f0, f1, n) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * t))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return tone * env_adsr(n, 0.6, 0.8)


def horn(seconds: float = 2.6) -> np.ndarray:
    """远处的船笛：两个低音叠成的和声，泛音丰富，起音慢"""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f0 in (110.0, 138.6):
        for h in range(1, 12):
            out += np.sin(2 * np.pi * f0 * h * t) / h ** 1.3
    return out / 6 * env_adsr(n, 0.35, 0.8)


def hum(seconds: float) -> np.ndarray:
    n = int(seconds * SR)
    return filtered_noise(n, 40, 220, -0.8) * 0.6


def tick(seconds: float = 0.1) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2400 * t) * 0.5 + filtered_noise(n, 1500, 8000, 0) * 0.3) * np.exp(-t / 0.01)


def chirp_phrase() -> np.ndarray:
    """一小串鸟鸣：几声快速上滑的短音"""
    n = int(0.9 * SR)
    out = np.zeros(n)
    t0 = 0.0
    for _ in range(int(rng.integers(3, 6))):
        L = int(rng.uniform(0.05, 0.09) * SR)
        t = np.arange(L) / SR
        f0 = rng.uniform(2600, 3400)
        f = f0 + rng.uniform(900, 1600) * t / t[-1]
        seg = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / t[-1]) ** 2
        i = int(t0 * SR)
        if i + L < n:
            out[i : i + L] += seg
        t0 += rng.uniform(0.09, 0.16)
    return out


def leaves(seconds: float) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / SR
    swell = 0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t + rng.uniform(0, 6)) * np.sin(2 * np.pi * 0.11 * t)
    return filtered_noise(n, 1200, 7000, -0.4) * swell * 0.3


def soft_pat() -> np.ndarray:
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 140 * t) * np.exp(-t / 0.03) + filtered_noise(n, 200, 1500, -0.6) * np.exp(-t / 0.02) * 0.5)


def purr(seconds: float, period: float) -> np.ndarray:
    """猫的呼噜：每秒二十几下的低频颤动，随呼吸一吸一呼起伏"""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    k = 0.0
    while k < seconds:
        breath = np.sin(np.pi * (k % period) / period)
        rate = 25.0 if (k % period) < period / 2 else 22.0
        L = int(0.03 * SR)
        i = int(k * SR)
        if i + L < n:
            out[i : i + L] += rng.normal(0, 1, L) * np.exp(-np.arange(L) / (0.008 * SR)) * (0.35 + 0.65 * breath)
        k += 1 / rate * rng.uniform(0.95, 1.05)
    spec = np.fft.rfft(out)
    fr = np.fft.rfftfreq(n, 1 / SR)
    spec *= np.clip((fr - 40) / 40, 0, 1) * np.clip((500 - fr) / 250, 0, 1)
    y = np.fft.irfft(spec, n)
    return y / (np.max(np.abs(y)) + 1e-9) * env_adsr(n, 0.8, 1.0)


def tink(freq: float = 2800) -> np.ndarray:
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2.7 * t)) * np.exp(-t / 0.08)


def flick() -> np.ndarray:
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    return filtered_noise(n, 2000, 9000, -0.3) * np.exp(-t / 0.01) * 0.6


def music_box(notes, t0: float, step: float, mix: np.ndarray, gain: float, offset: float) -> None:
    for k, nm in enumerate(notes):
        if nm:
            place(mix, bell(hz(nm), 1.8), t0 - offset + k * step, gain, -0.3 + (k % 5) * 0.15)


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
        pad_chord(mix, t0, t1, notes, gain, attack, release)

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


# ── 第二章 · 四句话（36–61 秒） ────────────────────────────────

def chapter2() -> np.ndarray:
    T0 = 36.0
    L = 28.0
    mix = buf(L)

    def at(t: float) -> float:
        return t - T0

    # 07 老照片：留声机的底噪，G 大调的怀旧慢音
    cr = crackle(6.6)
    cr *= np.interp(np.arange(cr.size) / SR, [0, 0.6, 5.6, 6.6], [0, 1, 1, 0])
    place(mix, cr, at(36.0), 0.5)
    pad_chord(mix, at(36.0), at(42.6), ["G2", "D3", "F#3", "B3"], 0.05, attack=1.5)
    for k, (t, nm) in enumerate([(36.6, "B4"), (37.5, "A4"), (38.4, "G4"), (39.6, "D5"), (40.5, "B4"), (41.4, "A4")]):
        place(mix, pluck(hz(nm), 3.0), at(t), 0.1, -0.2 + 0.08 * k)

    # 08 病历：Em7 → Cmaj7，每翻一页一声沙沙
    pad_chord(mix, at(41.8), at(45.2), ["E2", "B2", "D3", "G3"], 0.05)
    pad_chord(mix, at(44.8), at(48.6), ["C2", "G2", "B2", "E3"], 0.05)
    for fr in [36, 82, 128]:
        place(mix, rustle(), at(f2s(fr, 42)), 0.5, 0.25)
    place(mix, bell(hz("E5"), 4.0), at(42.4), 0.06, 0.3)

    # 09 书：合上一声闷响；飞起来后每扇一下有风声，海浪声回来
    close = f2s(30, 48)
    place(mix, thump(), at(close), 0.35, 0.0)
    sea = ocean(6.0)
    sea *= np.interp(np.arange(sea.shape[1]) / SR, [0, 1.2, 5.0, 6.0], [0, 1, 1, 0.4])
    mix[:, int(at(48.0) * SR) : int(at(48.0) * SR) + sea.shape[1]] += sea * 0.18
    fr = 38
    while fr < 150:
        place(mix, flap(), at(f2s(fr, 48)), 0.2 * (1 - (fr - 38) / 150), -0.3 * (fr - 38) / 112)
        fr += 15
    pad_chord(mix, at(48.2), at(53.4), ["D2", "A2", "F#3", "A3"], 0.055)
    for k, nm in enumerate(["D5", "E5", "F#5", "A5"]):
        place(mix, pluck(hz(nm)), at(close + 0.5 + k * 0.6), 0.09, -0.4 + k * 0.1)

    # 10 纯白底：四句话各一声钟，最后回到 D 大调
    first = 53.0 + 0.4
    slot = (8 * FPS - 12) / 4 / FPS
    pad_chord(mix, at(53.0), at(61.5), ["G2", "D3", "B3"], 0.035, attack=1.5, release=2.0)
    for k, notes in enumerate([["D5"], ["B4"], ["A4"], ["D5", "F#5"]]):
        for j, nm in enumerate(notes):
            place(mix, bell(hz(nm), 5.0), at(first + k * slot + 0.15 + j * 0.12), 0.13, (-0.2, -0.05, 0.1, 0.0)[k])
    pad_chord(mix, at(59.0), at(63.5), ["D2", "A2", "F#3", "D4"], 0.045, attack=1.2, release=2.5)

    # 第二章整体安静一些，补 2 dB 与第一章对齐
    return reverb(mix, seconds=3.0, wet=0.34) * 1.26


# ── 第三章 · 八千公里（61–84 秒） ──────────────────────────────

def chapter3() -> np.ndarray:
    T0 = 61.0
    L = 27.0
    mix = buf(L)

    def at(t: float) -> float:
        return t - T0

    def put_stereo(x: np.ndarray, t: float, gain: float) -> None:
        i = int(at(t) * SR)
        mix[:, i : i + x.shape[1]] += x[:, : mix.shape[1] - i] * gain

    # 11 地图：线从檀香山出发时一道上滑音，到北仑一声钟
    sea = ocean(6.5)
    sea *= np.interp(np.arange(sea.shape[1]) / SR, [0, 1, 5.5, 6.5], [0.3, 0.5, 0.5, 0.2])
    put_stereo(sea, 61.0, 0.18)
    pad_chord(mix, at(61.0), at(67.6), ["B1", "F#2", "A2", "D3"], 0.05, attack=1.5)
    draw0, draw1 = f2s(30, 61), f2s(150, 61)
    place(mix, glide(draw1 - draw0 + 0.4, 520, 880), at(draw0), 0.07, 0.6)
    place(mix, bell(hz("D5"), 5.0), at(draw1), 0.14, -0.4)
    place(mix, bell(hz("F#5"), 5.0), at(draw1 + 0.14), 0.1, -0.3)

    # 12 分屏：左声道檀香山的海与拨弦，右声道北仑港的低鸣与汽笛
    left = ocean(5.4)
    left[1] *= 0.15
    put_stereo(left, 67.0, 0.28)
    for k, nm in enumerate(["G4", "B4", "D5", "G5", "D5", "B4", "A4", "D5"]):
        place(mix, pluck(hz(nm)), at(67.3 + k * 0.55), 0.09, -0.85)
    right = np.zeros((2, int(5.4 * SR)))
    right[1] = hum(5.4)
    right[0] = right[1] * 0.15
    put_stereo(right, 67.0, 0.2)
    place(mix, horn(), at(68.2), 0.09, 0.8)
    settle = f2s(50, 67)
    place(mix, tick(), at(settle), 0.25, -0.6)
    place(mix, tick(), at(settle + 0.08), 0.25, 0.6)
    pad_chord(mix, at(67.0), at(72.6), ["G1", "D2", "B2", "F#3"], 0.045)

    # 13 港口：远处再一声汽笛，镜头推向海浪，浪声越来越大
    waves = ocean(5.6)
    waves *= np.interp(np.arange(waves.shape[1]) / SR, [0, 5.0, 5.6], [0.2, 0.75, 0.6])
    put_stereo(waves, 72.0, 0.4)
    place(mix, horn(3.0), at(72.4), 0.05, 0.3)
    pad_chord(mix, at(72.0), at(77.6), ["E2", "B2", "D3", "F#3"], 0.05)

    # 14 夏威夷海边的背影：浪一次次涌上来，和弦落回温暖的 G，过渡到「家」
    shore = ocean(8.5)
    shore *= np.interp(np.arange(shore.shape[1]) / SR, [0, 1, 6.5, 8.5], [0.6, 0.55, 0.45, 0])
    put_stereo(shore, 77.0, 0.3)
    pad_chord(mix, at(77.0), at(80.8), ["D2", "A2", "F#3", "A3"], 0.05)
    pad_chord(mix, at(80.4), at(86.5), ["G1", "D2", "B2", "A3"], 0.055, release=3.0)
    for k, (t, nm) in enumerate([(77.6, "F#5"), (78.5, "E5"), (79.4, "D5"), (80.8, "B4"), (81.7, "D5"), (82.6, "A4")]):
        place(mix, pluck(hz(nm), 3.0), at(t), 0.1, -0.2 + 0.08 * k)

    # 比前两章略轻，补 1 dB
    return reverb(mix, seconds=3.2, wet=0.34) * 1.12


# ── 第四章 · 家（84–120 秒） ────────────────────────────────────

def chapter4() -> np.ndarray:
    T0 = 84.0
    L = 40.0
    mix = buf(L)

    def at(t: float) -> float:
        return t - T0

    def put_stereo(x: np.ndarray, t: float, gain: float) -> None:
        i = int(at(t) * SR)
        mix[:, i : i + x.shape[1]] += x[:, : mix.shape[1] - i] * gain

    # 15 湖边的妈妈：湖水轻拍，G 大调的拨弦
    lake = ocean(12.5)
    lake *= np.interp(np.arange(lake.shape[1]) / SR, [0, 1.5, 11, 12.5], [0, 1, 0.7, 0])
    put_stereo(lake, 84.0, 0.1)
    pad_chord(mix, at(84.0), at(91.6), ["G2", "D3", "B3", "A4"], 0.05, attack=1.8)
    for k, nm in enumerate(["G4", "B4", "D5", "B4", "A4", "D5", "G5", "D5", "B4", "A4"]):
        place(mix, pluck(hz(nm), 2.4), at(84.5 + k * 0.62), 0.09, -0.35 + (k % 4) * 0.2)

    # 16 四句话绕着妈妈：每个出现时一声细钟；汇入胸口时亮起来
    for i, nm in enumerate(["D6", "B5", "A5", "G5"]):
        place(mix, bell(hz(nm), 3.0), at(f2s(8 + i * 12, 91)), 0.06, (-0.5, 0.5, -0.3, 0.3)[i])
    merge = f2s(112, 91)
    pad_chord(mix, at(91.0), at(merge + 0.3), ["C2", "G2", "E3", "B3"], 0.045, release=0.8)
    pad_chord(mix, at(merge - 0.2), at(96.8), ["G2", "D3", "B3", "D4"], 0.06, attack=0.4)
    for j, nm in enumerate(["G5", "B5", "D6"]):
        place(mix, bell(hz(nm), 4.0), at(merge + j * 0.1), 0.09, (-0.2, 0.2, 0.0)[j])

    # 17 树荫下的爸爸：鸟鸣、树叶沙沙
    put_stereo(np.vstack([leaves(11.5), leaves(11.5)]), 96.0, 0.15)
    for t, pan in [(96.8, 0.6), (98.6, -0.5), (100.9, 0.4), (103.4, -0.6), (105.2, 0.5)]:
        place(mix, chirp_phrase(), at(t), 0.035, pan)
    pad_chord(mix, at(96.0), at(102.6), ["D2", "A2", "F#3", "A3"], 0.05)
    for k, nm in enumerate(["A4", "D5", "F#5", "E5", "D5", "A4", "B4", "D5"]):
        place(mix, pluck(hz(nm), 2.4), at(96.4 + k * 0.7), 0.085, -0.3 + (k % 3) * 0.3)

    # 18 爸爸在我肩上拍两下
    for fr in [26, 44]:
        place(mix, soft_pat(), at(f2s(fr + 5, 102)), 0.4, 0.2)
    pad_chord(mix, at(102.0), at(107.6), ["E2", "B2", "G3", "D4"], 0.05)
    place(mix, bell(hz("E5"), 4.0), at(104.2), 0.07, 0.0)

    # 19 两张照片隔着一条海平线：远处的海，微苦的旋律
    far = ocean(6.5)
    far *= np.interp(np.arange(far.shape[1]) / SR, [0, 1, 5.5, 6.5], [0, 1, 1, 0])
    put_stereo(far, 107.0, 0.08)
    pad_chord(mix, at(107.0), at(110.4), ["A1", "E2", "C3", "G3"], 0.05)
    pad_chord(mix, at(110.0), at(113.6), ["D2", "A2", "F#3", "C4"], 0.05)
    for k, (t, nm) in enumerate([(107.4, "E5"), (108.3, "D5"), (109.2, "C5"), (110.4, "D5"), (111.3, "F#5"), (112.2, "A4")]):
        place(mix, pluck(hz(nm), 3.0), at(t), 0.1, -0.25 + 0.1 * k)

    # 20 四句话再出现：每句一声钟，最后回到 G 大调，留到第五章
    first = 113.0 + 0.4
    slot = (7 * FPS - 12) / 4 / FPS
    pad_chord(mix, at(113.0), at(118.0), ["C2", "G2", "E3", "B3"], 0.04, attack=1.2)
    for k, notes in enumerate([["B4"], ["C5"], ["D5"], ["G5", "B5"]]):
        for j, nm in enumerate(notes):
            place(mix, bell(hz(nm), 5.0), at(first + k * slot + 0.15 + j * 0.12), 0.12, (-0.2, -0.05, 0.1, 0.0)[k])
    pad_chord(mix, at(117.6), at(123.5), ["G2", "D3", "B3", "D4"], 0.05, attack=1.0, release=3.0)

    # 这一章以拨弦和钟声为主，比前几章轻，补 2.5 dB 对齐
    return reverb(mix, seconds=3.2, wet=0.34) * 1.33


# ── 第五章 · 念念（120–178 秒） ─────────────────────────────────

def chapter5() -> np.ndarray:
    T0 = 120.0
    L = 58.0
    mix = buf(L)

    def at(t: float) -> float:
        return t - T0

    def put_stereo(x: np.ndarray, t: float, gain: float) -> None:
        i = int(at(t) * SR)
        mix[:, i : i + x.shape[1]] += x[:, : mix.shape[1] - i] * gain

    # 21 圆缩成「0」：一道缓慢的下滑音
    place(mix, glide(4.2, 880, 440) * np.linspace(1, 0.4, int(4.2 * SR)), at(120.5), 0.05, 0.0)
    pad_chord(mix, at(120.0), at(125.4), ["G2", "D3", "G3"], 0.035, attack=0.5, release=2.0)

    # 22「0」停住；中间亮起那个「念」
    place(mix, bell(hz("D5"), 6.0), at(f2s(46, 125)), 0.16, 0.0)
    place(mix, bell(hz("D6"), 6.0), at(f2s(52, 125)), 0.05, 0.1)

    # 23 窗台：夜里的城市低鸣，八音盒响起；眨眼一声「叮」，耳朵抖一下
    city = np.vstack([hum(5.6), hum(5.6)]) * 0.5
    put_stereo(city, 129.0, 0.12)
    pad_chord(mix, at(129.0), at(134.6), ["C2", "G2", "E3", "B3"], 0.04)
    music_box(["G5", "B5", "D6", "B5", "A5", None, "G5", "E5"], 129.6, 0.55, mix, 0.07, T0)
    place(mix, tink(), at(f2s(66, 129)), 0.05, 0.1)
    for fr in (100, 112):
        place(mix, flick(), at(f2s(fr, 129)), 0.12, -0.3)

    # 24 沙发：八音盒继续
    pad_chord(mix, at(134.0), at(140.6), ["G2", "D3", "B3", "D4"], 0.04)
    music_box(["D6", "B5", "G5", "A5", "B5", None, "D6", "E6", "D6", "B5", "G5"], 134.3, 0.5, mix, 0.065, T0)
    for fr in (60, 152):
        place(mix, tink(3000), at(f2s(fr, 134)), 0.05, 0.1)
    place(mix, flick(), at(f2s(104, 134)), 0.12, 0.3)

    # 25 茶几：呼噜声跟着肚子的起伏
    pr = purr(6.4, 2.8)
    place(mix, pr, at(140.0), 0.22, 0.05)
    pad_chord(mix, at(140.0), at(146.6), ["E2", "B2", "D3", "G3"], 0.035)
    place(mix, bell(hz("B4"), 4.0), at(141.0), 0.05, -0.2)

    # 26 全家依次入场：每进来一个人，上行一个音；夏威夷的海
    hawaii = ocean(12.0)
    hawaii *= np.interp(np.arange(hawaii.shape[1]) / SR, [0, 1.5, 7.5, 10, 12], [0, 1, 1, 0.4, 0])
    put_stereo(hawaii, 146.0, 0.15)
    pad_chord(mix, at(146.0), at(152.6), ["G2", "D3", "B3", "D4"], 0.05, attack=1.2)
    for k, (fr, nm) in enumerate([(0, "G4"), (26, "B4"), (52, "D5"), (80, "G5")]):
        place(mix, pluck(hz(nm), 3.0), at(f2s(fr + 8, 146)), 0.16, (0.5, -0.5, 0.0, 0.3)[k])
        place(mix, bell(hz(nm) * 2, 3.0), at(f2s(fr + 8, 146)), 0.04, 0.0)

    # 27 背景从夏威夷的海到北仑的海：远处一声港口的汽笛
    beilun = ocean(8.0)
    beilun *= np.interp(np.arange(beilun.shape[1]) / SR, [0, 2, 6, 8], [0, 0.8, 0.8, 0])
    put_stereo(beilun, 153.0, 0.12)
    place(mix, horn(3.2), at(155.0), 0.045, 0.4)
    pad_chord(mix, at(152.0), at(155.4), ["D2", "A2", "F#3", "A3"], 0.05)
    pad_chord(mix, at(155.0), at(158.6), ["E2", "B2", "G3", "B3"], 0.05)
    for k, nm in enumerate(["B4", "A4", "G4", "D5", "B4"]):
        place(mix, pluck(hz(nm), 2.6), at(152.4 + k * 1.1), 0.09, -0.2 + 0.1 * k)

    # 28 四句话说给家人：每句一个和弦，最后一句最亮
    first = 158.0 + 0.4
    slot = (8 * FPS - 12) / 4 / FPS
    chords = [["C2", "G2", "E3", "G3"], ["D2", "A2", "F#3", "A3"], ["E2", "B2", "G3", "B3"], ["G2", "D3", "B3", "D4"]]
    tops = [["E5"], ["F#5"], ["G5"], ["G5", "B5", "D6"]]
    for k in range(4):
        t = first + k * slot
        pad_chord(mix, at(t - 0.2), at(t + slot + (1.2 if k == 3 else 0.3)), chords[k], 0.05 + 0.006 * k, attack=0.5, release=1.2)
        for j, nm in enumerate(tops[k]):
            place(mix, bell(hz(nm), 5.0), at(t + 0.15 + j * 0.12), 0.12, (-0.2, 0.2, 0.0)[j])

    # 29 念念的特写：八音盒一句，眨眼一声「叮」
    music_box(["B5", "D6", "G6"], 166.4, 0.6, mix, 0.06, T0)
    place(mix, tink(3200), at(f2s(68, 166)), 0.05, 0.0)
    pad_chord(mix, at(166.0), at(170.6), ["C2", "G2", "E3", "D4"], 0.04)

    # 片尾：圆长满时一道上扬的微光，落在 G 大调，一直渐弱到结束
    place(mix, swell(3.2, 400, 6000), at(170.3), 0.08)
    pad_chord(mix, at(170.0), at(178.0), ["G2", "D3", "B3", "A4"], 0.06, attack=1.5, release=4.5)
    for j, nm in enumerate(["G5", "B5", "D6", "A6"]):
        place(mix, bell(hz(nm), 5.0), at(172.3 + j * 0.18), 0.09, (-0.3, -0.1, 0.1, 0.3)[j])
    orbit = [f2s(60 + k * 11, 170) for k in range(8)]
    for k, t in enumerate(orbit):
        place(mix, tink(2400 + 200 * k), at(t), 0.015, -0.6 + 0.17 * k)

    out = reverb(mix, seconds=3.4, wet=0.36) * 1.25
    n = out.shape[1]
    fade = int(3.0 * SR)
    out[:, n - fade :] *= np.linspace(1, 0, fade) ** 1.5
    return out


def main() -> None:
    full = buf(TOTAL)
    c1 = chapter1()
    full[:, : c1.shape[1]] += c1
    c2 = chapter2()
    s2 = int(36.0 * SR)
    full[:, s2 : s2 + c2.shape[1]] += c2
    c3 = chapter3()
    s3 = int(61.0 * SR)
    full[:, s3 : s3 + c3.shape[1]] += c3
    c4 = chapter4()
    s4 = int(84.0 * SR)
    full[:, s4 : s4 + c4.shape[1]] += c4
    c5 = chapter5()
    s5 = int(120.0 * SR)
    full[:, s5 : s5 + c5.shape[1]] += c5[:, : full.shape[1] - s5]

    # 先按峰值对齐，再整体提升约 4 dB，超过 0.7 的部分用软限幅压住，峰值不超过 -1 dBFS
    full *= 0.89 / np.max(np.abs(full))
    full *= 1.6
    over = np.abs(full) > 0.7
    full[over] = np.sign(full[over]) * (0.7 + 0.19 * np.tanh((np.abs(full[over]) - 0.7) / 0.19))
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
