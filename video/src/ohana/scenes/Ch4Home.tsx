import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { H, Scrim, W, clamp, scatter, wobble } from "../common";
import { FPS } from "../script";
import { FONT_ZH, HOME, RED } from "../theme";
import { BeilunSea, HawaiiSea } from "./Ch5Niannian";

// 第四章只用空镜：湖、树荫、水洼、两张风景照。不出现人物

// ─────────────────────────────────────────────────────────
// 公共：暖色的湖、树荫
// ─────────────────────────────────────────────────────────

/** 湖上的太阳：第 15 场推镜头、第 16 场四句话绕着转，都以它为中心 */
const SUN = { x: 960, y: 486, r: 44 };

const hillPath = (x0: number, x1: number, base: number, height: number, seed: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = x0 + (x1 - x0) * t;
    const y = base - height * (0.55 + 0.25 * Math.sin(t * 5 + seed) + 0.12 * Math.sin(t * 13 + seed * 2) + 0.08 * Math.sin(t * 29 + seed));
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M ${x0} ${base} L ${pts.join(" L ")} L ${x1} ${base} Z`;
};

/** 北仑的湖：暖白天空、刚升起的太阳、远山、泛起涟漪的湖面。shift 做视差，rise 是太阳还差多少升到位 */
const Lake: React.FC<{ shift: number; rise?: number }> = ({ shift, rise = 0 }) => (
  <div style={{ position: "absolute", inset: 0, filter: "blur(1.5px)" }}>
    <LakeSharp shift={shift} rise={rise} />
  </div>
);

const LakeSharp: React.FC<{ shift: number; rise: number }> = ({ shift, rise }) => {
  const f = useCurrentFrame();
  const horizon = 560;
  const lines = scatter(70, "lake");
  const glints = scatter(40, "glint");
  const rings = [0, 45, 90].map((t0, i) => ({
    p: ((f + t0) % 135) / 135,
    x: [520, 1500, 900][i],
    y: [640, 700, 760][i],
  }));
  const sunY = SUN.y + rise;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="warmSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9DCC3" />
          <stop offset="1" stopColor="#F7F0E2" />
        </linearGradient>
        <linearGradient id="warmLake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCDCC9" />
          <stop offset="1" stopColor="#C4C6B2" />
        </linearGradient>
        <radialGradient id="sunHalo">
          <stop offset="0" stopColor="#FFF4DA" stopOpacity={0.95} />
          <stop offset="0.35" stopColor="#FBE2B4" stopOpacity={0.55} />
          <stop offset="1" stopColor="#F6D8A6" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="sunPath" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF1CF" stopOpacity={0.9} />
          <stop offset="1" stopColor="#FFF1CF" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect width={W} height={horizon} fill="url(#warmSky)" />
      <g transform={`translate(${shift * 0.15} 0)`}>
        <circle cx={SUN.x} cy={sunY} r={SUN.r * 6} fill="url(#sunHalo)" />
        <circle cx={SUN.x} cy={sunY} r={SUN.r} fill="#FFF3D6" />
      </g>
      <g transform={`translate(${shift * 0.3} 0)`}>
        <path d={hillPath(-200, 2200, horizon, 120, 1)} fill="#C9C8B0" />
      </g>
      <g transform={`translate(${shift * 0.6} 0)`}>
        <path d={hillPath(-300, 1300, horizon, 70, 4)} fill="#B3B598" />
        <path d={hillPath(1200, 2300, horizon, 90, 7)} fill="#AEB293" />
      </g>
      <g transform={`translate(${shift} 0)`}>
        <rect x={-200} y={horizon} width={W + 400} height={H - horizon} fill="url(#warmLake)" />
        {/* 太阳在湖面上的倒影：一条碎金 */}
        <rect x={SUN.x - 70 + shift * -0.85} y={horizon} width={140} height={H - horizon} fill="url(#sunPath)" opacity={0.35} />
        {glints.map((g, i) => {
          const y = horizon + 8 + g.y * g.y * (H - horizon);
          const spread = 30 + (y - horizon) * 0.35;
          const x = SUN.x + shift * -0.85 + (g.x - 0.5) * 2 * spread;
          return <rect key={i} x={x} y={y} width={10 + g.r * 36} height={2 + g.r * 2} rx={1} fill="#FFF6E0" opacity={0.6 * Math.max(0, Math.sin(f * 0.12 + g.p * 6))} />;
        })}
        {lines.map((l, i) => {
          const d = l.r;
          const y = horizon + 6 + d * d * (H - horizon);
          const x = ((l.x * (W + 400) + f * (0.2 + d * 0.5)) % (W + 400)) - 200;
          return <rect key={i} x={x} y={y} width={20 + 90 * d} height={1.5 + d * 1.5} rx={1} fill="#FFFFFF" opacity={(0.2 + 0.4 * Math.abs(Math.sin(f * 0.05 + l.p))) * (0.5 + d * 0.5)} />;
        })}
        {rings.map((r, i) => (
          <ellipse key={i} cx={r.x} cy={r.y} rx={20 + r.p * 260} ry={4 + r.p * 40} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.5 * (1 - r.p)} />
        ))}
      </g>
    </svg>
  );
};

/** 前景的芦苇：画面两侧，随风慢慢摆 */
const Reeds: React.FC = () => {
  const f = useCurrentFrame();
  const stalks = scatter(26, "reeds").map((r, i) => {
    const left = i % 2 === 0;
    const x = left ? -40 + r.x * 330 : W + 40 - r.x * 330;
    return { x, h: 260 + r.y * 300, lean: (left ? 1 : -1) * (10 + r.r * 30), p: r.p, i };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      {stalks.map((st) => {
        const sway = st.lean + 16 * Math.sin(f * 0.035 + st.p * 4) + 6 * wobble(f, st.i, 0.5);
        const tipX = st.x + sway;
        const tipY = H - st.h;
        const cx = st.x + sway * 0.2;
        const cy = H - st.h * 0.55;
        const a = Math.atan2(tipY - cy, tipX - cx);
        return (
          <g key={st.i} opacity={0.75}>
            <path d={`M ${st.x} ${H + 10} Q ${cx} ${cy} ${tipX} ${tipY}`} stroke="#8E8466" strokeWidth={3} fill="none" strokeLinecap="round" />
            <ellipse cx={tipX + Math.cos(a) * 22} cy={tipY + Math.sin(a) * 22} rx={26} ry={6} transform={`rotate(${(a * 180) / Math.PI} ${tipX + Math.cos(a) * 22} ${tipY + Math.sin(a) * 22})`} fill="#A8946A" />
          </g>
        );
      })}
    </svg>
  );
};

/** 树荫：天光从左边来，树冠虚化（树干和地面在 Ground 里，清楚一些） */
const Grove: React.FC<{ shift: number }> = ({ shift }) => (
  <div style={{ position: "absolute", inset: 0, filter: "blur(5px)" }}>
    <GroveSharp shift={shift} />
  </div>
);

const GroveSharp: React.FC<{ shift: number }> = ({ shift }) => {
  const f = useCurrentFrame();
  const leaves = scatter(130, "canopy");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="sunLeft" cx="0.05" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#FFF6DF" />
          <stop offset="0.5" stopColor="#EDE3C9" />
          <stop offset="1" stopColor="#D8CFB2" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sunLeft)" />
      <g transform={`translate(${shift * 0.4} 0)`}>
        {leaves.map((l, i) => {
          // 叶团集中在几棵树的树冠附近
          const tree = TREES[i % 4];
          const cx = tree + (l.x - 0.5) * 520 + 6 * wobble(f, i, 0.6);
          const cy = 60 + l.y * l.y * 360 + 4 * wobble(f, i + 9, 0.6);
          return <ellipse key={i} cx={cx} cy={cy} rx={26 + l.r * 46} ry={20 + l.r * 34} fill={LEAF_COLORS[i % 5]} opacity={0.7} />;
        })}
      </g>
    </svg>
  );
};

/** 树：x 是树冠中心，base 是树根落地的 y（远的树根高、树干细） */
const TREES = [180, 420, 1480, 1720];
const TRUNKS = [
  { x: 180, base: 780, w: 15 },
  { x: 420, base: 690, w: 10 },
  { x: 1480, base: 700, w: 11 },
  { x: 1720, base: 820, w: 17 },
];
const LEAF_COLORS = ["#A9B08E", "#95A07C", "#B9BE9F", "#8B9672", "#C4C7A6"];

/** 小路上的水洼：映着天光 */
const PUDDLE = { cx: 1130, cy: 716, rx: 160, ry: 26 };
const GROUND = 620;
/** 地面相对镜头平移的视差系数 */
const GROUND_PARALLAX = 0.7;

/** 地面：小路、树干、晃动的光斑和树影、水洼；ripples 是水洼里落叶荡开的涟漪 */
const Ground: React.FC<{ shift: number; ripples?: Ripple[] }> = ({ shift, ripples = [] }) => {
  const f = useCurrentFrame();
  const spots = scatter(22, "groundLight");
  const shades = scatter(16, "groundShade");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="groundFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D2CBAE" />
          <stop offset="1" stopColor="#B9B08E" />
        </linearGradient>
        <linearGradient id="pathFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E6DDC4" />
          <stop offset="1" stopColor="#D6C9A8" />
        </linearGradient>
        <linearGradient id="puddleSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFBF0" />
          <stop offset="1" stopColor="#E8E2CE" />
        </linearGradient>
        <clipPath id="puddleClip">
          <ellipse cx={PUDDLE.cx} cy={PUDDLE.cy} rx={PUDDLE.rx} ry={PUDDLE.ry} />
        </clipPath>
        <filter id="soft6">
          <feGaussianBlur stdDeviation={6} />
        </filter>
        <filter id="soft1">
          <feGaussianBlur stdDeviation={1.5} />
        </filter>
      </defs>
      <g transform={`translate(${shift * GROUND_PARALLAX} 0)`}>
        <rect x={-200} y={GROUND} width={W + 400} height={H - GROUND} fill="url(#groundFill)" />
        <rect x={-200} y={GROUND - 30} width={W + 400} height={40} fill="#D8D1B6" opacity={0.6} filter="url(#soft6)" />
        {/* 小路：从左下拐向远处 */}
        <path d={`M 330 ${H} C 640 900, 900 720, 1180 ${GROUND} L 1290 ${GROUND} C 1160 720, 1080 880, 1180 ${H} Z`} fill="url(#pathFill)" />
        {/* 树干落在地上 */}
        <g filter="url(#soft1)">
          {TRUNKS.map((t, i) => (
            <g key={t.x}>
              <ellipse cx={t.x + 30} cy={t.base} rx={t.w * 5} ry={t.w * 0.8} fill="#7C7A5E" opacity={0.25} />
              <path d={`M ${t.x} ${t.base} C ${t.x + 10} ${t.base - 200}, ${t.x - 20} 500, ${t.x + 30 * (i % 2 ? 1 : -1)} 180`} stroke="#6F6A52" strokeWidth={t.w} fill="none" strokeLinecap="round" opacity={0.75} />
            </g>
          ))}
        </g>
        {/* 树影 */}
        <g filter="url(#soft6)">
          {shades.map((sh, i) => (
            <ellipse key={i} cx={sh.x * W + 40 * wobble(f, i, 0.5)} cy={GROUND + 20 + sh.y * 420} rx={60 + sh.r * 120} ry={10 + sh.r * 18} fill="#6F6D52" opacity={0.2} />
          ))}
        </g>
        {/* 水洼 */}
        <ellipse cx={PUDDLE.cx} cy={PUDDLE.cy + 2} rx={PUDDLE.rx + 10} ry={PUDDLE.ry + 5} fill="#A99E7E" opacity={0.7} />
        <ellipse cx={PUDDLE.cx} cy={PUDDLE.cy} rx={PUDDLE.rx} ry={PUDDLE.ry} fill="url(#puddleSky)" />
        <g clipPath="url(#puddleClip)">
          {/* 树干和树冠的倒影 */}
          {[1030, 1210].map((x, i) => (
            <rect key={x} x={x + 4 * wobble(f, i, 0.4)} y={PUDDLE.cy - PUDDLE.ry} width={7} height={PUDDLE.ry * 2} fill="#8C8668" opacity={0.3} />
          ))}
          <ellipse cx={PUDDLE.cx - 60} cy={PUDDLE.cy + PUDDLE.ry} rx={90} ry={14} fill="#A9B08E" opacity={0.35} />
          {ripples.map((r, i) => (
            <RippleRings key={i} r={r} />
          ))}
        </g>
        {/* 光斑 */}
        <g filter="url(#soft6)">
          {spots.map((sp, i) => (
            <ellipse
              key={i}
              cx={sp.x * W + 50 * wobble(f, i + 3, 0.6)}
              cy={GROUND + 30 + sp.y * 400 + 8 * wobble(f, i + 11, 0.6)}
              rx={30 + sp.r * 60}
              ry={7 + sp.r * 11}
              fill="#FFF1CC"
              opacity={0.35 + 0.2 * Math.sin(f * 0.07 + sp.p)}
            />
          ))}
        </g>
      </g>
    </svg>
  );
};

type Ripple = { x: number; y: number; age: number; size: number };

const RippleRings: React.FC<{ r: Ripple }> = ({ r }) => (
  <g>
    {[0, 9, 18].map((lag, k) => {
      const t = (r.age - lag) / 70;
      if (t <= 0 || t >= 1) return null;
      return <ellipse key={k} cx={r.x} cy={r.y} rx={6 + t * 120 * r.size} ry={1.5 + t * 20 * r.size} fill="none" stroke="#FFFFFF" strokeWidth={2.2} opacity={0.8 * (1 - t) * (k === 0 ? 1 : 0.6)} />;
    })}
  </g>
);

/** 一片叶子；flat < 1 时竖直方向压扁（平躺在水面上） */
const Leaf: React.FC<{ x: number; y: number; rot: number; flat?: number; color: string; size?: number }> = ({ x, y, rot, flat = 1, color, size = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${size} ${size * flat}) rotate(${rot})`}>
    <path d="M 0 -16 C 9 -8, 9 6, 0 16 C -9 6, -9 -8, 0 -16 Z" fill={color} />
    <path d="M 0 -14 L 0 14" stroke="#6F7456" strokeWidth={1.2} opacity={0.6} />
  </g>
);

