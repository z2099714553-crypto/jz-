"""为《一根算筹》合成配乐，输出 public/suanchou/score.wav。

全部由正弦波叠加合成，没有使用任何外部音频素材，不涉及版权。
时间点与 src/suanchou/script.ts 及各场景里的动画帧对齐（30fps）。

运行：
    pip install numpy
    python scripts/make_score.py
    npx remotion ffmpeg -y -i public/suanchou/score.wav -c:a libmp3lame -b:a 192k public/suanchou/score.mp3
"""

from pathlib import Path

import numpy as np

SR = 44100
TOTAL = 104.0
FPS = 30
OUT = Path(__file__).resolve().parent.parent / "public" / "suanchou" / "score.wav"

rng = np.random.default_rng(7)

NOTE_INDEX = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6,
              "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}


def hz(name: str) -> float:
    pitch, octave = name[:-1], int(name[-1])
    midi = 12 * (octave + 1) + NOTE_INDEX[pitch]
    return 440.0 * 2 ** ((midi - 69) / 12)


def buf(seconds: float = TOTAL) -> np.ndarray:
    return np.zeros((2, int(seconds * SR)))


def place(target: np.ndarray, sound: np.ndarray, t: float, gain: float = 1.0, pan: float = 0.0) -> None:
    """把单声道 sound 放到 target 的 t 秒处，pan ∈ [-1, 1]"""
    start = int(t * SR)
    if start >= target.shape[1]:
        return
    end = min(target.shape[1], start + len(sound))
    seg = sound[: end - start] * gain
    left = np.cos((pan + 1) * np.pi / 4)
    right = np.sin((pan + 1) * np.pi / 4)
    target[0, start:end] += seg * left
    target[1, start:end] += seg * right


def env_adsr(n: int, attack: float, release: float) -> np.ndarray:
    e = np.ones(n)
    a = min(n, int(attack * SR))
    r = min(n - a, int(release * SR))
    if a > 0:
        e[:a] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, a))
    if r > 0:
        e[n - r:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, r))
    return e


# ── 音色 ────────────────────────────────────────────────────

def pad_voice(freq: float, seconds: float, attack: float = 2.5, release: float = 2.5) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for detune in (-0.0016, 0.0, 0.0019):
        f = freq * (1 + detune)
        phase = rng.uniform(0, 2 * np.pi)
        # 泛音衰减得慢一点，手机外放也能听到铺底
        for h in range(1, 8):
            out += np.sin(2 * np.pi * f * h * t + phase * h) / h ** 1.25
    out *= 1 + 0.12 * np.sin(2 * np.pi * 0.13 * t + rng.uniform(0, 6))
    return out * env_adsr(n, attack, release) / 3


def bell(freq: float, seconds: float = 4.0) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / SR
    partials = [(1.0, 1.0, 2.6), (2.0, 0.42, 1.4), (3.01, 0.2, 0.9), (4.17, 0.12, 0.6), (5.43, 0.06, 0.4)]
    out = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t / d) for m, a, d in partials)
    return out * env_adsr(n, 0.004, 0.2)


def pluck(freq: float, seconds: float = 2.2) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / SR
    partials = [(1.0, 1.0, 1.1), (2.0, 0.3, 0.5), (3.0, 0.12, 0.3), (4.0, 0.05, 0.2)]
    out = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t / d) for m, a, d in partials)
    click = rng.normal(0, 1, n) * np.exp(-t / 0.004) * 0.08
    return (out + click) * env_adsr(n, 0.003, 0.3)


def wood(seconds: float = 0.5) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 420 * t) * np.exp(-t / 0.07) + 0.6 * np.sin(2 * np.pi * 1130 * t) * np.exp(-t / 0.03)
    noise = rng.normal(0, 1, n)
    noise = np.diff(noise, prepend=0) * np.exp(-t / 0.008) * 0.25
    return body + noise


def tick(freq: float = 2600, seconds: float = 0.12) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / SR
    noise = np.diff(rng.normal(0, 1, n), prepend=0) * np.exp(-t / 0.003) * 0.4
    return noise + 0.5 * np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.012)


def lowpass(x: np.ndarray, cutoff: np.ndarray) -> np.ndarray:
    """随时间变化截止频率的一阶低通（cutoff 与 x 等长）"""
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def swell(seconds: float, f0: float, f1: float) -> np.ndarray:
    n = int(seconds * SR)
    x = rng.normal(0, 1, n)
    cutoff = np.geomspace(f0, f1, n)
    y = lowpass(lowpass(x, cutoff), cutoff)
    shape = np.linspace(0, 1, n) ** 2
    return y * shape * env_adsr(n, 0.05, 0.25) * 3


