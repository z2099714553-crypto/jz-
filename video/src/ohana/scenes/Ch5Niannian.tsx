import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { H, Scrim, Vignette, W, clamp, scatter } from "../common";
import { CatPhoto, Ear, Eye } from "../Cat";
import { Photo } from "../Photo";
import { END_CARD } from "../script";
import { FONT_EN, FONT_ZH, HOME, RED } from "../theme";
import { Palm } from "./Ch2Phrases";
import { Ocean } from "./Seascape";

// ─────────────────────────────────────────────────────────
// 贯穿的「0」：第 20 场的圆 → 21 缩成 0 → 22 停住 → 片尾长成圆满的圈
// ─────────────────────────────────────────────────────────
const CIRCLE = { cx: 960, cy: 520, r: 360 };
export const ZERO = { cx: 960, cy: 420, rx: 64, ry: 92, w: 15 };

const PaperBg: React.FC<{ warm?: number }> = ({ warm = 1 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 80% 75% at 50% 48%, #FFF9EE 0%, ${HOME.paper} 65%, ${interpolateColors(warm, [0, 1], [HOME.paper, "#E7D9BF"])} 100%)`,
    }}
  />
);

// 21 画面变空，只剩一个圆，慢慢缩成「0」
export const S21Zero: React.FC = () => {
  const f = useCurrentFrame();
  const k = interpolate(f, [16, 120], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const glow = interpolate(f, [0, 30], [0.25, 0], clamp);
  const rx = interpolate(k, [0, 1], [CIRCLE.r, ZERO.rx]);
  const ry = interpolate(k, [0, 1], [CIRCLE.r, ZERO.ry]);
  const cy = interpolate(k, [0, 1], [CIRCLE.cy, ZERO.cy]);
  const sw = interpolate(k, [0, 1], [2, ZERO.w]);
  const color = interpolateColors(k, [0, 1], ["#C9A77A", HOME.ink]);
  return (
    <AbsoluteFill>
      <PaperBg warm={1 - k} />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <ellipse cx={CIRCLE.cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#F4C98A" strokeWidth={14} opacity={glow} style={{ filter: "blur(8px)" }} />
        <ellipse cx={CIRCLE.cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth={sw} opacity={0.5 + 0.5 * k} />
      </svg>
    </AbsoluteFill>
  );
};

// 22「0」停住不动；中间亮起一个小红点——那个放不下的「念」
export const S22Dot: React.FC = () => {
  const f = useCurrentFrame();
  const dot = interpolate(f, [46, 70], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const pulse = 1 + 0.12 * Math.sin(f * 0.12) * (f > 70 ? 1 : 0);
  return (
    <AbsoluteFill>
      <PaperBg warm={0} />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <ellipse cx={ZERO.cx} cy={ZERO.cy} rx={ZERO.rx} ry={ZERO.ry} fill="none" stroke={HOME.ink} strokeWidth={ZERO.w} />
        <circle cx={ZERO.cx} cy={ZERO.cy} r={34 * dot * pulse} fill={RED} opacity={0.12} />
        <circle cx={ZERO.cx} cy={ZERO.cy} r={9 * dot} fill={RED} />
      </svg>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 23 图 3：窗台上的念念，眨眼，耳朵抖动，窗外的城市灯光闪烁
// ─────────────────────────────────────────────────────────
const CAT_W = {
  src: "ohana/cartoon/niannian_window.png",
  w: 1280,
  h: 960,
  scale: 1.12,
  x: 71,
  y: -28,
  eyes: [
    { x: 717, y: 350, rx: 25, ry: 23 },
    { x: 797, y: 345, rx: 18, ry: 20 },
  ] as Eye[],
  ears: [
    { poly: [[596, 296], [603, 236], [614, 196], [626, 181], [641, 187], [664, 203], [694, 222]], pivot: [645, 259], dir: -1 },
    { poly: [[780, 214], [800, 196], [822, 180], [843, 168], [851, 176], [849, 200], [842, 228], [834, 256]], pivot: [807, 235], dir: 1 },
  ] as Ear[],
};

/** 夜里的窗：在原图坐标里画，和猫用同一个变换 */
const WindowRoom: React.FC = () => {
  const f = useCurrentFrame();
  const lights = scatter(90, "city");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="nightGlass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#10202C" />
          <stop offset="1" stopColor="#0B1418" />
        </linearGradient>
        <linearGradient id="marble" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ECE9E3" />
          <stop offset="1" stopColor="#D2CDC5" />
        </linearGradient>
        <linearGradient id="marbleFace" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#D8D3CA" />
          <stop offset="1" stopColor="#BDB6AB" />
        </linearGradient>
        <linearGradient id="curtain" x1="0" y1="0" x2="1" y2="0">
          {Array.from({ length: 13 }).map((_, i) => (
            <stop key={i} offset={i / 12} stopColor={i % 2 ? "#E9E3D8" : "#CFC6B8"} />
          ))}
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="#17110E" />
      <g transform={`translate(${CAT_W.x} ${CAT_W.y}) scale(${CAT_W.scale})`}>
        {/* 窗外 */}
        <polygon points="-200,-60 458,-60 592,306 -200,650" fill="url(#nightGlass)" />
        <g clipPath="url(#glassClip)">
          <clipPath id="glassClip">
            <polygon points="-200,-60 458,-60 592,306 -200,650" />
          </clipPath>
          <rect x={-120} y={70} width={420} height={120} fill="#2E6B48" opacity={0.75} transform="skewX(-12)" />
          <rect x={-60} y={110} width={260} height={3} fill="#E8F4EA" opacity={0.5} transform="skewX(-12)" />
          {[-100, 60, 190, 320].map((x, i) => (
            <g key={x}>
              <rect x={x} y={30 + i * 6} width={4} height={60} fill="#2A3340" />
              <circle cx={x + 2} cy={28 + i * 6} r={9} fill="#F4FAFF" opacity={0.85 + 0.15 * Math.sin(f * 0.2 + i)} />
              <circle cx={x + 2} cy={28 + i * 6} r={26} fill="#DDEBFF" opacity={0.18} />
            </g>
          ))}
          <rect x={350} y={140} width={110} height={100} fill="#3A2E24" />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={358 + (i % 4) * 26} y={150 + Math.floor(i / 4) * 28} width={16} height={12} fill="#F2C57A" opacity={0.5 + 0.5 * Math.abs(Math.sin(f * 0.05 + i * 1.7))} />
          ))}
          {lights.map((l, i) => {
            // 灯沿着几条「街道」排开，远处小而密，近处大而暖
            const row = i % 6;
            const x = -180 + l.x * 760;
            const y = 250 + row * 55 + (l.y - 0.5) * 22 - x * 0.18;
            const r = 2 + row * 0.9 + l.r * 2;
            return (
              <g key={i} opacity={0.45 + 0.5 * Math.abs(Math.sin(f * (0.03 + l.r * 0.05) + l.p))}>
                <circle cx={x} cy={y} r={r * 3.2} fill={i % 4 ? "#F2B866" : "#DDE8F4"} opacity={0.14} />
                <circle cx={x} cy={y} r={r} fill={i % 4 ? "#FFD69A" : "#F4F8FF"} />
              </g>
            );
          })}
          <polygon points="-200,-60 120,-60 -40,650 -200,650" fill="#FFFFFF" opacity={0.04} />
        </g>
        {/* 窗框 */}
        <polygon points="-200,640 592,300 598,318 -200,670" fill="#3B2A1E" />
        <polygon points="-200,640 592,300 596,306 -200,648" fill="#6B5038" opacity={0.7} />
        {/* 窗与窗帘之间的石柱 */}
        <polygon points="458,-60 900,-60 900,300 592,306" fill="#2A2522" />
        {/* 窗台台面与立面 */}
        <polygon points="-300,700 598,316 900,300 900,420 808,506 424,960 -300,1100" fill="url(#marble)" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-200 + i * 180} ${760 - i * 70} C ${50 + i * 180} ${690 - i * 60}, ${250 + i * 160} ${650 - i * 60}, ${420 + i * 120} ${560 - i * 50}`} fill="none" stroke="#B8B2A8" strokeWidth={1.2} opacity={0.5} />
        ))}
        <polygon points="808,506 900,430 900,1120 250,1120 424,960" fill="url(#marbleFace)" />
        <path d="M 808 506 L 424 960" stroke="#FFFFFF" strokeWidth={5} opacity={0.6} />
        <path d="M 840 560 L 560 960 M 870 600 L 640 960" stroke="#A9A194" strokeWidth={2} opacity={0.5} />
        <polygon points="720,1120 900,860 900,1120" fill="#7A5638" opacity={0.7} />
      </g>
    </svg>
  );
};

const Curtain: React.FC = () => {
  const f = useCurrentFrame();
  const x0 = CAT_W.x + 893 * CAT_W.scale;
  const folds = Array.from({ length: 12 }).map((_, i) => x0 + i * 72 + 5 * Math.sin(f * 0.025 + i));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", filter: "blur(1.5px)" }}>
      <defs>
        <linearGradient id="linen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#D9D1C4" />
          <stop offset="1" stopColor="#E9E3D8" />
        </linearGradient>
      </defs>
      <rect x={x0 - 12} y={-20} width={W} height={H + 40} fill="url(#linen)" opacity={0.97} />
      {folds.map((x, i) => (
        <rect key={i} x={x} y={-20} width={26 + (i % 3) * 10} height={H + 40} fill={i % 2 ? "#FFFFFF" : "#B9AF9F"} opacity={i % 2 ? 0.22 : 0.16} style={{ filter: "blur(9px)" }} />
      ))}
      <rect x={x0 - 12} y={-20} width={18} height={H + 40} fill="#CFC6B7" opacity={0.8} style={{ filter: "blur(4px)" }} />
    </svg>
  );
};

export const S23Window: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 150], [1.02, 1.08]);
  return (
    <AbsoluteFill style={{ background: "#17110E" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "900px 380px" }}>
        <WindowRoom />
        <CatPhoto {...CAT_W} blinks={[64]} twitches={[{ ear: 0, t: 100 }, { ear: 0, t: 112, deg: 6 }]} breathe={0.005} breathePeriod={2.6} pivot={[740, 600]} />
        <Curtain />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 70% at 70% 45%, rgba(255,210,150,0.10) 0%, rgba(0,0,0,0) 60%)" }} />
      </AbsoluteFill>
      <Vignette strength={0.5} />
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 24 图 4：沙发上的念念看镜头
// ─────────────────────────────────────────────────────────
const CAT_S = {
  src: "ohana/cartoon/niannian_sofa.png",
  w: 960,
  h: 1280,
  scale: 1.2,
  x: 472,
  y: -204,
  eyes: [
    { x: 237, y: 547, rx: 31, ry: 30 },
    { x: 356, y: 562, rx: 27, ry: 27 },
  ] as Eye[],
  ears: [
    { poly: [[122, 452], [126, 390], [136, 348], [150, 326], [162, 320], [180, 338], [204, 368], [230, 398]], pivot: [176, 425], dir: -1 },
    { poly: [[344, 440], [372, 410], [404, 386], [430, 372], [441, 372], [442, 398], [432, 438], [412, 484]], pivot: [378, 462], dir: 1 },
  ] as Ear[],
};

/** 花格沙发、几何纹靠垫、窗外夜色；整体虚化做景深 */
const Sofa: React.FC<{ blur?: number }> = ({ blur = 6 }) => {
  const f = useCurrentFrame();
  const bokeh = scatter(26, "sofaNight");
  return (
    <div style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)` }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <pattern id="plaid" patternUnits="userSpaceOnUse" width={180} height={180} patternTransform="skewX(-24) rotate(-3)">
            <rect width={180} height={180} fill="#D3CCBC" />
            <rect x={0} y={84} width={180} height={2} fill="#7B8471" opacity={0.28} />
            <rect x={84} y={0} width={2} height={180} fill="#7B8471" opacity={0.28} />
            <rect x={0} y={92} width={180} height={1} fill="#7B8471" opacity={0.2} />
            <rect x={92} y={0} width={1} height={180} fill="#7B8471" opacity={0.2} />
          </pattern>
          <pattern id="kilim" patternUnits="userSpaceOnUse" width={220} height={220}>
            <rect width={220} height={220} fill="#CDBFA5" />
            <path d="M 0 110 L 55 40 L 110 110 L 55 180 Z" fill="#8FA2AD" opacity={0.7} />
            <path d="M 110 110 L 165 40 L 220 110 L 165 180 Z" fill="#6E5A48" opacity={0.6} />
          </pattern>
          <linearGradient id="seatShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity={0.18} />
            <stop offset="0.4" stopColor="#000" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="#1F2733" />
        {bokeh.map((b, i) => (
          <circle key={i} cx={1000 + b.x * 900} cy={b.y * 300} r={8 + b.r * 20} fill={i % 3 ? "#F4C58A" : "#DDE8F4"} opacity={0.25 + 0.3 * Math.abs(Math.sin(f * 0.04 + b.p))} />
        ))}
        <rect x={0} y={0} width={420} height={420} fill="#6E6456" opacity={0.6} />
        <rect x={330} y={40} width={620} height={560} rx={60} fill="url(#kilim)" transform="rotate(-8 640 320)" />
        <path d="M 1180 300 C 1400 250, 1800 260, 1980 300 L 1980 760 L 1180 760 Z" fill="url(#plaid)" />
        <path d="M -40 600 C 400 560, 1100 560, 1980 600 L 1980 1100 L -40 1100 Z" fill="url(#plaid)" />
        <path d="M -40 600 C 400 560, 1100 560, 1980 600 L 1980 1100 L -40 1100 Z" fill="url(#seatShade)" />
      </svg>
    </div>
  );
};

