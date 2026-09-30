import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { H, Scrim, Vignette, W, clamp, scatter, wobble } from "../common";
import { FONT_EN, SEA } from "../theme";

// ─────────────────────────────────────────────────────────
// 公共：海面、星空、火山岛、人影、灯
// ─────────────────────────────────────────────────────────

type SkyStops = [string, string, string];

/** 天空渐变 + 海面 + 海面上闪烁的碎光。brightness 控制碎光亮度 */
const Ocean: React.FC<{
  horizon: number;
  sky: SkyStops;
  sea: [string, string];
  brightness?: number;
  glowX?: number;
  seed?: string;
  opacity?: number;
}> = ({ horizon, sky, sea, brightness = 1, glowX = 960, seed = "sea", opacity = 1 }) => {
  const f = useCurrentFrame();
  const bits = scatter(260, seed);
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={`sky-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="0.7" stopColor={sky[1]} />
          <stop offset="1" stopColor={sky[2]} />
        </linearGradient>
        <linearGradient id={`sea-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sea[0]} />
          <stop offset="1" stopColor={sea[1]} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={horizon} fill={`url(#sky-${seed})`} />
      <rect x={0} y={horizon} width={W} height={H - horizon} fill={`url(#sea-${seed})`} />
      {bits.map((b, i) => {
        const d = b.r * b.r; // 0 = 远处（海平线），1 = 近处
        const y = horizon + 3 + Math.pow(d, 1.5) * (H - horizon);
        const len = 5 + 110 * Math.pow(d, 1.3);
        const x = (((b.x * (W + 300) + f * (0.15 + 0.6 * d)) % (W + 300)) + W + 300) % (W + 300) - 150;
        const near = Math.exp(-Math.pow((x - glowX) / 360, 2));
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(f * 0.045 + b.p));
        return (
          <rect
            key={i}
            x={x - len / 2}
            y={y}
            width={len}
            height={1 + 1.6 * d}
            rx={1}
            fill={SEA.foam}
            opacity={brightness * tw * (0.12 + 0.5 * near) * (0.5 + 0.5 * (1 - d))}
          />
        );
      })}
    </g>
  );
};

const Stars: React.FC<{ n: number; maxY: number; opacity?: number; seed?: string }> = ({
  n,
  maxY,
  opacity = 1,
  seed = "stars",
}) => {
  const f = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {scatter(n, seed).map((s, i) => (
        <circle
          key={i}
          cx={s.x * W}
          cy={s.y * maxY}
          r={0.6 + s.r * s.r * 1.8}
          fill="#EAF2F6"
          opacity={(0.25 + 0.6 * s.r) * (0.6 + 0.4 * Math.sin(f * 0.07 + s.p))}
        />
      ))}
    </g>
  );
};