def reverb(x: np.ndarray, seconds: float = 2.8, wet: float = 0.32) -> np.ndarray:
    L = int(seconds * SR)
    t = np.arange(L) / SR
    out = np.zeros_like(x)
    size = 1 << int(np.ceil(np.log2(x.shape[1] + L)))
    for ch in range(2):
        ir = rng.normal(0, 1, L) * np.exp(-t / (seconds / 6.5))
        ir = np.convolve(ir, np.ones(6) / 6, mode="same")  # 稍微压暗
        ir[: int(0.012 * SR)] = 0  # 预延迟
        ir /= np.sqrt(np.sum(ir ** 2))
        y = np.fft.irfft(np.fft.rfft(x[ch], size) * np.fft.rfft(ir, size), size)[: x.shape[1]]
        out[ch] = x[ch] + wet * y
    return out


# ── 编排 ────────────────────────────────────────────────────
SCALE_DM = ["D4", "F4", "G4", "A4", "C5", "D5", "F5", "G5", "A5", "C6"]  # D 小调五声音阶


def f2s(frame: float, scene_start: float) -> float:
    return scene_start + frame / FPS


def part_before_silence() -> np.ndarray:
    """0–63 秒：算的历史。63 秒整体截断，留出 1 秒纯静音"""
    mix = buf(63.0)

    # 低音铺底，按场景缓慢换和弦，逐渐加厚
    chords = [
        (0.3, 12.5, ["D2", "A2", "D3"], 0.55),
        (11.5, 25.5, ["D2", "A2", "F3"], 0.6),
        (24.5, 37.5, ["Bb1", "F2", "D3"], 0.62),
        (36.5, 51.5, ["D2", "A2", "C3", "F3"], 0.66),
        (50.5, 63.0, ["G1", "D2", "Bb2", "F3"], 0.74),
    ]
    for t0, t1, notes, g in chords:
        for i, nm in enumerate(notes):
            # 低音保持原位，其余升高八度，手机外放更清楚
            f, gain = (hz(nm), 0.7) if i == 0 else (hz(nm) * 2, 0.8)
            place(mix, pad_voice(f, t1 - t0, attack=3.0, release=2.0), t0, g * 0.22 * gain, pan=(i - 1.5) * 0.3)

    # 01 竹签落桌
    place(mix, wood(), 2.0, 0.55, -0.05)
    place(mix, wood() * 0.5, 2.23, 0.25, -0.05)

    # 02 两根「一」，然后算筹排开
    place(mix, pluck(hz("D5")), f2s(12, 6), 0.3, -0.2)
    place(mix, pluck(hz("A4")), f2s(34, 6), 0.3, 0.2)
    for d in range(2, 10):
        place(mix, wood(0.3), f2s(58 + (d - 2) * 7 + 6, 6), 0.1, -0.35)
        place(mix, wood(0.3), f2s(62 + (d - 2) * 7 + 6, 6), 0.08, 0.35)

    # 03 割圆：边数每翻一倍，响一声，音高一级级往上
    for k in range(13):
        place(mix, bell(hz(SCALE_DM[min(k, 9)]) * 2, 2.5), f2s(24 + k * 12, 12), 0.05 + 0.005 * k, 0.4)

    # 04 圆周率旋律：数字 n 对应音阶第 n 级
    for i, d in enumerate([3, 1, 4, 1, 5, 9, 2, 6]):
        place(mix, pluck(hz(SCALE_DM[d])), f2s(10 + i * 9, 19), 0.34, -0.3 + i * 0.08)
    place(mix, bell(hz("D6"), 5), f2s(100, 19), 0.12, 0.0)

    # 05 齿轮的滴答
    for k in range(0, 200, 12):
        place(mix, tick(1800), f2s(k, 25), 0.05, 0.3)

    # 06 帕斯卡计算器：每拨一格一声，进位时多一声，最后连进两位响铃
    steps = [12, 26, 38, 48, 57, 65, 72, 78, 84, 89, 94, 99, 103, 107, 111, 115]
    for i, s in enumerate(steps):
        place(mix, tick(2600), f2s(s, 32), 0.14, 0.25)
        if i == 5:
            place(mix, tick(2000), f2s(s + 5, 32), 0.12, -0.1)
    place(mix, tick(2000), f2s(120, 32), 0.14, -0.1)
    place(mix, tick(1600), f2s(125, 32), 0.14, -0.3)
    place(mix, bell(hz("A5"), 4), f2s(122, 32), 0.14)

    # 07 布尔：1 与 0 分开
    place(mix, bell(hz("D5")), f2s(124, 37), 0.13, -0.3)
    place(mix, bell(hz("A5")), f2s(152, 37), 0.11, 0.3)

    # 08 图灵纸带：走一格一声，写入一声
    for k in range(9):
        s = 22 + k * 20
        place(mix, tick(2200), f2s(s + 11, 44), 0.09, 0.2)
        place(mix, pluck(hz(["D5", "F5", "G5", "A5", "C6"][k % 5])), f2s(s + 13, 44), 0.07, -0.2)

    # 09 晶圆拉远：一阵上扬的气流
    place(mix, swell(3.8, 200, 3500), f2s(18, 51), 0.18)

    # 10 阿波罗：纸越叠越高，低音加一层
    place(mix, pad_voice(hz("D3"), 6.0, attack=4.5, release=0.5), 57.0, 0.08, 0.2)
    place(mix, swell(5.5, 120, 1400), 57.4, 0.1)

    mix = reverb(mix)
    # 63 秒硬切，只留 40 毫秒防爆音
    fade = int(0.04 * SR)
    mix[:, -fade:] *= np.linspace(1, 0, fade)
    return mix