export const S24Sofa: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 180], [1.02, 1.07]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "860px 420px" }}>
        <Sofa />
        <div style={{ position: "absolute", left: 590, top: 820, width: 780, height: 60, borderRadius: "50%", background: "rgba(40,30,20,0.35)", filter: "blur(18px)" }} />
        <CatPhoto {...CAT_S} blinks={[58, 150]} twitches={[{ ear: 1, t: 104 }]} breathe={0.006} breathePeriod={2.8} pivot={[400, 850]} />
      </AbsoluteFill>
      <Vignette strength={0.35} />
      <Scrim tone="light" strength={1.1} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 25 图 5：念念在茶几上伸成长长一条，肚子随呼吸起伏
// ─────────────────────────────────────────────────────────
const CAT_T = { src: "ohana/cartoon/niannian_table.png", w: 1707, h: 1280, scale: 0.955, x: 203, y: -234 };
const toT = (sx: number, sy: number) => [CAT_T.x + sx * CAT_T.scale, CAT_T.y + sy * CAT_T.scale] as const;

const Table: React.FC = () => {
  const grain = scatter(60, "grain");
  const e1 = toT(956, 1280);
  const e2 = toT(1707, 768);
  const b1 = toT(888, 0);
  const b2 = toT(1707, 393);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5E3629" />
          <stop offset="0.6" stopColor="#47261D" />
          <stop offset="1" stopColor="#2F1A14" />
        </linearGradient>
        <radialGradient id="tableLight" cx="0.75" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#FFE7C4" stopOpacity={0.18} />
          <stop offset="1" stopColor="#FFE7C4" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#E7E1D6" />
      <polygon points={`-100,-100 ${b1[0]},${b1[1]} ${b2[0]},${b2[1]} ${e2[0]},${e2[1]} ${e1[0]},${e1[1]} -100,${H + 100}`} fill="url(#wood)" />
      <g opacity={0.35}>
        {grain.map((g, i) => {
          const y = -200 + g.y * 1500;
          return <path key={i} d={`M -200 ${y} C 400 ${y - 120 + g.r * 60}, 1000 ${y - 260}, 2000 ${y - 520 + g.r * 80}`} fill="none" stroke={i % 3 ? "#6B4033" : "#2A1510"} strokeWidth={0.8 + g.r * 1.6} />;
        })}
      </g>
      <line x1={e1[0] - 30} y1={e1[1] - 20} x2={e2[0] - 30} y2={e2[1] - 20} stroke="#7A5040" strokeWidth={3} opacity={0.6} />
      <line x1={e1[0]} y1={e1[1]} x2={e2[0]} y2={e2[1]} stroke="#20120D" strokeWidth={10} />
      <rect width={W} height={H} fill="url(#tableLight)" />
    </svg>
  );
};