/** 火山岛轮廓：盾状火山的缓坡 + 起伏的山脊 */
const islandPath = (x0: number, x1: number, height: number, base: number, seed: number) => {
  const pts: string[] = [];
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t;
    const u = (t - 0.5) * 2;
    const shape = Math.pow(Math.max(0, 1 - u * u), 0.85);
    const ridge =
      0.08 * Math.sin(t * 17 + seed) + 0.05 * Math.sin(t * 41 + seed * 2.3) + 0.03 * Math.sin(t * 83 + seed * 4.1);
    const y = base - height * shape * (1 + ridge);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M ${x0} ${base} L ${pts.join(" L ")} L ${x1} ${base} Z`;
};

/** 围坐的人影。两侧的人是侧面、面朝中间的灯；正前方与正后方是正面/背面 */
type Kind = "elder" | "man" | "woman" | "child";
const BODY =
  "M -8 -112 L -8 -104 C -24 -103, -44 -99, -52 -88 C -58 -80, -58 -62, -56 -44 C -55 -36, -60 -28, -72 -20 C -86 -12, -97 -6, -94 2 C -92 8, -84 9, -74 9 L 74 9 C 84 9, 92 8, 94 2 C 97 -6, 86 -12, 72 -20 C 60 -28, 55 -36, 56 -44 C 58 -62, 58 -80, 52 -88 C 44 -99, 24 -103, 8 -104 L 8 -112 Z";
const PROFILE =
  "M -34 9 C -44 -8, -44 -40, -34 -70 C -29 -88, -20 -100, -8 -106 L -4 -112 L 8 -112 L 10 -104 C 22 -98, 28 -84, 28 -70 C 30 -56, 36 -42, 46 -32 C 62 -24, 86 -20, 94 -9 C 98 -1, 92 9, 80 9 Z";
const HAIR_FRONT = "M -21 -146 C -30 -128, -30 -104, -27 -86 L 27 -86 C 30 -104, 30 -128, 21 -146 Z";
const HAIR_SIDE = "M -12 -148 C -32 -136, -38 -108, -34 -80 L -18 -84 C -16 -104, -10 -124, 2 -142 Z";

const Silhouette: React.FC<{ kind: Kind; side: boolean; fill: string }> = ({ kind, side, fill }) => (
  <g fill={fill}>
    {kind === "woman" ? <path d={side ? HAIR_SIDE : HAIR_FRONT} /> : null}
    <path d={side ? PROFILE : BODY} />
    <circle cx={side ? 7 : 0} cy={-129} r={kind === "child" ? 23 : 20} />
    {kind === "elder" ? <rect x={side ? 58 : 70} y={-196} width={5} height={205} rx={2.5} /> : null}
  </g>
);

const KINDS: Kind[] = ["elder", "woman", "man", "child", "woman", "man", "woman", "child", "man"];

type Seat = { x: number; y: number; s: number; i: number; a: number };

const RING = { cx: 960, cy: 575, rx: 440, ry: 150 };
const SEATS: Seat[] = Array.from({ length: 9 })
  .map((_, i) => {
    const a = -Math.PI / 2 + (i / 9) * Math.PI * 2;
    const y = RING.cy + RING.ry * Math.sin(a);
    return { x: RING.cx + RING.rx * Math.cos(a), y, s: 0.72 + 0.4 * ((Math.sin(a) + 1) / 2), i, a };
  })
  .sort((a, b) => a.y - b.y);

const Figure: React.FC<{ seat: Seat; opacity: number }> = ({ seat, opacity }) => {
  const kind = KINDS[seat.i];
  const s = seat.s * (kind === "elder" ? 1.1 : kind === "child" ? 0.74 : 1);
  const side = Math.abs(Math.cos(seat.a)) > 0.5;
  // 侧面的人朝向中间
  const flip = side && seat.x > RING.cx ? -1 : 1;
  // 朝向灯的一侧有一圈暖色轮廓光
  const dx = ((RING.cx - seat.x) / RING.rx) * 3.5;
  const dy = ((RING.cy - 40 - seat.y) / RING.ry) * 2.5;
  return (
    <g transform={`translate(${seat.x} ${seat.y})`} opacity={opacity}>
      <ellipse cx={0} cy={8 * s} rx={96 * s} ry={16 * s} fill="#000" opacity={0.45} />
      <g transform={`translate(${dx} ${dy}) scale(${s * flip} ${s})`} opacity={0.55}>
        <Silhouette kind={kind} side={side} fill={SEA.lamp} />
      </g>
      <g transform={`scale(${s * flip} ${s})`}>
        <Silhouette kind={kind} side={side} fill="#050C16" />
      </g>
    </g>
  );
};

/** 石灯：碗 + 火苗 + 地面暖光 */
const Lamp: React.FC<{ x: number; y: number; boost?: number }> = ({ x, y, boost = 0 }) => {
  const f = useCurrentFrame();
  const flick = 1 + 0.07 * Math.sin(f * 0.61) + 0.05 * Math.sin(f * 1.73 + 1) + 0.03 * Math.sin(f * 3.3);
  const sway = 2 * Math.sin(f * 0.33) + 1 * Math.sin(f * 1.4);
  return (
    <g>
      <defs>
        <radialGradient id="lampPool">
          <stop offset="0" stopColor={SEA.lamp} stopOpacity={0.5} />
          <stop offset="0.45" stopColor={SEA.lampDeep} stopOpacity={0.16} />
          <stop offset="1" stopColor={SEA.lampDeep} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="lampFlame" cx="0.5" cy="0.75" r="0.7">
          <stop offset="0" stopColor="#FFF8E6" />
          <stop offset="0.45" stopColor="#FFD27A" />
          <stop offset="1" stopColor="#F07A2A" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={560 * flick * (1 + boost)} ry={210 * flick * (1 + boost)} fill="url(#lampPool)" />
      <circle cx={x} cy={y - 40} r={170 * flick * (1 + boost * 0.6)} fill="url(#lampPool)" opacity={0.7} />
      <ellipse cx={x} cy={y} rx={30} ry={11} fill="#3A2C22" />
      <ellipse cx={x} cy={y - 3} rx={24} ry={7} fill="#1E1611" />
      <path d={`M ${x} ${y - 2} C ${x - 12} ${y - 14}, ${x - 7} ${y - 34}, ${x + sway} ${y - 58 * flick} C ${x + 8} ${y - 34}, ${x + 12} ${y - 14}, ${x} ${y - 2} Z`} fill="url(#lampFlame)" />
    </g>
  );
};

/** 夜晚海边的背景：星空、远处海面、沙地 */
const NightShore: React.FC = () => (
  <>
    <Ocean horizon={300} sky={["#02070E", "#06111F", "#0D2740"]} sea={["#0B2238", "#071523"]} brightness={0.45} seed="shore" />
    <Stars n={90} maxY={280} />
    <defs>
      <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0B1826" />
        <stop offset="1" stopColor="#05090F" />
      </linearGradient>
    </defs>
    <path d={`M 0 392 C 420 372, 1500 378, ${W} 396 L ${W} ${H} L 0 ${H} Z`} fill="url(#sand)" />
  </>
);

// ─────────────────────────────────────────────────────────
// 01 黑屏，远处慢慢亮起一线海平面
// ─────────────────────────────────────────────────────────
export const S01Horizon: React.FC = () => {
  const f = useCurrentFrame();
  const horizon = 470;
  const half = interpolate(f, [14, 120], [0, 1150], { ...clamp, easing: Easing.out(Easing.cubic) });
  const line = interpolate(f, [14, 60], [0, 1], clamp);
  const world = interpolate(f, [40, 150], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const push = interpolate(f, [0, 150], [1, 1.035]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `960px ${horizon}px` }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <defs>
            <linearGradient id="hzLine" x1="0" x2="1">
              <stop offset="0" stopColor="#9FC4D3" stopOpacity={0} />
              <stop offset="0.5" stopColor="#D7ECF2" />
              <stop offset="1" stopColor="#9FC4D3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Ocean
            horizon={horizon}
            sky={["#000000", "#040C16", "#0D2A40"]}
            sea={["#071a2b", "#000000"]}
            brightness={world * 0.7}
            opacity={world * 0.85}
            seed="s01"
          />
          <rect x={960 - half} y={horizon - 18} width={half * 2} height={36} fill="url(#hzLine)" opacity={0.28 * line} style={{ filter: "blur(10px)" }} />
          <rect x={960 - half} y={horizon - 0.8} width={half * 2} height={1.6} fill="url(#hzLine)" opacity={line} />
        </svg>
      </AbsoluteFill>
      <Vignette strength={0.6} />
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 02 火山岛轮廓，海雾
// ─────────────────────────────────────────────────────────
export const S02Islands: React.FC = () => {
  const f = useCurrentFrame();
  const horizon = 470;
  const push = interpolate(f, [0, 180], [1, 1.05]);
  const mists = scatter(6, "mist");
  const islands = [
    { x0: 120, x1: 760, h: 62, c: "#2B596C", seed: 1 },
    { x0: 1180, x1: 1980, h: 88, c: "#244F63", seed: 5 },
    { x0: 820, x1: 1720, h: 175, c: "#153548", seed: 3 },
    { x0: -160, x1: 560, h: 118, c: "#0B2131", seed: 7 },
  ];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `960px ${horizon}px` }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <defs>
            <radialGradient id="dawnGlow" cx="0.62" cy="1" r="0.8">
              <stop offset="0" stopColor="#7FB2BF" stopOpacity={0.55} />
              <stop offset="1" stopColor="#7FB2BF" stopOpacity={0} />
            </radialGradient>
          </defs>
          <Ocean horizon={horizon} sky={["#050F1C", "#0E3048", "#3C7688"]} sea={["#0B2A40", "#040D17"]} brightness={0.9} glowX={1180} seed="s02" />
          <rect x={0} y={0} width={W} height={horizon} fill="url(#dawnGlow)" />
          <Stars n={40} maxY={220} opacity={0.5} seed="s02stars" />
          {islands.map((isl, i) => (
            <g key={i}>
              <path d={islandPath(isl.x0, isl.x1, isl.h, horizon + 1, isl.seed)} fill={isl.c} />
              {/* 倒影 */}
              <path
                d={islandPath(isl.x0, isl.x1, isl.h * 0.45, horizon + 1, isl.seed)}
                fill={isl.c}
                opacity={0.25}
                transform={`translate(0 ${2 * (horizon + 1)}) scale(1 -1)`}
                style={{ filter: "blur(3px)" }}
              />
            </g>
          ))}
          {mists.map((m, i) => {
            const speed = 0.25 + m.r * 0.35;
            const x = ((m.x * 2400 + f * speed * (i % 2 ? 1 : -1)) % 2400 + 2400) % 2400 - 240;
            return (
              <ellipse
                key={i}
                cx={x}
                cy={400 + m.y * 120}
                rx={520 + m.r * 420}
                ry={34 + m.r * 40}
                fill="#D2E6EC"
                opacity={0.09 + 0.08 * m.r}
                style={{ filter: "blur(28px)" }}
              />
            );
          })}
        </svg>
      </AbsoluteFill>
      <Vignette strength={0.5} />
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 03 一圈人影围坐，中间一盏灯
// ─────────────────────────────────────────────────────────
/** 长者先出现，其余人依次落座 */
const seatAppear = (i: number) => (i === 0 ? 8 : 34 + ((i * 5) % 9) * 9);

const Circle: React.FC<{ appear: (i: number) => number; boost?: number }> = ({ appear, boost = 0 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Lamp x={RING.cx} y={RING.cy} boost={boost} />
      {SEATS.map((seat) => {
        const t0 = appear(seat.i);
        const o = interpolate(f, [t0, t0 + 22], [0, 1], clamp);
        return <Figure key={seat.i} seat={seat} opacity={o} />;
      })}
    </>
  );
};

export const S03Circle: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 180], [1.04, 1]);
  return (
    <AbsoluteFill style={{ background: SEA.abyss }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "960px 560px" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <NightShore />
          <Circle appear={seatAppear} />
        </svg>
      </AbsoluteFill>
      <Vignette strength={0.6} />
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 04 人影之间的线一根根松开
// ─────────────────────────────────────────────────────────
const seatPos = (i: number) => SEATS.find((s) => s.i === i)!;
const hand = (i: number) => {
  const s = seatPos(i);
  return { x: s.x + ((RING.cx - s.x) / RING.rx) * 40 * s.s, y: s.y - 62 * s.s };
};

const THREADS: { a: number; b: number; knot: boolean; release: number }[] = [
  { a: 0, b: 4, knot: true, release: 58 },
  { a: 2, b: 6, knot: false, release: 80 },
  { a: 1, b: 5, knot: true, release: 100 },
  { a: 3, b: 7, knot: false, release: 120 },
  { a: 8, b: 3, knot: true, release: 140 },
  { a: 6, b: 1, knot: false, release: 166 },
  { a: 7, b: 2, knot: true, release: 166 },
];
export const KALA_FRAME = 166;

export const S04Threads: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = interpolate(f, [KALA_FRAME, KALA_FRAME + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const boost = interpolate(f, [KALA_FRAME, KALA_FRAME + 12, KALA_FRAME + 60], [0, 0.25, 0.1], clamp);
  return (
    <AbsoluteFill style={{ background: SEA.abyss }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <NightShore />
        <Circle appear={() => -100} boost={boost} />
        {THREADS.map((t, k) => {
          const A = hand(t.a);
          const B = hand(t.b);
          const draw = interpolate(f, [4 + k * 4, 34 + k * 4], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
          const p = interpolate(f, [t.release, t.release + 44], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          const mx = (A.x + B.x) / 2;
          const my = (A.y + B.y) / 2;
          const nx = -(B.y - A.y);
          const ny = B.x - A.x;
          const nl = Math.hypot(nx, ny) || 1;
          const bend = (random(`bend${k}`) - 0.5) * 220;
          // 松开：一端脱手向上飘，线变松、变淡
          const ex = B.x + (random(`fx${k}`) - 0.5) * 240 * p;
          const ey = B.y - 190 * p;
          const cx = mx + (nx / nl) * bend * (1 - p) + (random(`cx${k}`) - 0.5) * 160 * p;
          const cy = my + (ny / nl) * bend * (1 - p) + 40 - 150 * p;
          const d = `M ${A.x} ${A.y} Q ${cx} ${cy} ${ex} ${ey}`;
          const knotX = 0.25 * A.x + 0.5 * cx + 0.25 * ex;
          const knotY = 0.25 * A.y + 0.5 * cy + 0.25 * ey;
          return (
            <g key={k} opacity={(1 - p) * 0.85}>
              <path
                d={d}
                fill="none"
                stroke="#E2D3B2"
                strokeWidth={2.4 - 1.2 * p}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={`${draw} 1`}
              />
              {t.knot ? (
                <circle cx={knotX} cy={knotY} r={7} fill="none" stroke="#E2D3B2" strokeWidth={2.2} opacity={draw * (1 - Math.min(1, p * 3))} />
              ) : null}
            </g>
          );
        })}
        <ellipse
          cx={RING.cx}
          cy={RING.cy - 20}
          rx={pulse * 980}
          ry={pulse * 360}
          fill="none"
          stroke={SEA.lamp}
          strokeWidth={3}
          opacity={0.35 * (1 - pulse)}
        />
      </svg>
      <Vignette strength={0.6} />
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 05 一只碗，海藻在水中舒展（俯视）
// ─────────────────────────────────────────────────────────
const BOWL = { x: 960, y: 420, r: 300, rim: 36 };

type Frond = { angle: number; len: number; bend: number; seed: number; delay: number };
const FRONDS: Frond[] = Array.from({ length: 8 }).map((_, i) => ({
  angle: (i / 8) * Math.PI * 2 + random(`fa${i}`) * 0.5,
  len: 170 + random(`fl${i}`) * 70,
  bend: (random(`fb${i}`) - 0.5) * 1.1,
  seed: i,
  delay: 8 + i * 7,
}));

/** limu kala（马尾藻）：分枝的茎，两侧长着带齿的披针形叶和小气囊 */
const LEAF = "M 0 0 C 6 -5, 17 -6, 26 -1 L 24 0 L 26 1 C 17 6, 6 5, 0 0 Z";

const bezier = (P: number[][], u: number) => {
  const m = 1 - u;
  return [0, 1].map((k) => m * m * m * P[0][k] + 3 * m * m * u * P[1][k] + 3 * m * u * u * P[2][k] + u * u * u * P[3][k]);
};

type Stem = { P: number[][]; from: number; to: number };

const Leaves: React.FC<{ stem: Stem; grow: number; count: number; scale: number; seed: string }> = ({
  stem,
  grow,
  count,
  scale,
  seed,
}) => (
  <>
    {Array.from({ length: count }).map((_, k) => {
      const u = 0.1 + (k / count) * 0.88;
      const g = interpolate(grow, [stem.from + (stem.to - stem.from) * (u - 0.04), stem.from + (stem.to - stem.from) * (u + 0.12)], [0, 1], clamp);
      if (g <= 0) return null;
      const [x, y] = bezier(stem.P, u);
      const [x2, y2] = bezier(stem.P, Math.min(1, u + 0.01));
      const dir = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
      const side = k % 2 ? 1 : -1;
      // 叶片从贴着茎（0°）张开到 45°
      const open = side * (8 + 40 * g + 6 * random(`${seed}o${k}`));
      const sz = scale * (1.05 - u * 0.4) * (0.8 + 0.4 * random(`${seed}s${k}`)) * (0.35 + 0.65 * g);
      const tone = random(`${seed}c${k}`);
      return (
        <g key={k} transform={`translate(${x} ${y}) rotate(${dir + open}) scale(${sz})`}>
          <path d={LEAF} fill={tone > 0.6 ? "#A68A3C" : tone > 0.25 ? "#8C7632" : "#6F5E27"} opacity={0.92} />
          <path d="M 1 0 L 22 0" stroke="#5A4A1C" strokeWidth={0.8} opacity={0.6} />
          {k % 4 === 1 ? <circle cx={-3} cy={side * 6} r={3.2} fill="#9C8740" stroke="#5A4A1C" strokeWidth={0.6} /> : null}
        </g>
      );
    })}
  </>
);

const FrondShape: React.FC<{ fr: Frond; grow: number; t: number }> = ({ fr, grow, t }) => {
  const sway = 6 * wobble(t, fr.seed, 1.4);
  const L = fr.len;
  const main: Stem = {
    P: [
      [0, 0],
      [L * 0.3, L * fr.bend * 0.3],
      [L * 0.65, -L * fr.bend * 0.2],
      [L, L * fr.bend * 0.15],
    ],
    from: 0,
    to: 1,
  };
  const branches: Stem[] = [0.3, 0.52, 0.72].map((u, bi) => {
    const [x, y] = bezier(main.P, u);
    const dir = bi % 2 ? -1 : 1;
    const bl = L * (0.42 - bi * 0.08);
    return {
      P: [
        [x, y],
        [x + bl * 0.35, y + dir * bl * 0.35],
        [x + bl * 0.7, y + dir * bl * 0.45],
        [x + bl, y + dir * bl * 0.38],
      ],
      from: u,
      to: Math.min(1, u + 0.45),
    };
  });
  const stemPath = (st: Stem) => `M ${st.P[0][0]} ${st.P[0][1]} C ${st.P[1].join(" ")}, ${st.P[2].join(" ")}, ${st.P[3].join(" ")}`;
  const gOf = (st: Stem) => interpolate(grow, [st.from, st.to], [0, 1], clamp);
  return (
    <g transform={`rotate(${(fr.angle * 180) / Math.PI + sway})`}>
      {[main, ...branches].map((st, i) => (
        <path key={i} d={stemPath(st)} fill="none" stroke="#5E4E20" strokeWidth={i ? 2 : 3} strokeLinecap="round" pathLength={1} strokeDasharray={`${gOf(st)} 1`} />
      ))}
      {[main, ...branches].map((st, i) => (
        <Leaves key={i} stem={st} grow={grow} count={i ? 9 : 18} scale={i ? 0.85 : 1} seed={`f${fr.seed}b${i}`} />
      ))}
    </g>
  );
};

export const S05Seaweed: React.FC = () => {
  const f = useCurrentFrame();
  const ripples = [20, 72, 124].map((t0, i) => ({
    p: interpolate(f, [t0, t0 + 70], [0, 1], clamp),
    x: BOWL.x + (random(`rpx${i}`) - 0.5) * 220,
    y: BOWL.y + (random(`rpy${i}`) - 0.5) * 220,
  }));
  const spin = interpolate(f, [0, 180], [0, 6]);
  return (
    <AbsoluteFill style={{ background: "#07121C" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <pattern id="mat" patternUnits="userSpaceOnUse" width={48} height={48} patternTransform="rotate(45)">
            <rect width={48} height={48} fill="#0B1824" />
            <rect width={24} height={48} fill="#0E1F2E" />
            <rect y={20} width={48} height={4} fill="#091420" />
          </pattern>
          <radialGradient id="wood" cx="0.4" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#8A5E3A" />
            <stop offset="0.6" stopColor="#5A3A22" />
            <stop offset="1" stopColor="#2E1C10" />
          </radialGradient>
          <radialGradient id="water" cx="0.45" cy="0.42" r="0.65">
            <stop offset="0" stopColor="#15505E" />
            <stop offset="0.7" stopColor="#0B2F3B" />
            <stop offset="1" stopColor="#061A22" />
          </radialGradient>
          <radialGradient id="warmLight" cx="0.3" cy="0.2" r="0.8">
            <stop offset="0" stopColor={SEA.lamp} stopOpacity={0.22} />
            <stop offset="1" stopColor={SEA.lamp} stopOpacity={0} />
          </radialGradient>
          <clipPath id="waterClip">
            <circle cx={BOWL.x} cy={BOWL.y} r={BOWL.r - BOWL.rim} />
          </clipPath>
        </defs>
        <rect width={W} height={H} fill="url(#mat)" />
        <ellipse cx={BOWL.x + 18} cy={BOWL.y + 26} rx={BOWL.r + 20} ry={BOWL.r + 12} fill="#000" opacity={0.55} style={{ filter: "blur(18px)" }} />
        <circle cx={BOWL.x} cy={BOWL.y} r={BOWL.r} fill="url(#wood)" />
        {[0.93, 0.97].map((k) => (
          <circle key={k} cx={BOWL.x} cy={BOWL.y} r={BOWL.r * k} fill="none" stroke="#2A170B" strokeOpacity={0.35} strokeWidth={1.5} />
        ))}
        <circle cx={BOWL.x} cy={BOWL.y} r={BOWL.r - BOWL.rim} fill="url(#water)" />
        <g clipPath="url(#waterClip)">
          <g transform={`translate(${BOWL.x} ${BOWL.y}) rotate(${spin})`}>
            {FRONDS.map((fr, i) => {
              const grow = interpolate(f, [fr.delay, fr.delay + 110], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
              return <FrondShape key={i} fr={fr} grow={grow} t={f} />;
            })}
          </g>
          {/* 水面：一层半透明的青色，让海藻像沉在水里 */}
          <circle cx={BOWL.x} cy={BOWL.y} r={BOWL.r} fill="#1B5A6A" opacity={0.22} />
          {ripples.map((r, i) => (
            <circle key={i} cx={r.x} cy={r.y} r={10 + r.p * 190} fill="none" stroke={SEA.foam} strokeWidth={1.6} opacity={0.35 * (1 - r.p) * (r.p > 0 ? 1 : 0)} />
          ))}
          <path
            d={`M ${BOWL.x - 180} ${BOWL.y - 150} A 240 240 0 0 1 ${BOWL.x + 60} ${BOWL.y - 235}`}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity={0.16}
            strokeWidth={10}
            strokeLinecap="round"
            style={{ filter: "blur(3px)" }}
          />
        </g>
        <rect width={W} height={H} fill="url(#warmLight)" />
      </svg>
      <Vignette strength={0.65} />
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 06 Hoʻoponopono 字母逐个浮现，再缓缓归位
// ─────────────────────────────────────────────────────────
const WORD = [..."Hoʻoponopono"];
export const LETTER_APPEAR = WORD.map((_, i) => 8 + i * 7);
export const GATHER = [104, 150] as const;

export const S06Word: React.FC = () => {
  const f = useCurrentFrame();
  const gather = interpolate(f, [GATHER[0], GATHER[1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const settled = interpolate(f, [GATHER[1] - 6, GATHER[1] + 20], [0, 1], clamp);
  const rule = interpolate(f, [GATHER[1], GATHER[1] + 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="moonGlow" cx="0.5" cy="0.35" r="0.6">
            <stop offset="0" stopColor="#6FA6B8" stopOpacity={0.22 + 0.12 * settled} />
            <stop offset="1" stopColor="#6FA6B8" stopOpacity={0} />
          </radialGradient>
        </defs>
        <Ocean horizon={600} sky={["#030A14", "#0A2036", "#1B4A63"]} sea={["#0A2338", "#030A12"]} brightness={0.75} seed="s06" />
        <Stars n={70} maxY={560} opacity={0.7} seed="s06stars" />
        <rect width={W} height={600} fill="url(#moonGlow)" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 250,
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          fontFamily: FONT_EN,
          fontSize: 176,
          color: SEA.moon,
          letterSpacing: "0.01em",
          textShadow: `0 0 ${24 * settled}px rgba(160,210,225,${0.45 * settled})`,
        }}
      >
        {WORD.map((ch, i) => {
          const t0 = LETTER_APPEAR[i];
          const o = interpolate(f, [t0, t0 + 16], [0, 1], clamp);
          const blur = interpolate(f, [t0, t0 + 16], [8, 0], clamp);
          const sx = (random(`lx${i}`) - 0.5) * 1000;
          const sy = (random(`ly${i}`) - 0.62) * 440;
          const rot = (random(`lr${i}`) - 0.5) * 70;
          const sc = 0.7 + random(`ls${i}`) * 0.6;
          const drift = (1 - gather) * 14;
          const k = 1 - gather;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: o,
                filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
                transform: `translate(${sx * k + drift * wobble(f, i)}px, ${sy * k + drift * wobble(f, i + 20)}px) rotate(${rot * k}deg) scale(${1 + (sc - 1) * k})`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: 492,
          left: 960 - 380 * rule,
          width: 760 * rule,
          height: 1.5,
          background: "linear-gradient(to right, rgba(215,232,236,0), rgba(215,232,236,0.7), rgba(215,232,236,0))",
        }}
      />
      <Vignette strength={0.55} />
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};