def part_after_silence() -> np.ndarray:
    """64–104 秒：Claude 出场，转入 F 大调"""
    T0 = 64.0
    mix = buf(TOTAL - T0)

    def at(t: float) -> float:
        return t - T0

    # 11 黑场之后：一个极轻的长音
    place(mix, pad_voice(hz("A4"), 3.4, attack=2.0, release=1.2), at(64.2), 0.06)

    # 12 星点汇聚：气流上扬，在光爆处落下
    place(mix, swell(3.7, 150, 5000), at(67.0), 0.16)
    for i, nm in enumerate(["F4", "A4", "C5", "E5", "G5", "A5", "C6"]):
        place(mix, bell(hz(nm), 3.0), at(67.4 + i * 0.42), 0.05 + i * 0.008, -0.6 + i * 0.2)

    # 13 起温暖的 F 大调铺底，一直持续到片尾
    chords = [
        (70.3, 79.5, ["F2", "C3", "A3", "E4"], 0.55),
        (78.5, 86.5, ["Bb1", "F2", "D3", "A3"], 0.6),
        (85.5, 92.5, ["D2", "A2", "F3", "C4"], 0.55),
        (91.5, 98.5, ["Bb1", "F2", "A3", "D4"], 0.62),
        (97.5, 104.0, ["F2", "C3", "A3", "G4"], 0.6),
    ]
    for t0, t1, notes, g in chords:
        for i, nm in enumerate(notes):
            rel = 5.0 if t1 >= 104 else 2.2
            f, gain = (hz(nm), 0.7) if i == 0 else (hz(nm) * 2, 0.8)
            place(mix, pad_voice(f, t1 - t0, attack=2.2, release=rel), at(t0), g * 0.2 * gain, pan=(i - 1.5) * 0.3)

    # 14 我是 Claude
    place(mix, bell(hz("A5"), 5.0), at(76.0), 0.16, -0.1)
    place(mix, bell(hz("E6"), 5.0), at(76.35), 0.1, 0.15)

    # 15 三张卡片
    for i, t in enumerate([79.0, 81.33, 83.67]):
        place(mix, pluck(hz(["F5", "A5", "C6"][i])), at(t + 0.1), 0.18, -0.3 + i * 0.3)

    # 17 星空展开：舒缓的琶音
    arp = ["D5", "F5", "A5", "C6", "A5", "F5"]
    for k in range(14):
        place(mix, pluck(hz(arp[k % len(arp)])), at(92.4 + k * 0.4), 0.06 + 0.004 * k, -0.5 + (k % 5) * 0.25)

    # 片尾
    place(mix, bell(hz("F5"), 6.0), at(98.3), 0.15, -0.1)
    place(mix, bell(hz("C6"), 6.0), at(98.8), 0.1, 0.15)
    place(mix, bell(hz("A5"), 6.0), at(99.3), 0.08, 0.0)

    mix = reverb(mix, seconds=3.4, wet=0.38)
    # 整体在最后 5 秒淡出
    n = mix.shape[1]
    fade = int(5.0 * SR)
    mix[:, n - fade:] *= np.linspace(1, 0, fade) ** 1.5
    return mix


def main() -> None:
    full = buf()
    a = part_before_silence()
    full[:, : a.shape[1]] += a
    b = part_after_silence()
    start = int(64.0 * SR)
    full[:, start: start + b.shape[1]] += b[:, : full.shape[1] - start]

    peak = np.max(np.abs(full))
    full *= 0.89 / peak  # 峰值 -1 dBFS
    pcm = (np.clip(full.T, -1, 1) * 32767).astype("<i2")

    import wave

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    rms = 20 * np.log10(np.sqrt(np.mean(full ** 2)) + 1e-12)
    print(f"已写入 {OUT}  时长 {full.shape[1] / SR:.1f}s  RMS {rms:.1f} dBFS")


if __name__ == "__main__":
    main()