/** 玻璃烟灰缸：念念的尾巴尖原本就搭在里面 */
const Ashtray: React.FC<{ front: boolean }> = ({ front }) => {
  const c = toT(172, 498);
  const rx = 128 * CAT_T.scale;
  const ry = 98 * CAT_T.scale;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", pointerEvents: "none" }}>
      {front ? (
        <>
          <path d={`M ${c[0] - rx} ${c[1]} A ${rx} ${ry} 0 0 0 ${c[0] + rx} ${c[1]}`} fill="none" stroke="#2C3440" strokeWidth={26} opacity={0.72} />
          <path d={`M ${c[0] - rx * 0.8} ${c[1] + ry * 0.55} A ${rx * 0.9} ${ry * 0.9} 0 0 0 ${c[0] + rx * 0.2} ${c[1] + ry * 0.92}`} fill="none" stroke="#DCE6F0" strokeWidth={3} opacity={0.45} />
        </>
      ) : (
        <>
          <ellipse cx={c[0] + 10} cy={c[1] + 16} rx={rx} ry={ry} fill="#000" opacity={0.35} style={{ filter: "blur(10px)" }} />
          <ellipse cx={c[0]} cy={c[1]} rx={rx} ry={ry} fill="#1D232C" opacity={0.85} />
          <ellipse cx={c[0]} cy={c[1] - 6} rx={rx * 0.72} ry={ry * 0.66} fill="#11161D" />
          <path d={`M ${c[0] - rx} ${c[1]} A ${rx} ${ry} 0 0 1 ${c[0] + rx} ${c[1]}`} fill="none" stroke="#8C9AA8" strokeWidth={3} opacity={0.5} />
        </>
      )}
    </svg>
  );
};

