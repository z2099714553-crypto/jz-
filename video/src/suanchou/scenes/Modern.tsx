import React from "react";
import { AbsoluteFill, Easing, interpolate, random } from "remotion";
import { Backdrop, Scrim, clamp, makeStars } from "../common";
import { C, FONT_EN, FONT_ZH } from "../theme";
import { useTick } from "../time";

const W = 1920;
const H = 1080;

// ── 07 布尔：真是 1，假是 0 ────────────────────────────────
type Glyph = { ch: string; w: number; italic?: boolean; sup?: boolean };

const layout = (glyphs: Glyph[], cx: number) => {
  const total = glyphs.reduce((s, g) => s + g.w, 0);
  let x = cx - total / 2;
  return glyphs.map((g) => {
    const mid = x + g.w / 2;
    x += g.w;
    return { ...g, x: mid };
  });
};

export const S07Boole: React.FC = () => {
  const f = useTick();
  const eqY = 440;
  const eq1 = layout(
    [
      { ch: "x", w: 60, italic: true },
      { ch: "2", w: 40, sup: true },
      { ch: "=", w: 110 },
      { ch: "x", w: 60, italic: true },
    ],
    960,
  );
  const eq2 = layout(
    [
      { ch: "x", w: 58, italic: true },
      { ch: "(", w: 34 },
      { ch: "1", w: 56 },
      { ch: "−", w: 78 },
      { ch: "x", w: 58, italic: true },
      { ch: ")", w: 34 },
      { ch: "=", w: 110 },
      { ch: "0", w: 60 },
    ],
    960,
  );
  const titleIn = interpolate(f, [0, 24], [0, 1], clamp);
  const eq1In = (i: number) => interpolate(f, [18 + i * 5, 32 + i * 5], [0, 1], clamp);
  const eq1Out = interpolate(f, [66, 80], [1, 0], clamp);
  const eq2In = (i: number) => interpolate(f, [72 + i * 3, 88 + i * 3], [0, 1], clamp);
  const strip = interpolate(f, [118, 138], [1, 0], clamp);
  const move = interpolate(f, [122, 156], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const labels = interpolate(f, [150, 172], [0, 1], clamp);
  const bodyLines = interpolate(f, [0, 30, 110, 136], [0, 1, 1, 0.25], clamp);

  const one = eq2[2];
  const zero = eq2[7];
  const oneX = interpolate(move, [0, 1], [one.x, 820]);
  const zeroX = interpolate(move, [0, 1], [zero.x, 1100]);
  const big = interpolate(move, [0, 1], [1, 1.7]);

  return (
    <AbsoluteFill>
      <Backdrop kind="paper" />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        {/* 书页 */}
        <rect x={560} y={70} width={800} height={690} fill="#F5EFE3" opacity={0.55} style={{ filter: "blur(1px)" }} />
        <g opacity={titleIn} fontFamily={FONT_EN} fill={C.ink} textAnchor="middle">
          <text x={960} y={150} fontSize={24} letterSpacing="0.32em">
            AN INVESTIGATION
          </text>
          <text x={960} y={186} fontSize={17} letterSpacing="0.3em" opacity={0.75}>
            OF THE
          </text>
          <text x={960} y={226} fontSize={30} letterSpacing="0.26em">
            LAWS OF THOUGHT
          </text>
          <rect x={900} y={246} width={120} height={1} fill={C.ink} opacity={0.4} />
          <text x={960} y={276} fontSize={16} letterSpacing="0.3em" opacity={0.6}>
            GEORGE BOOLE · 1854
          </text>
        </g>
        {/* 正文的灰色行 */}
        <g opacity={bodyLines * 0.5}>
          {Array.from({ length: 4 }).map((_, i) => (
            <rect key={`a${i}`} x={640} y={318 + i * 18} width={640 - (i === 3 ? 260 : random(`b${i}`) * 40)} height={3} fill={C.inkSoft} opacity={0.35} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={`c${i}`} x={640} y={560 + i * 18} width={640 - (i === 4 ? 320 : random(`d${i}`) * 40)} height={3} fill={C.inkSoft} opacity={0.35} />
          ))}
        </g>

        <g fontFamily={FONT_EN} fill={C.ink} textAnchor="middle">
          {eq1.map((g, i) => (
            <text
              key={`e1${i}`}
              x={g.x}
              y={g.sup ? eqY - 44 : eqY}
              fontSize={g.sup ? 52 : 96}
              fontStyle={g.italic ? "italic" : "normal"}
              opacity={eq1In(i) * eq1Out}
            >
              {g.ch}
            </text>
          ))}
          {eq2.map((g, i) => {
            const keep = i === 2 || i === 7;
            if (keep) return null;
            return (
              <text
                key={`e2${i}`}
                x={g.x}
                y={eqY}
                fontSize={96}
                fontStyle={g.italic ? "italic" : "normal"}
                opacity={eq2In(i) * strip}
              >
                {g.ch}
              </text>
            );
          })}
          <text
            x={oneX}
            y={eqY}
            fontSize={96}
            opacity={eq2In(2)}
            fill={move > 0 ? C.cinnabar : C.ink}
            transform={`translate(${oneX} ${eqY - 34}) scale(${big}) translate(${-oneX} ${-(eqY - 34)})`}
          >
            1
          </text>
          <text
            x={zeroX}
            y={eqY}
            fontSize={96}
            opacity={eq2In(7)}
            transform={`translate(${zeroX} ${eqY - 34}) scale(${big}) translate(${-zeroX} ${-(eqY - 34)})`}
          >
            0
          </text>
        </g>
        <g fontFamily={FONT_ZH} fontSize={30} textAnchor="middle" opacity={labels} letterSpacing="0.2em">
          <text x={820} y={590} fill={C.cinnabar}>
            真
          </text>
          <text x={1100} y={590} fill={C.inkSoft}>
            假
          </text>
        </g>
      </svg>
      <Scrim tone="light" />
    </AbsoluteFill>
  );
};

// ── 08 图灵：无穷长的纸带 ──────────────────────────────────
const CELL = 150;
const HEAD = 6;
const HEAD_X = 780;
export const TAPE_STEPS = Array.from({ length: 9 }).map((_, k) => 22 + k * 20);

export const S08Tape: React.FC = () => {
  const f = useTick();
  let shift = 0;
  for (const s of TAPE_STEPS) {
    shift += interpolate(f, [s, s + 11], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  }
  const cells = Array.from({ length: 40 }).map((_, i) => {
    const r = random(`tape${i}`);
    return r < 0.18 ? "" : r < 0.6 ? "1" : "0";
  });
  // 每走一步，读写头下的那一格被改写
  const written = (i: number) => {
    const k = i - HEAD;
    if (k < 1 || k > TAPE_STEPS.length) return { sym: cells[i], flash: 0 };
    const wt = TAPE_STEPS[k - 1] + 13;
    if (f < wt) return { sym: cells[i], flash: 0 };
    const flip = cells[i] === "1" ? "0" : "1";
    return { sym: flip, flash: interpolate(f, [wt, wt + 12], [1, 0], clamp) };
  };
  const tapeIn = interpolate(f, [0, 24], [0, 1], clamp);
  const headBob = TAPE_STEPS.reduce(
    (s, st) => s + interpolate(f, [st + 11, st + 14, st + 18], [0, 1, 0], clamp),
    0,
  );

  return (
    <AbsoluteFill>
      <Backdrop kind="paper" />
      <AbsoluteFill style={{ perspective: 1400, perspectiveOrigin: `${HEAD_X}px 400px` }}>
        <div
          style={{
            position: "absolute",
            left: HEAD_X - (HEAD + 0.5) * CELL,
            top: 300,
            width: CELL * 40,
            height: 200,
            // 以读写头为轴转过去：左边的格子迎面而来，右边的伸向远处
            transform: "rotateY(50deg) rotateX(-3deg)",
            transformOrigin: `${(HEAD + 0.5) * CELL}px 50%`,
            opacity: tapeIn,
            maskImage: "linear-gradient(to right, black 0%, black 34%, transparent 58%)",
            WebkitMaskImage: "linear-gradient(to right, black 0%, black 34%, transparent 58%)",
          }}
        >
          {cells.map((_, i) => {
            const pos = i - shift;
            // 太靠近镜头的格子不画，避免穿过相机
            if (pos < HEAD - 6 || pos > HEAD + 26) return null;
            const { sym, flash } = written(i);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: pos * CELL,
                  top: 20,
                  width: CELL,
                  height: 160,
                  boxSizing: "border-box",
                  borderLeft: `2px solid rgba(42,37,33,0.55)`,
                  borderTop: `2px solid rgba(42,37,33,0.7)`,
                  borderBottom: `2px solid rgba(42,37,33,0.7)`,
                  background: flash > 0 ? `rgba(216,121,92,${0.35 * flash})` : "#F7F1E6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT_EN,
                  fontSize: 96,
                  color: C.ink,
                }}
              >
                {sym}
              </div>
            );
          })}
          {/* 读写头 */}
          <div
            style={{
              position: "absolute",
              left: HEAD * CELL - 9,
              top: 8,
              width: CELL + 18,
              height: 184,
              border: `5px solid ${C.cinnabar}`,
              borderRadius: 8,
              transform: `translateY(${-8 * headBob}px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: HEAD * CELL + CELL / 2 - 18,
              top: -44 - 8 * headBob,
              width: 0,
              height: 0,
              borderLeft: "18px solid transparent",
              borderRight: "18px solid transparent",
              borderTop: `30px solid ${C.cinnabar}`,
            }}
          />
        </div>
      </AbsoluteFill>
      <Scrim tone="light" />
    </AbsoluteFill>
  );
};

// ── 09 晶体管 → 晶圆 ───────────────────────────────────────
const PITCH = 40;
const DIE = 34;
const WR = 330;

const Transistor: React.FC<{ x: number; y: number; detail: number }> = ({ x, y, detail }) => (
  <g transform={`translate(${x - DIE / 2} ${y - DIE / 2})`}>
    <rect width={DIE} height={DIE} fill="#1E2A36" />
    <g opacity={detail}>
      {/* 源、漏 */}
      <rect x={5} y={11} width={9} height={12} fill="#C9A45C" />
      <rect x={20} y={11} width={9} height={12} fill="#C9A45C" />
      {/* 沟道与栅极 */}
      <rect x={14} y={12.5} width={6} height={9} fill="#3F5A6E" />
      <rect x={15.2} y={6} width={3.6} height={22} fill={C.cinnabarSoft} />
      {/* 接触孔 */}
      {[7, 9.5, 12].map((dx) => (
        <rect key={`s${dx}`} x={dx - 0.8} y={16.2} width={1.6} height={1.6} fill="#2A2018" />
      ))}
      {[22, 24.5, 27].map((dx) => (
        <rect key={`d${dx}`} x={dx - 0.8} y={16.2} width={1.6} height={1.6} fill="#2A2018" />
      ))}
      {/* 金属连线 */}
      <rect x={2} y={3} width={13} height={1.2} fill="#AEB8C2" />
      <rect x={9} y={3} width={1.2} height={9} fill="#AEB8C2" />
      <rect x={19} y={30} width={13} height={1.2} fill="#AEB8C2" />
      <rect x={24} y={22} width={1.2} height={9} fill="#AEB8C2" />
      <rect x={16.4} y={1} width={1.2} height={5} fill="#AEB8C2" />
      {/* 焊盘 */}
      <rect x={1} y={1} width={4} height={4} fill="#D8C08A" />
      <rect x={29} y={29} width={4} height={4} fill="#D8C08A" />
      <rect x={15} y={29.5} width={4} height={4} fill="#D8C08A" />
    </g>
  </g>
);

export const S09Wafer: React.FC = () => {
  const f = useTick();
  const cx = 960;
  const cy = 400;
  const p = interpolate(f, [18, 132], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const zoom = Math.pow(20, 1 - p);
  const detail = interpolate(zoom, [2.5, 6], [0, 1], clamp);
  const dies: { x: number; y: number; hue: number }[] = [];
  for (let i = -9; i <= 9; i++) {
    for (let j = -9; j <= 9; j++) {
      const x = cx + i * PITCH;
      const y = cy + j * PITCH;
      const far = Math.hypot(Math.abs(i * PITCH) + DIE / 2, Math.abs(j * PITCH) + DIE / 2);
      if (far > WR - 8) continue;
      dies.push({ x, y, hue: 190 + 60 * Math.sin(i * 0.35 + j * 0.22) + 40 * Math.cos(j * 0.3) });
    }
  }
  const sheen = interpolate(f, [60, 170], [-500, 500], clamp);
  const ring = interpolate(f, [132, 150, 180], [0, 1, 0.6], clamp);

  return (
    <AbsoluteFill>
      <Backdrop kind="night" />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="waferBase" cx="0.45" cy="0.4" r="0.7">
            <stop offset="0" stopColor="#9FB0C4" />
            <stop offset="0.6" stopColor="#56687E" />
            <stop offset="1" stopColor="#2A3646" />
          </radialGradient>
          <linearGradient id="sheen" gradientUnits="userSpaceOnUse" x1={cx + sheen - 150} y1={cy - 300} x2={cx + sheen + 150} y2={cy + 300}>
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0.28} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <pattern id="dieTex" patternUnits="userSpaceOnUse" x={cx - PITCH / 2} y={cy - PITCH / 2} width={PITCH} height={PITCH}>
            <rect x={6} y={6} width={12} height={1} fill="#fff" opacity={0.35} />
            <rect x={6} y={6} width={1} height={14} fill="#fff" opacity={0.35} />
            <rect x={21} y={9} width={12} height={12} fill="#000" opacity={0.14} />
            <rect x={9} y={24} width={22} height={1} fill="#fff" opacity={0.3} />
            <rect x={9} y={28} width={16} height={1} fill="#fff" opacity={0.25} />
            <rect x={5} y={5} width={3} height={3} fill="#E8D7A8" opacity={0.6} />
            <rect x={32} y={32} width={3} height={3} fill="#E8D7A8" opacity={0.6} />
          </pattern>
          <clipPath id="waferClip">
            <circle cx={cx} cy={cy} r={WR} />
          </clipPath>
        </defs>
        <g transform={`translate(${cx} ${cy}) scale(${zoom}) translate(${-cx} ${-cy})`}>
          <circle cx={cx} cy={cy} r={WR} fill="url(#waferBase)" />
          <g clipPath="url(#waferClip)">
            {dies.map((d, i) =>
              d.x === cx && d.y === cy ? null : (
                <rect
                  key={i}
                  x={d.x - DIE / 2}
                  y={d.y - DIE / 2}
                  width={DIE}
                  height={DIE}
                  fill={`hsl(${d.hue}, 22%, 52%)`}
                  opacity={0.8}
                />
              ),
            )}
            <circle cx={cx} cy={cy} r={WR} fill="url(#dieTex)" />
            <Transistor x={cx} y={cy} detail={detail} />
            <rect x={cx - WR} y={cy - WR} width={WR * 2} height={WR * 2} fill="url(#sheen)" />
          </g>
          {/* 定位缺口 */}
          <rect x={cx - 40} y={cy + WR - 6} width={80} height={10} fill={C.night} />
          <rect
            x={cx - DIE / 2 - 3}
            y={cy - DIE / 2 - 3}
            width={DIE + 6}
            height={DIE + 6}
            fill="none"
            stroke={C.cinnabarSoft}
            strokeWidth={2.5 / Math.max(1, zoom * 0.6)}
            opacity={ring}
          />
        </g>
      </svg>
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ── 10 阿波罗：与人齐高的代码 ──────────────────────────────
const Rocket: React.FC<{ x: number; base: number }> = ({ x, base }) => {
  const h = 330;
  const w = 34;
  return (
    <g>
      {/* 发射塔 */}
      <g stroke="#2B2320" strokeWidth={3}>
        <line x1={x - 70} y1={base} x2={x - 70} y2={base - h - 50} />
        <line x1={x - 40} y1={base} x2={x - 40} y2={base - h - 50} />
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={i} x1={x - 70} y1={base - i * 30} x2={x - 40} y2={base - i * 30 - 30} strokeWidth={1.5} />
        ))}
        {[80, 170, 260].map((d) => (
          <line key={d} x1={x - 40} y1={base - d} x2={x - w / 2} y2={base - d} strokeWidth={2.5} />
        ))}
      </g>
      {/* 土星五号 */}
      <rect x={x - w / 2} y={base - h * 0.55} width={w} height={h * 0.55} fill="#E9E4DA" />
      <rect x={x - w / 2} y={base - h * 0.55} width={w} height={14} fill="#1D1917" />
      <rect x={x - w / 2} y={base - h * 0.2} width={w} height={10} fill="#1D1917" />
      <rect x={x - w / 2 + 3} y={base - h * 0.82} width={w - 6} height={h * 0.27} fill="#E9E4DA" />
      <rect x={x - w / 2 + 3} y={base - h * 0.82} width={w - 6} height={8} fill="#1D1917" />
      <path d={`M ${x - 11} ${base - h * 0.82} L ${x} ${base - h} L ${x + 11} ${base - h * 0.82} Z`} fill="#D8D2C6" />
      <line x1={x} y1={base - h} x2={x} y2={base - h - 26} stroke="#D8D2C6" strokeWidth={2} />
      <path d={`M ${x - w / 2} ${base} l -10 0 l 10 -40 Z`} fill="#1D1917" />
      <path d={`M ${x + w / 2} ${base} l 10 0 l -10 -40 Z`} fill="#1D1917" />
    </g>
  );
};

export const S10Apollo: React.FC = () => {
  const f = useTick();
  const stars = makeStars(60, "apollo");
  const floor = 740;
  const full = 560; // 叠满时的高度，约一人高
  const grow = interpolate(f, [6, 120], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const sheets = Math.floor((full / 3.2) * grow);
  const dimIn = interpolate(f, [100, 130], [0, 1], clamp);
  const win = { x: 1060, y: 110, w: 620, h: 600 };

  return (
    <AbsoluteFill>
      <Backdrop kind="night" />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0E1830" />
            <stop offset="0.55" stopColor="#3B3552" />
            <stop offset="0.85" stopColor="#C97A4E" />
            <stop offset="1" stopColor="#E9A866" />
          </linearGradient>
          <clipPath id="winClip">
            <rect x={win.x} y={win.y} width={win.w} height={win.h} />
          </clipPath>
          <linearGradient id="room" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#15110E" />
            <stop offset="1" stopColor="#0A0807" />
          </linearGradient>
        </defs>
        {/* 窗外 */}
        <g clipPath="url(#winClip)">
          <rect x={win.x} y={win.y} width={win.w} height={win.h} fill="url(#dusk)" />
          {stars.map((s, i) => (
            <circle
              key={i}
              cx={win.x + s.x * win.w}
              cy={win.y + s.y * win.h * 0.45}
              r={s.r * 0.8}
              fill="#fff"
              opacity={s.b * (0.6 + 0.4 * Math.sin(f * 0.1 + s.tw))}
            />
          ))}
          <rect x={win.x} y={win.y + win.h - 70} width={win.w} height={70} fill="#120E0C" />
          <Rocket x={1420} base={win.y + win.h - 70} />
        </g>
        {/* 窗框 */}
        <rect x={win.x} y={win.y} width={win.w} height={win.h} fill="none" stroke="#231A14" strokeWidth={22} />
        <rect x={win.x + win.w / 2 - 6} y={win.y} width={12} height={win.h} fill="#231A14" />
        <rect x={win.x} y={win.y + win.h * 0.42} width={win.w} height={12} fill="#231A14" />
        <rect x={win.x - 30} y={win.y + win.h + 8} width={win.w + 60} height={18} fill="#2E231B" />

        {/* 地面 */}
        <rect x={0} y={floor} width={W} height={H - floor} fill="#0B0908" />
        <ellipse cx={520} cy={floor + 4} rx={260} ry={14} fill="#000" opacity={0.6} />

        {/* 一叠代码纸 */}
        {Array.from({ length: sheets }).map((_, i) => {
          const y = floor - (i + 1) * 3.2;
          const jitter = (random(`sheet${i}`) - 0.5) * 8;
          const binder = i % 38 === 0;
          const tone = random(`tone${i}`);
          return (
            <rect
              key={i}
              x={400 + jitter}
              y={y}
              width={240}
              height={3.2}
              fill={binder ? "#5A4636" : tone > 0.5 ? "#EDE6D8" : "#D8CFBF"}
            />
          );
        })}
        {/* 最上面一页，隐约可见的代码行 */}
        {sheets > 0 ? (
          <g transform={`translate(400 ${floor - sheets * 3.2})`}>
            <path d="M 0 0 L 24 -16 L 264 -16 L 240 0 Z" fill="#F4EFE4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <rect key={i} x={30 + i * 3} y={-13 + i * 2.6} width={120 + random(`code${i}`) * 90} height={1} fill="#6B6158" />
            ))}
          </g>
        ) : null}

        {/* 身高标尺 */}
        <g opacity={dimIn} stroke={C.moon} strokeOpacity={0.55}>
          <line x1={700} y1={floor} x2={700} y2={floor - full} strokeWidth={1.5} />
          <line x1={688} y1={floor} x2={712} y2={floor} strokeWidth={1.5} />
          <line x1={688} y1={floor - full} x2={712} y2={floor - full} strokeWidth={1.5} />
          <line x1={640} y1={floor - full} x2={760} y2={floor - full} strokeWidth={1} strokeDasharray="4 6" />
        </g>
        <text
          x={726}
          y={floor - full / 2}
          fontFamily={FONT_ZH}
          fontSize={22}
          letterSpacing="0.35em"
          fill={C.moon}
          opacity={dimIn * 0.75}
          style={{ writingMode: "vertical-rl" }}
        >
          与人齐高
        </text>
      </svg>
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};
