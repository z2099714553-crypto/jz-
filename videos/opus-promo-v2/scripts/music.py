"""Procedurally compose the score + SFX from src/timeline.json -> public/music.wav.

Everything is synthesized with numpy (no samples, no licenses). Music ducks under the voice.
"""
import json, os
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
rng = np.random.default_rng(7)

tl = json.load(open(os.path.join(ROOT, "src/timeline.json"), encoding="utf-8"))
FPS = tl["fps"]
T = tl["totalFrames"] / FPS
N = int(T * SR)
S = {s["id"]: s for s in tl["scenes"]}


def t0(sid, off=0.0):
    return S[sid]["from"] / FPS + off


def t1(sid):
    return (S[sid]["from"] + S[sid]["frames"]) / FPS


L = np.zeros(N)
R = np.zeros(N)


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    L[i: i + len(sig)] += sig * gain * np.sqrt((1 - pan) / 2)
    R[i: i + len(sig)] += sig * gain * np.sqrt((1 + pan) / 2)


def lp(x, cutoff):
    """One-pole lowpass; cutoff may be an array (sweeps)."""
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def env(n, a, d):
    e = np.ones(n)
    na, nd = int(a * SR), int(d * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nd:
        e[-nd:] *= np.linspace(1, 0, nd) ** 2
    return e


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def saw(f, n, detune=0.0):
    t = np.arange(n) / SR
    out = 0
    for d in (-detune, 0, detune):
        ph = (t * f * (1 + d)) % 1
        out = out + (2 * ph - 1)
    return out / 3


# ---------- instruments ----------
def kick(gain=1.0):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * gain


def boom(dur=4.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 32 + 70 * np.exp(-t * 6)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.2)
    noise = lp(rng.standard_normal(n), 900 * np.exp(-t * 3) + 60) * np.exp(-t * 2.5) * 0.9
    return np.tanh((sub + noise) * 1.6)


def hit(dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(55 + 90 * np.exp(-t * 20)) / SR) * np.exp(-t * 4)
    crack = rng.standard_normal(n) * np.exp(-t * 30) * 0.6
    return np.tanh((body + crack) * 2)


def whoosh(dur=0.5, up=True):
    n = int(dur * SR)
    x = np.linspace(0, 1, n)
    cut = (300 + 5000 * x) if up else (5000 - 4700 * x)
    shape = np.sin(np.pi * x) ** 2
    return lp(rng.standard_normal(n), cut) * shape * 1.4


def riser(dur):
    n = int(dur * SR)
    x = np.linspace(0, 1, n)
    noise = lp(rng.standard_normal(n), 200 + 9000 * x ** 2) * x ** 2
    tone = np.sin(2 * np.pi * np.cumsum(110 + 770 * x ** 2) / SR) * x ** 3 * 0.35
    return noise + tone


def tick():
    n = int(0.04 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 160)


def pluck(midi, dur=0.35):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(midi)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
    return x * np.exp(-t * 9) * env(n, 0.003, 0.05)


def pad(chord, dur, bright=1800):
    n = int(dur * SR)
    x = sum(saw(hz(m), n, 0.006) for m in chord) / len(chord)
    return lp(x, bright) * env(n, min(0.8, dur / 3), min(1.2, dur / 3))


def bass(midi, dur):
    n = int(dur * SR)
    return lp(saw(hz(midi), n, 0.002), 300) * env(n, 0.01, 0.1) * 1.4


def chime(midi, dur=2.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(midi)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4)) * np.exp(-t * 2.2)


# A minor epic: Am F C G
PROG = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]]
ROOTS = [33, 29, 36, 31]
BEAT = 60 / 112

# ---------- 1. hook: impacts on the words ----------
add(hit(), t0("hook", 0.0), 0.9)
add(hit(), t0("hook", 1.05), 0.7)
add(boom(2.5), t0("hook", 1.6), 0.5)
add(pad([45, 52, 57], t1("hook") - t0("hook") + 0.5, 600), t0("hook"), 0.35)

# ---------- 2. code: tense pulse ----------
a, b = t0("code"), t1("code")
add(pad([45, 52, 60], b - a, 900), a, 0.3)
t = a
while t < b - 0.05:
    add(pluck(69 + [0, 3, 7, 12][int((t - a) / (BEAT / 2)) % 4], 0.2), t, 0.13, pan=0.4 * np.sin(t * 3))
    t += BEAT / 2

# ---------- 3. rewind: reverse riser + clock ticks accelerating ----------
a, b = t0("rewind"), t1("rewind")
add(riser(b - a), a, 0.35)
t, step = a, 0.25
while t < b:
    add(tick(), t, 0.25)
    t += step
    step = max(0.05, step * 0.9)

# ---------- 4. history montage: driving beat, progression per scene ----------
hist = ["rods", "gears", "binary", "chip", "moon"]
a, b = t0("rods"), t1("moon")
for k, sid in enumerate(hist):
    sa, sb = t0(sid), t1(sid)
    ch = PROG[k % 4]
    add(pad([m + 12 for m in ch], sb - sa + 0.3, 1400 + 400 * k), sa, 0.28)
    add(whoosh(0.45), sa - 0.3, 0.35, pan=-0.3 if k % 2 else 0.3)
    t = sa
    i = 0
    while t < sb - 0.02:
        add(kick(), t, 0.75)
        add(bass(ROOTS[k % 4], BEAT * 0.9), t, 0.4)
        add(pluck(ch[i % 3] + 24, 0.25), t + BEAT / 2, 0.1, pan=0.5 if i % 2 else -0.5)
        t += BEAT
        i += 1