export const S25Table: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 180], [1.0, 1.05]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "1150px 420px" }}>
        <Table />
        <Ashtray front={false} />
        <CatPhoto {...CAT_T} breathe={0.014} breatheAxis="y" breathePeriod={2.8} pivot={[800, 430]} />
        <Ashtray front />
      </AbsoluteFill>
      <Vignette strength={0.45} />
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 26–28 全家：妈妈、爸爸、我、念念依次滑入；背景从夏威夷的海到北仑的海
// ─────────────────────────────────────────────────────────
/** 全家合影的坐标：以图 1 的像素为单位，(OX, OY) 是图 1 左上角在舞台上的位置 */
const OX = 600;
const OY = -195;
/** 爸爸（图 2）相对图 1 的偏移：让他断开的上臂正好藏在我的肩膀后面 */
const DAD_OFF = [-705, 145] as const;
const CAT_G = { scale: 0.62, x: 1110, y: 470 };

export const ENTER = { mom: [0, 34], dad: [26, 60], me: [52, 86], cat: [80, 114] } as const;

const slide = (f: number, [a, b]: readonly [number, number]) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

const HawaiiSea: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="goldenHour" cx="0.5" cy="1" r="0.8">
          <stop offset="0" stopColor="#FFD59A" stopOpacity={0.7} />
          <stop offset="1" stopColor="#FFD59A" stopOpacity={0} />
        </radialGradient>
      </defs>
      <Ocean horizon={560} sky={["#8FB9C9", "#D9CDB4", "#F6D7A8"]} sea={["#5F9AAE", "#2E6278"]} brightness={1} glowX={960} seed="s26" />
      <rect width={W} height={560} fill="url(#goldenHour)" />
      <Palm x={140} y={260} t={f} fill="#3E4A45" />
      <g transform="translate(1920 0) scale(-1 1)">
        <Palm x={120} y={300} t={f + 40} fill="#3E4A45" />
      </g>
    </svg>
  );
};