/** 慢慢飘落的叶子，循环 */
const FallingLeaves: React.FC<{ seed: string; count: number }> = ({ seed, count }) => {
  const f = useCurrentFrame();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      {scatter(count, seed).map((l, i) => {
        const period = 200 + l.r * 120;
        const t = ((f + l.p * period) % period) / period;
        const x = l.x * W + 80 * Math.sin(t * 6 + i) - t * 120;
        const y = -40 + t * (H + 80);
        return <Leaf key={i} x={x} y={y} rot={t * 540 + i * 40} flat={0.6 + 0.4 * Math.abs(Math.sin(t * 9 + i))} color={LEAF_COLORS[(i + 3) % 5]} size={1.5 + l.r * 0.8} />;
      })}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────
// 15 北仑 · 妈妈：清晨的湖，太阳刚升起，芦苇随风
// ─────────────────────────────────────────────────────────
export const S15Lake: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 210], [1.03, 1.08]);
  const shift = interpolate(f, [0, 210], [0, -40]);
  const rise = interpolate(f, [0, 210], [26, 0], { easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill style={{ background: HOME.paper }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${SUN.x}px ${SUN.y}px` }}>
        <Lake shift={shift} rise={rise} />
        <Reeds />
      </AbsoluteFill>
      <Scrim tone="light" strength={1.15} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 16 四句话化成光点绕着太阳；心里的灰擦干净，家就亮了
// ─────────────────────────────────────────────────────────
const WORDS = ["对不起", "请原谅", "谢谢你", "我爱你"];
export const S16_MERGE = 112;

export const S16Glow: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 150], [1.08, 1.2], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const clean = interpolate(f, [S16_MERGE - 10, S16_MERGE + 30], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const merge = interpolate(f, [S16_MERGE - 22, S16_MERGE], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const burst = interpolate(f, [S16_MERGE, S16_MERGE + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const c = { x: SUN.x, y: SUN.y };
  const dust = scatter(40, "dust16");
  const words = WORDS.map((w, i) => {
    const th = f * 0.035 + (i * Math.PI) / 2;
    const rx = 380 * (1 - merge);
    const ry = 130 * (1 - merge);
    const x = c.x + rx * Math.cos(th);
    const y = c.y + ry * Math.sin(th) - 40 * (1 - merge);
    const inFront = Math.sin(th) > 0;
    const o = interpolate(f, [8 + i * 12, 26 + i * 12], [0, 1], clamp);
    return { w, x, y, inFront, o };
  });
  return (
    <AbsoluteFill style={{ background: HOME.paper }}>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: `${SUN.x}px ${SUN.y}px`,
          filter: `saturate(${0.6 + 0.45 * clean}) brightness(${0.9 + 0.12 * clean})`,
        }}
      >
        <Lake shift={-40} />
        <Reeds />
        {words.map((d) => (
          <div
            key={d.w}
            style={{
              position: "absolute",
              left: d.x,
              top: d.y,
              transform: `translate(-50%, -50%) scale(${(1 - merge * 0.85) * (d.inFront ? 1 : 0.86)})`,
              fontFamily: FONT_ZH,
              fontSize: 34,
              letterSpacing: "0.2em",
              color: "#FFF6E2",
              textShadow: "0 0 14px rgba(255,200,120,0.9), 0 0 30px rgba(255,180,90,0.6)",
              opacity: d.o * (d.inFront ? 1 : 0.55) * (1 - burst),
              whiteSpace: "nowrap",
            }}
          >
            {merge > 0.7 ? "·" : d.w}
          </div>
        ))}
        {/* 光点汇入太阳后漾开 */}
        <div
          style={{
            position: "absolute",
            left: c.x - 400 * burst,
            top: c.y - 400 * burst,
            width: 800 * burst,
            height: 800 * burst,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,236,196,0.75) 0%, rgba(255,214,150,0.25) 45%, rgba(255,214,150,0) 70%)",
            opacity: 1 - burst * 0.6,
            mixBlendMode: "screen",
          }}
        />
      </AbsoluteFill>
      {/* 心里的灰：一开始飘着细尘，擦干净后散去 */}
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", opacity: 1 - clean }}>
        {dust.map((d, i) => (
          <circle key={i} cx={d.x * W + 20 * wobble(f, i, 0.5)} cy={d.y * H + 15 * wobble(f, i + 7, 0.5)} r={1 + d.r * 2.5} fill="#8A8176" opacity={0.35} />
        ))}
      </svg>
      <AbsoluteFill style={{ background: "#8E877C", mixBlendMode: "multiply", opacity: 0.18 * (1 - clean) }} />
      <Scrim tone="light" strength={1.15} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 17 北仑 · 爸爸：树荫下的小路，光斑在地上晃，叶子慢慢飘落
// ─────────────────────────────────────────────────────────
export const S17Grove: React.FC = () => {
  const f = useCurrentFrame();
  const shift = interpolate(f, [0, 180], [0, -36]);
  const push = interpolate(f, [0, 180], [1.02, 1.07]);
  return (
    <AbsoluteFill style={{ background: HOME.paper }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "960px 420px" }}>
        <Grove shift={shift} />
        <Ground shift={shift} />
        <FallingLeaves seed="fall17" count={7} />
      </AbsoluteFill>
      <Scrim tone="light" strength={1.15} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 18 两片叶子先后落进水洼，荡开涟漪；之后落下的叶子越来越多
// ─────────────────────────────────────────────────────────
/** 叶子落到水面的帧（配乐在这两帧各一声水滴）；后面几片更轻 */
export const LANDINGS = [31, 49];
const LATER = [78, 94, 106, 118, 128, 137];

export const S18Ripples: React.FC = () => {
  const f = useCurrentFrame();
  // 镜头从第 17 场结束时的取景（1.07 倍，以 960,420 为中心）出发，交叉淡化时两场对得上；
  // 推近的同时把水洼移到画面正中，叶子落水时正好在视线中间
  const k = interpolate(f, [0, 70], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const gx = -36 * GROUND_PARALLAX; // 水洼在舞台上的平移
  const px = PUDDLE.cx + gx;
  const py = PUDDLE.cy;
  const zoom = interpolate(k, [0, 1], [1.07, 1.3]) + interpolate(f, [70, 150], [0, 0.04], clamp);
  const ox = interpolate(k, [0, 1], [(1 - 1.07) * 960, 960 - 1.3 * px]) - (zoom - interpolate(k, [0, 1], [1.07, 1.3])) * px;
  const oy = interpolate(k, [0, 1], [(1 - 1.07) * 420, 500 - 1.3 * py]) - (zoom - interpolate(k, [0, 1], [1.07, 1.3])) * py;
  const spots = scatter(8, "landing");
  const drops = [...LANDINGS.map((t) => ({ t, size: 1 })), ...LATER.map((t) => ({ t, size: 0.6 }))].map((d, i) => ({
    ...d,
    x: px + (spots[i].x - 0.5) * PUDDLE.rx * 1.2,
    y: py + (spots[i].y - 0.5) * PUDDLE.ry * 0.8,
    i,
  }));
  const ripples = drops.filter((d) => f >= d.t).map((d) => ({ x: d.x - gx, y: d.y, age: f - d.t, size: d.size }));
  return (
    <AbsoluteFill style={{ background: HOME.paper }}>
      <AbsoluteFill style={{ transform: `translate(${ox}px, ${oy}px) scale(${zoom})`, transformOrigin: "0 0" }}>
        <Grove shift={-36} />
        <Ground shift={-36} ripples={ripples} />
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
          {drops.map((d) => {
            // 落下前 44 帧从上方飘下，落水后贴着水面、慢慢漂
            const fall = interpolate(f, [d.t - 44, d.t], [0, 1], clamp);
            if (f < d.t - 44) return null;
            const landed = f >= d.t;
            const sway = landed ? 0 : 60 * Math.sin(fall * 5 + d.i) * (1 - fall);
            const x = d.x + sway + (landed ? 0.15 * (f - d.t) : 0);
            const y = interpolate(fall, [0, 1], [d.y - 520, d.y], { easing: Easing.in(Easing.quad) });
            const flat = landed ? interpolate(f - d.t, [0, 6], [0.8, 0.42], clamp) : 0.7 + 0.3 * Math.abs(Math.sin(fall * 7 + d.i));
            return <Leaf key={d.i} x={x} y={y} rot={landed ? 70 + d.i * 25 : fall * 400 + d.i * 50} flat={flat} color={LEAF_COLORS[(d.i + 1) % 5]} size={d.size === 1 ? 1.6 : 1.2} />;
          })}
        </svg>
      </AbsoluteFill>
      <Scrim tone="light" strength={1.15} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 19 两张照片并排：夏威夷的海、北仑的港，中间是一条海平线
// ─────────────────────────────────────────────────────────
const Print: React.FC<{ x: number; y: number; w: number; h: number; rot: number; delay: number; view: { scale: number; x: number; y: number }; children: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  rot,
  delay,
  view,
  children,
}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + 22], [0, 1], clamp);
  const dy = interpolate(f, [delay, delay + 30], [30, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const float = 4 * Math.sin(f * 0.05 + delay);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + dy + float,
        width: w + 32,
        height: h + 32,
        padding: 16,
        background: "#FBF8F2",
        boxShadow: "0 18px 40px rgba(80,60,40,0.28), 0 2px 6px rgba(80,60,40,0.18)",
        transform: `rotate(${rot}deg)`,
        opacity: o,
      }}
    >
      {/* 照片里是一整个舞台大小的场景，按 view 缩放、裁切 */}
      <div style={{ position: "relative", width: w, height: h, overflow: "hidden", filter: "sepia(0.14) saturate(0.95) contrast(0.97)" }}>
        <div style={{ position: "absolute", left: -view.x, top: -view.y, width: W, height: H, transform: `scale(${view.scale})`, transformOrigin: "0 0" }}>{children}</div>
      </div>
    </div>
  );
};

export const S19Prints: React.FC = () => {
  const f = useCurrentFrame();
  const drift = interpolate(f, [0, 180], [0, 22]);
  const line = interpolate(f, [0, 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const horizon = 470;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 45%, #FBF6EC 0%, ${HOME.paper} 60%, ${HOME.sand} 100%)` }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <line x1={960 - 960 * line} y1={horizon} x2={960 + 960 * line} y2={horizon} stroke={HOME.inkSoft} strokeWidth={1.5} opacity={0.5} />
        {Array.from({ length: 9 }).map((_, i) => {
          const x = 760 + i * 50 + ((f * 0.6) % 50);
          const y = horizon + 18 + (i % 3) * 16;
          return <path key={i} d={`M ${x} ${y} q 10 -6 20 0`} fill="none" stroke={HOME.inkSoft} strokeWidth={1.4} opacity={0.35 * line} />;
        })}
        <circle cx={960} cy={horizon} r={5} fill={RED} opacity={line} />
      </svg>
      <Print x={300 + drift} y={120} w={330} h={440} rot={-3} delay={6} view={{ scale: 0.5, x: 0, y: 100 }}>
        <HawaiiSea />
      </Print>
      <Print x={1050 - drift} y={170} w={520} h={390} rot={2.5} delay={16} view={{ scale: 0.4, x: 250, y: 25 }}>
        <BeilunSea />
      </Print>
      <Scrim tone="light" strength={1.15} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 20 四句话再次出现，每句后面接一个词；圆上四个暖点依次亮起
// ─────────────────────────────────────────────────────────
export const S20Circle: React.FC = () => {
  const f = useCurrentFrame();
  const duration = 7 * FPS;
  const first = Math.round(0.4 * FPS);
  const slot = (duration - first) / 4;
  const cx = 960;
  const cy = 520;
  const r = 360;
  const lit = [0, 1, 2, 3].map((k) => interpolate(f, [first + k * slot, first + k * slot + 20], [0, 1], clamp));
  const whole = interpolate(f, [first + 3 * slot + 20, first + 3 * slot + 60], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 75% at 50% 48%, #FFF9EE 0%, ${HOME.paper} 65%, #E7D9BF 100%)` }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <radialGradient id="warmDot">
            <stop offset="0" stopColor="#FFE0A8" stopOpacity={0.9} />
            <stop offset="1" stopColor="#FFE0A8" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#C9A77A" strokeWidth={2} opacity={0.25 + 0.35 * whole} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F4C98A" strokeWidth={14} opacity={0.25 * whole} style={{ filter: "blur(8px)" }} />
        {lit.map((l, k) => {
          const a = -Math.PI / 2 + (k * Math.PI) / 2;
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          return (
            <g key={k} opacity={l}>
              <circle cx={x} cy={y} r={46} fill="url(#warmDot)" />
              <circle cx={x} cy={y} r={7} fill={k === 3 ? RED : "#E0A35C"} />
            </g>
          );
        })}
        {scatter(24, "warm20").map((s, i) => (
          <circle key={i} cx={cx + (r + 40 * s.r) * Math.cos(s.p + f * 0.004)} cy={cy + (r + 40 * s.r) * Math.sin(s.p + f * 0.004)} r={1.5 + s.r * 2} fill="#E9B878" opacity={whole * (0.3 + 0.4 * Math.abs(Math.sin(f * 0.06 + i)))} />
        ))}
      </svg>
      <AbsoluteFill style={{ background: `rgba(255,236,200,${0.12 * whole})`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