add(riser(t1("moon") - t0("moon")), t0("moon"), 0.4)

# ---------- 5. darkness: everything stops, low drone + heartbeat ----------
a, b = t0("dark"), t1("dark")
add(boom(3.0), a, 0.45)
add(pad([33, 40], b - a + 0.5, 250), a, 0.5)
for k in range(int((b - a) / 0.9)):
    add(kick(0.5), a + 0.5 + k * 0.9, 0.5)
    add(kick(0.35), a + 0.72 + k * 0.9, 0.5)

# ---------- 6. flash: big riser -> brand drop ----------
a, b = t0("flash"), t1("flash")
add(riser(b - a), a, 0.7)
add(pad([57, 64, 69], b - a, np.linspace(300, 4000, int((b - a) * SR))), a, 0.25)

a, b = t0("brand"), t1("brand")
add(boom(4.5), a, 0.95)
add(hit(), a, 0.6)
for k, m in enumerate([69, 76, 81, 88]):
    add(chime(m, 3.0), a + 0.15 + k * 0.12, 0.18, pan=[-0.5, 0.5, -0.2, 0.2][k])
add(pad([45, 52, 57, 64, 69], b - a + 1.0, 2600), a, 0.4)

# ---------- 7. capabilities: uplifting groove ----------
caps = ["web", "bug", "report", "self"]
for k, sid in enumerate(caps):
    sa, sb = t0(sid), t1(sid)
    ch = PROG[(k + 1) % 4]
    add(whoosh(0.4), sa - 0.25, 0.4, pan=0.4 if k % 2 else -0.4)
    add(pad([m + 12 for m in ch], sb - sa + 0.2, 2400), sa, 0.25)
    t, i = sa, 0
    while t < sb - 0.02:
        add(kick(), t, 0.7)
        add(bass(ROOTS[(k + 1) % 4], BEAT * 0.45), t, 0.35)
        add(bass(ROOTS[(k + 1) % 4] + 12, BEAT * 0.4), t + BEAT / 2, 0.25)
        for j in range(2):
            add(pluck(ch[(i * 2 + j) % 3] + 24 + (12 if j else 0), 0.18), t + j * BEAT / 2, 0.09, pan=0.6 if j else -0.6)
        t += BEAT
        i += 1

# ---------- 8. stats: three impacts on the cards ----------
a, b = t0("stats"), t1("stats")
for k in range(3):
    add(hit(0.9), a + 0.15 + k * 0.55, 0.55)
add(pad([45, 52, 60, 64], b - a + 0.4, 2000), a, 0.3)

# ---------- 9. answer: breath, single chime ----------
a, b = t0("answer"), t1("answer")
add(boom(2.5), a, 0.35)
add(pad([53, 57, 60, 64], b - a + 0.5, 1500), a, 0.35)
add(chime(76, 3.0), a + 1.2, 0.2)

# ---------- 10. CTA: warm resolve + soft pulse, fade out ----------
a = t0("cta")
add(pad([48, 55, 60, 64, 67], T - a, 2200), a, 0.4)
t = a
while t < T - 0.6:
    add(pluck([72, 76, 79, 84][int((t - a) / (BEAT / 2)) % 4], 0.3), t, 0.08, pan=0.3 * np.sin(t * 4))
    t += BEAT / 2

# ---------- reverb (FFT convolution with decaying stereo noise) ----------
def reverb(x, seed, dur=2.2):
    n = int(dur * SR)
    ir = np.random.default_rng(seed).standard_normal(n) * np.exp(-np.arange(n) / SR * 3.0)
    ir = lp(ir, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    m = len(x) + n
    nfft = 1 << (m - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(x)]
    return y


wetL, wetR = reverb(L, 1), reverb(R, 2)
L = L + wetL * 0.35
R = R + wetR * 0.35

# ---------- duck under voice ----------
duck = np.ones(N)
for s in tl["scenes"]:
    va = (s["from"] + s["voiceFrom"]) / FPS
    vb = va + s["voiceFrames"] / FPS
    i, j = int(va * SR), min(int(vb * SR), N)
    duck[i:j] = 0.5
k = int(0.08 * SR)
duck = np.convolve(duck, np.ones(k) / k, mode="same")
L *= duck
R *= duck

# master: fade out, soft clip, normalize to -1 dBFS
fade = int(1.5 * SR)
L[-fade:] *= np.linspace(1, 0, fade)
R[-fade:] *= np.linspace(1, 0, fade)
mix = np.stack([L, R], axis=1)
mix = np.tanh(mix / (np.max(np.abs(mix)) * 0.7))
mix = mix / np.max(np.abs(mix)) * 0.89
os.makedirs(os.path.join(ROOT, "public"), exist_ok=True)
sf.write(os.path.join(ROOT, "public/music.wav"), mix.astype(np.float32), SR)
print(f"music.wav {T:.1f}s")