const BeilunSea: React.FC = () => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
    <Ocean horizon={560} sky={["#B9C6CC", "#E2DED2", "#F2E6CF"]} sea={["#7D98A4", "#4A6572"]} brightness={0.8} glowX={1100} seed="s27" />
    <path d={`M 0 560 C 300 470, 520 500, 720 480 C 900 460, 1060 520, 1200 560 Z`} fill="#8E9C98" opacity={0.7} />
    {[1300, 1460, 1620].map((x) => (
      <g key={x} transform={`translate(${x} 556) scale(0.36)`} fill="none" stroke="#6F7F86" strokeWidth={10} opacity={0.8}>
        <line x1={-90} y1={0} x2={-70} y2={-360} />
        <line x1={90} y1={0} x2={70} y2={-360} />
        <line x1={-260} y1={-360} x2={420} y2={-360} strokeWidth={16} />
        <line x1={-40} y1={-360} x2={0} y2={-470} strokeWidth={8} />
        <line x1={0} y1={-470} x2={400} y2={-362} strokeWidth={5} />
        <line x1={-80} y1={-180} x2={80} y2={-180} />
      </g>
    ))}
  </svg>
);

/** 全家四口。enter 控制入场；bgMix 0 = 夏威夷的海，1 = 北仑的海 */
const Family: React.FC<{ f: number; bgMix: number; soften?: number }> = ({ f, bgMix, soften = 0 }) => {
  const mom = slide(f, ENTER.mom);
  const dad = slide(f, ENTER.dad);
  const me = slide(f, ENTER.me);
  const cat = slide(f, ENTER.cat);
  const zero = interpolate(f, [ENTER.cat[1], ENTER.cat[1] + 40], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ filter: soften > 0 ? `blur(${4 * soften}px)` : undefined }}>
      <HawaiiSea />
      <AbsoluteFill style={{ opacity: bgMix }}>
        <BeilunSea />
      </AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <circle cx={1010} cy={470} r={430} fill="none" stroke="#FFF3DA" strokeWidth={3} opacity={0.35 * zero} />
      </svg>
      {/* 被切过的边都加柔边，而且都藏在别人身后 */}
      <div style={{ position: "absolute", inset: 0, opacity: dad, transform: `translateX(${(1 - dad) * -520}px)` }}>
        <Photo
          src="ohana/cartoon/dad_body.png"
          w={1707}
          h={1280}
          scale={1}
          x={OX + DAD_OFF[0]}
          y={OY + DAD_OFF[1]}
          seed={5}
          style={{ WebkitMaskImage: "linear-gradient(to right, #000 860px, transparent 935px)", maskImage: "linear-gradient(to right, #000 860px, transparent 935px)" }}
        />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: mom, transform: `translateX(${(1 - mom) * 520}px)` }}>
        <Photo
          src="ohana/cartoon/mom.png"
          w={960}
          h={1280}
          scale={1}
          x={OX}
          y={OY}
          seed={3}
          style={{ WebkitMaskImage: "linear-gradient(to right, transparent 492px, #000 556px)", maskImage: "linear-gradient(to right, transparent 492px, #000 556px)" }}
        />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: me, transform: `translateY(${(1 - me) * 140}px)` }}>
        <Photo src="ohana/cartoon/me_a.png" w={960} h={1280} scale={1} x={OX} y={OY} seed={7} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: cat, transform: `translate(${(1 - cat) * 380}px, ${(1 - cat) * 60}px)` }}>
        <div style={{ position: "absolute", left: CAT_G.x + 60, top: CAT_G.y + 520 * CAT_G.scale, width: 420, height: 50, borderRadius: "50%", background: "rgba(30,25,20,0.3)", filter: "blur(14px)" }} />
        <CatPhoto {...CAT_S} scale={CAT_G.scale} x={CAT_G.x} y={CAT_G.y} eyes={[]} ears={[]} breathe={0.006} breathePeriod={2.8} pivot={[400, 850]} />
      </div>
    </AbsoluteFill>
  );
};

export const S26Family: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Family f={f} bgMix={0} />
      <Scrim tone="light" strength={1.15} />
    </AbsoluteFill>
  );
};

export const S27Family: React.FC = () => {
  const f = useCurrentFrame();
  const mix = interpolate(f, [20, 130], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Family f={500} bgMix={mix} />
      <Scrim tone="light" strength={1.15} />
    </AbsoluteFill>
  );
};

// 28 四句话最后一次出现，说给家人：全家退到后面，虚化、提亮
export const S28Words: React.FC = () => {
  const f = useCurrentFrame();
  const back = interpolate(f, [0, 36], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.05 * back})`, transformOrigin: "960px 500px" }}>
        <Family f={500} bgMix={1} soften={back} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(250,244,232,${0.62 * back})` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,250,240,${0.5 * back}) 0%, rgba(255,250,240,0) 100%)` }} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 29 念念的特写，眨眼
// ─────────────────────────────────────────────────────────
export const S29Close: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 120], [1, 1.05]);
  const s = 2.3;
  return (
    <AbsoluteFill>
      <Sofa blur={10} />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "960px 420px" }}>
        <CatPhoto {...CAT_S} scale={s} x={960 - 296 * s} y={430 - 556 * s} blinks={[66]} twitches={[{ ear: 0, t: 30, deg: 5 }]} breathe={0.004} breathePeriod={2.8} pivot={[296, 700]} />
      </AbsoluteFill>
      <Vignette strength={0.3} />
      <Scrim tone="light" strength={1.15} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 片尾：米白底，「0」慢慢变成一个圆满的圈
// ─────────────────────────────────────────────────────────
export const SEndCircle: React.FC = () => {
  const f = useCurrentFrame();
  const k = interpolate(f, [8, 110], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const R = 250;
  const cy = interpolate(k, [0, 1], [ZERO.cy, 400]);
  const rx = interpolate(k, [0, 1], [ZERO.rx, R]);
  const ry = interpolate(k, [0, 1], [ZERO.ry, R]);
  const sw = interpolate(k, [0, 1], [ZERO.w, 3]);
  const color = interpolateColors(k, [0, 1], [HOME.ink, "#C9A06A"]);
  const orbit = interpolate(f, [60, 150], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const a = -Math.PI / 2 + orbit * Math.PI * 2;
  const glow = interpolate(f, [100, 150], [0, 1], clamp);
  const title = interpolate(f, [70, 100], [0, 1], clamp);
  const sub = interpolate(f, [92, 120], [0, 1], clamp);
  const ded = interpolate(f, [110, 138], [0, 1], clamp);
  const out = interpolate(f, [222, 240], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: out }}>
        <PaperBg warm={0.4} />
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
          <ellipse cx={960} cy={cy} rx={rx} ry={ry} fill="none" stroke="#F4C98A" strokeWidth={18} opacity={0.3 * glow} style={{ filter: "blur(10px)" }} />
          <ellipse cx={960} cy={cy} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth={sw} />
          <circle cx={960 + rx * Math.cos(a)} cy={cy + ry * Math.sin(a)} r={9} fill={RED} opacity={interpolate(f, [56, 66], [0, 1], clamp)} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", opacity: title }}>
          <div style={{ fontFamily: FONT_ZH, fontWeight: 600, fontSize: 66, letterSpacing: "0.22em", marginRight: "-0.22em", color: HOME.ink }}>{END_CARD.title}</div>
          <div style={{ fontFamily: FONT_EN, fontStyle: "italic", fontSize: 30, color: HOME.inkSoft, marginTop: 14, opacity: sub }}>{END_CARD.titleEn}</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 740, textAlign: "center", fontFamily: FONT_ZH, color: HOME.inkSoft, opacity: ded }}>
          <div style={{ fontSize: 28, letterSpacing: "0.3em", marginRight: "-0.3em" }}>{END_CARD.dedication}</div>
          <div style={{ fontSize: 20, letterSpacing: "0.3em", marginRight: "-0.3em", marginTop: 22, opacity: 0.75 }}>{END_CARD.credit}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
