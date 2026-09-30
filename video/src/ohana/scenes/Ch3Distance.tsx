import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { H, Scrim, Vignette, W, clamp, scatter } from "../common";
import { FONT_EN, FONT_ZH, RED, SEA } from "../theme";
import { Palm } from "./Ch2Phrases";
import { Ocean, Stars } from "./Seascape";

// ─────────────────────────────────────────────────────────
// 11 一条细线从檀香山划过太平洋，落到中国东海岸
// ─────────────────────────────────────────────────────────

/** 地图投影：经度 105°E–205°E（即 155°W），纬度 8°N–50°N；按北纬 28° 修正长宽比 */
const LON0 = 105;
const LAT1 = 50;
const PX = 19.2;
const PY = PX / Math.cos((28 * Math.PI) / 180);
const MAP_TOP = 40;
const proj = (lon: number, lat: number): [number, number] => {
  const l = lon < 0 ? lon + 360 : lon;
  return [(l - LON0) * PX, MAP_TOP + (LAT1 - lat) * PY];
};
const poly = (pts: number[][]) => pts.map(([lo, la]) => proj(lo, la).map((v) => v.toFixed(1)).join(",")).join(" ");

// 海岸线：凭经纬度手工描的简化轮廓，只求形似
const MAINLAND = [
  [95, 55], [142, 55], [141, 50], [140.5, 48.5], [138, 46], [135.3, 43.8], [133, 42.8], [131.5, 43], [130.7, 42.3],
  [129.7, 40.9], [128.4, 38.6], [129.4, 36.8], [129.3, 35.2], [127.7, 34.7], [126.3, 34.6], [125.3, 37.7], [124.4, 40.0],
  [122.2, 40.5], [121.0, 40.8], [119.5, 39.9], [118.0, 39.2], [117.7, 38.6], [118.8, 37.4], [119.8, 37.2], [120.8, 37.8],
  [122.5, 37.4], [122.0, 36.9], [120.5, 36.1], [119.3, 35.0], [120.3, 33.5], [121.0, 32.1], [121.9, 31.7], [121.9, 30.9],
  [121.5, 30.6], [121.9, 29.9], [121.9, 29.1], [121.3, 28.1], [120.6, 27.2], [119.8, 26.0], [118.9, 24.9], [118.0, 24.4],
  [116.5, 23.2], [114.9, 22.6], [113.9, 22.3], [112.5, 21.8], [110.5, 21.2], [110.0, 20.3], [109.6, 21.5], [108.0, 21.5],
  [106.6, 20.2], [105.8, 19.0], [106.5, 17.5], [107.5, 16.2], [108.8, 15.2], [109.3, 13.0], [109.2, 11.6], [108.0, 10.8],
  [95, 5],
];
const ISLANDS = [
  // 北海道、本州、九州、四国
  [[140.0, 41.5], [141.2, 41.8], [143.3, 42.0], [145.5, 43.3], [144.3, 44.1], [141.9, 45.4], [141.6, 44.3], [140.3, 43.2]],
  [[141.5, 41.4], [141.9, 39.5], [141.0, 38.3], [140.9, 36.9], [140.8, 35.7], [139.9, 35.0], [138.8, 34.6], [137.0, 34.6], [136.8, 34.2], [135.2, 33.8], [135.1, 34.6], [133.0, 34.3], [131.0, 33.9], [131.0, 34.4], [132.6, 35.5], [135.5, 35.6], [136.8, 37.3], [138.5, 37.9], [139.9, 39.9], [140.0, 40.8]],
  [[130.9, 33.9], [131.9, 33.1], [131.4, 31.4], [130.2, 31.0], [129.8, 32.7], [130.3, 33.6]],
  [[132.6, 33.9], [134.7, 34.2], [134.3, 33.3], [133.0, 32.8], [132.5, 33.3]],
  // 台湾、海南、吕宋
  [[121.9, 25.1], [121.8, 24.0], [120.9, 22.0], [120.1, 23.0], [120.2, 24.1], [121.0, 25.0]],
  [[110.6, 20.1], [111.0, 19.6], [110.0, 18.2], [108.7, 18.5], [108.7, 19.4], [109.7, 20.0]],
  [[120.6, 18.5], [122.2, 18.5], [122.0, 17.0], [121.5, 15.8], [122.0, 14.0], [124.0, 13.0], [123.0, 13.8], [121.2, 14.2], [120.6, 14.4], [120.0, 16.0], [120.4, 17.6]],
  // 夏威夷群岛：大岛、毛伊、莫洛凯、欧胡、考艾
  [[-155.0, 19.7], [-154.8, 19.5], [-155.6, 18.9], [-156.0, 19.3], [-155.9, 20.2], [-155.3, 20.2]],
  [[-156.0, 20.7], [-156.4, 20.6], [-156.7, 20.9], [-156.4, 21.0]],
  [[-156.8, 21.2], [-157.3, 21.1], [-157.3, 21.2], [-156.8, 21.25]],
  [[-157.65, 21.3], [-158.1, 21.3], [-158.25, 21.55], [-157.95, 21.72], [-157.7, 21.5]],
  [[-159.3, 22.0], [-159.6, 21.9], [-159.8, 22.1], [-159.5, 22.25]],
];

export const HONOLULU = { lon: -157.86, lat: 21.31 };
export const BEILUN = { lon: 121.84, lat: 29.89 };

/** 大圆航线上的点（球面线性插值） */
const greatCircle = (a: { lon: number; lat: number }, b: { lon: number; lat: number }, n: number) => {
  const v = (p: { lon: number; lat: number }) => {
    const la = (p.lat * Math.PI) / 180;
    const lo = (p.lon * Math.PI) / 180;
    return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
  };
  const A = v(a);
  const B = v(b);
  const omega = Math.acos(A[0] * B[0] + A[1] * B[1] + A[2] * B[2]);
  return Array.from({ length: n + 1 }).map((_, i) => {
    const t = i / n;
    const k1 = Math.sin((1 - t) * omega) / Math.sin(omega);
    const k2 = Math.sin(t * omega) / Math.sin(omega);
    const x = k1 * A[0] + k2 * B[0];
    const y = k1 * A[1] + k2 * B[1];
    const z = k1 * A[2] + k2 * B[2];
    return proj((Math.atan2(y, x) * 180) / Math.PI, (Math.asin(z) * 180) / Math.PI);
  });
};
const ROUTE = greatCircle(HONOLULU, BEILUN, 160);
export const DRAW = [30, 150] as const;
const DISTANCE_KM = 7951;

export const S11Map: React.FC = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, [DRAW[0], DRAW[1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const idx = Math.min(ROUTE.length - 1, Math.floor(t * (ROUTE.length - 1)));
  const head = ROUTE[idx];
  const path = ROUTE.slice(0, idx + 1).map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const hon = proj(HONOLULU.lon, HONOLULU.lat);
  const bei = proj(BEILUN.lon, BEILUN.lat);
  // 镜头：先靠近夏威夷，再跟着线拉到中国海岸
  const camX = interpolate(t, [0, 1], [hon[0] - 260, bei[0] + 520]);
  const zoom = interpolate(f, [0, DRAW[0], DRAW[1], 180], [1.5, 1.4, 1.12, 1.1], clamp);
  const camY = interpolate(t, [0, 1], [hon[1] - 120, bei[1] - 60]);
  const arrive = interpolate(f, [DRAW[1] - 2, DRAW[1] + 20], [0, 1], clamp);
  const km = Math.round((DISTANCE_KM * t) / 10) * 10;
  const pulse = Math.sin(f * 0.25) * 0.5 + 0.5;
  return (
    <AbsoluteFill style={{ background: "#081A2C" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${960 - camX}px, ${440 - camY}px) scale(${zoom})`,
          transformOrigin: `${camX}px ${camY}px`,
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ overflow: "visible" }}>
          <defs>
            <pattern id="waves" patternUnits="userSpaceOnUse" width={28} height={14}>
              <path d="M 0 10 Q 7 6 14 10 T 28 10" fill="none" stroke="#2A5572" strokeWidth={1} opacity={0.35} />
            </pattern>
          </defs>
          <rect x={-800} y={-400} width={W + 1600} height={H + 800} fill="#0B2239" />
          <rect x={-800} y={-400} width={W + 1600} height={H + 800} fill="url(#waves)" />
          {Array.from({ length: 12 }).map((_, i) => {
            const lon = 110 + i * 10;
            const [x] = proj(lon, 0);
            return <line key={`lo${i}`} x1={x} y1={-400} x2={x} y2={H + 400} stroke="#2E5A78" strokeWidth={1} opacity={0.35} />;
          })}
          {[10, 20, 30, 40, 50].map((lat) => {
            const [, y] = proj(110, lat);
            return <line key={`la${lat}`} x1={-800} y1={y} x2={W + 800} y2={y} stroke="#2E5A78" strokeWidth={1} opacity={0.35} />;
          })}
          <polygon points={poly(MAINLAND)} fill="#1D3B52" stroke="#6FA0B4" strokeWidth={1.4} strokeLinejoin="round" />
          {ISLANDS.map((isl, i) => (
            <polygon key={i} points={poly(isl)} fill="#1D3B52" stroke="#6FA0B4" strokeWidth={1.4} strokeLinejoin="round" />
          ))}
          {/* 航线 */}
          <polyline points={path} fill="none" stroke={SEA.foam} strokeWidth={2.4} strokeLinecap="round" opacity={0.9} />
          <polyline points={path} fill="none" stroke={SEA.foam} strokeWidth={8} strokeLinecap="round" opacity={0.12} />
          {/* 两端 */}
          <circle cx={hon[0]} cy={hon[1]} r={7} fill={SEA.moon} />
          <circle cx={hon[0]} cy={hon[1]} r={14 + 10 * pulse} fill="none" stroke={SEA.moon} strokeOpacity={0.3 * (1 - pulse)} strokeWidth={2} />
          <g opacity={arrive}>
            <circle cx={bei[0]} cy={bei[1]} r={8} fill={RED} />
            <circle cx={bei[0]} cy={bei[1]} r={8 + 30 * arrive} fill="none" stroke={RED} strokeWidth={2} opacity={1 - arrive} />
          </g>
          {t > 0 && t < 1 ? <circle cx={head[0]} cy={head[1]} r={7} fill={RED} /> : null}
          <g fontFamily={FONT_ZH} fill={SEA.moon}>
            <text x={hon[0] - 16} y={hon[1] - 26} fontSize={26} textAnchor="end" letterSpacing="0.15em">
              檀香山
            </text>
            <text x={hon[0] - 16} y={hon[1] + 36} fontSize={18} textAnchor="end" fontFamily={FONT_EN} fontStyle="italic" opacity={0.7}>
              Honolulu
            </text>
            <g opacity={arrive}>
              <text x={bei[0] + 22} y={bei[1] - 18} fontSize={26} letterSpacing="0.15em">
                北仑
              </text>
              <text x={bei[0] + 22} y={bei[1] + 14} fontSize={18} fontFamily={FONT_EN} fontStyle="italic" opacity={0.7}>
                Beilun
              </text>
            </g>
          </g>
        </svg>
      </AbsoluteFill>
      {/* 公里数：随线一起走 */}
      <div
        style={{
          position: "absolute",
          top: 70,
          right: 110,
          fontFamily: FONT_EN,
          fontSize: 64,
          color: SEA.moon,
          opacity: interpolate(f, [DRAW[0] - 10, DRAW[0] + 10], [0, 1], clamp),
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.02em",
        }}
      >
        {km.toLocaleString("en-US")}
        <span style={{ fontSize: 30, marginLeft: 12, fontStyle: "italic", opacity: 0.7 }}>km</span>
      </div>
      <Vignette strength={0.55} />
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 12 左右分屏：左边夕阳（檀香山 18:00），右边正午（北仑次日 12:00）
// ─────────────────────────────────────────────────────────
const Clock: React.FC<{ x: number; y: number; hour: number; minute: number; dark: boolean; sweep: number }> = ({
  x,
  y,
  hour,
  minute,
  dark,
  sweep,
}) => {
  const ink = dark ? "#F6E8D6" : "#23313D";
  const mAng = ((minute + sweep * 60) / 60) * 360;
  const hAng = ((hour % 12) / 12) * 360 + ((minute + sweep * 60) / 60) * 30;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={54} fill="none" stroke={ink} strokeWidth={2.5} opacity={0.85} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={Math.sin(a) * 44} y1={-Math.cos(a) * 44} x2={Math.sin(a) * 50} y2={-Math.cos(a) * 50} stroke={ink} strokeWidth={i % 3 ? 1.5 : 3} opacity={0.8} />;
      })}
      <line x1={0} y1={0} x2={0} y2={-28} stroke={ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${hAng})`} />
      <line x1={0} y1={0} x2={0} y2={-42} stroke={ink} strokeWidth={2.5} strokeLinecap="round" transform={`rotate(${mAng})`} />
      <circle r={4} fill={RED} />
    </g>
  );
};

export const S12Split: React.FC = () => {
  const f = useCurrentFrame();
  const split = interpolate(f, [0, 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  // 指针转一小段后停在整点
  const sweep = interpolate(f, [8, 50], [-0.25, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const half = W / 2;
  const sunY = interpolate(f, [0, 150], [470, 500]);
  const glints = scatter(90, "noon");
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <linearGradient id="dusk12" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A2350" />
            <stop offset="0.5" stopColor="#B4586A" />
            <stop offset="0.85" stopColor="#F2A06A" />
            <stop offset="1" stopColor="#FFD29A" />
          </linearGradient>
          <linearGradient id="duskSea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7A4B63" />
            <stop offset="1" stopColor="#1C1B33" />
          </linearGradient>
          <linearGradient id="noon12" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3C86C0" />
            <stop offset="1" stopColor="#BFE1F2" />
          </linearGradient>
          <linearGradient id="noonSea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3E86A6" />
            <stop offset="1" stopColor="#15506E" />
          </linearGradient>
          <clipPath id="leftHalf">
            <rect x={0} y={0} width={half} height={H} />
          </clipPath>
          <clipPath id="rightHalf">
            <rect x={half} y={0} width={half} height={H} />
          </clipPath>
        </defs>

        {/* 左：檀香山傍晚六点 */}
        <g clipPath="url(#leftHalf)" transform={`translate(${-(1 - split) * 120} 0)`}>
          <rect width={half + 200} height={560} fill="url(#dusk12)" />
          <rect y={560} width={half + 200} height={H - 560} fill="url(#duskSea)" />
          <circle cx={560} cy={sunY + 60} r={70} fill="#FFE3B0" opacity={0.95} />
          <rect x={0} y={560} width={half + 200} height={H} fill="url(#duskSea)" opacity={0.85} />
          {Array.from({ length: 30 }).map((_, i) => (
            <rect key={i} x={560 - 110 + random(`dg${i}`) * 220 - 20} y={570 + random(`dy${i}`) ** 2 * 280} width={20 + random(`dw${i}`) * 60} height={2.5} fill="#FFD9A0" opacity={0.3 + 0.5 * Math.abs(Math.sin(f * 0.05 + i))} />
          ))}
          <Palm x={210} y={400} t={f} fill="#1D1428" />
          <Clock x={760} y={150} hour={6} minute={0} dark sweep={sweep} />
          <text x={760} y={250} textAnchor="middle" fontFamily={FONT_ZH} fontSize={24} letterSpacing="0.3em" fill="#FBEBDD" opacity={0.9}>
            檀香山 18:00
          </text>
        </g>

        {/* 右：北仑次日正午 */}
        <g clipPath="url(#rightHalf)" transform={`translate(${(1 - split) * 120} 0)`}>
          <rect x={half - 200} width={half + 200} height={560} fill="url(#noon12)" />
          <rect x={half - 200} y={560} width={half + 200} height={H - 560} fill="url(#noonSea)" />
          <circle cx={1500} cy={110} r={56} fill="#FFFBEA" opacity={0.95} />
          <circle cx={1500} cy={110} r={120} fill="#FFFBEA" opacity={0.18} />
          {glints.map((g, i) => (
            <rect key={i} x={half + g.x * half} y={570 + g.y * g.y * 300} width={10 + g.r * 40} height={2} fill="#F4FBFF" opacity={0.25 + 0.5 * Math.abs(Math.sin(f * 0.07 + g.p))} />
          ))}
          {/* 远处港口的吊机剪影 */}
          {[1320, 1440, 1560, 1700].map((x, i) => (
            <g key={x} transform={`translate(${x} 560) scale(${0.34 + i * 0.02})`} opacity={0.55}>
              <CraneShape color="#46708A" />
            </g>
          ))}
          <Clock x={1160} y={150} hour={12} minute={0} dark={false} sweep={sweep} />
          <text x={1160} y={250} textAnchor="middle" fontFamily={FONT_ZH} fontSize={24} letterSpacing="0.3em" fill="#1E2C38" opacity={0.85}>
            北仑 次日 12:00
          </text>
        </g>
        <line x1={half} y1={0} x2={half} y2={H * split} stroke="#FFFFFF" strokeWidth={2} opacity={0.7} />
      </svg>
      <Scrim tone="dark" strength={1.1} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 13 北仑港的吊机与海面，镜头慢慢推向海浪
// ─────────────────────────────────────────────────────────

/** 岸桥吊机（集装箱装卸桥）：A 形门架 + 伸向海面的臂架。原点在门腿底部中间 */
const CraneShape: React.FC<{ color: string; light?: number }> = ({ color, light = 0 }) => (
  <g fill="none" stroke={color} strokeWidth={10} strokeLinejoin="round">
    <line x1={-90} y1={0} x2={-70} y2={-360} />
    <line x1={90} y1={0} x2={70} y2={-360} />
    <line x1={-80} y1={-180} x2={80} y2={-180} />
    <line x1={-86} y1={-100} x2={80} y2={-240} strokeWidth={6} />
    <line x1={86} y1={-100} x2={-80} y2={-240} strokeWidth={6} />
    <line x1={-260} y1={-360} x2={420} y2={-360} strokeWidth={16} />
    <line x1={-40} y1={-360} x2={0} y2={-470} strokeWidth={8} />
    <line x1={0} y1={-470} x2={400} y2={-362} strokeWidth={5} />
    <line x1={0} y1={-470} x2={-250} y2={-362} strokeWidth={5} />
    <rect x={150} y={-352} width={46} height={36} fill={color} stroke="none" />
    <line x1={173} y1={-316} x2={173} y2={-220} strokeWidth={3} />
    {light > 0 ? <circle cx={0} cy={-478} r={9} fill="#FF4A3A" stroke="none" opacity={light} /> : null}
  </g>
);

export const S13Port: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 150], [1, 1.38], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const blink = f % 40 < 18 ? 1 : 0.15;
  const horizon = 520;
  const containers = Array.from({ length: 34 }).map((_, i) => ({
    x: 180 + i * 38 + (random(`cx${i}`) - 0.5) * 8,
    h: 1 + Math.floor(random(`ch${i}`) * 4),
    c: ["#7E4A3C", "#3E5E73", "#8A7A52", "#5A6B4E", "#6E3E46", "#4A5561"][Math.floor(random(`cc${i}`) * 6)],
  }));
  return (
    <AbsoluteFill style={{ background: "#0A1826" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "960px 900px" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <Ocean horizon={horizon} sky={["#0B1A2C", "#2A4A66", "#8FA9B8"]} sea={["#1D3E57", "#081523"]} brightness={0.8} glowX={1200} seed="s13" />
          {/* 远山 */}
          <path d={`M 0 ${horizon} C 200 440, 380 470, 520 450 C 700 420, 860 460, 1000 ${horizon} Z`} fill="#2C4A60" opacity={0.7} />
          {/* 码头与集装箱 */}
          <rect x={120} y={horizon - 8} width={1500} height={14} fill="#1A2A38" />
          {containers.map((c, i) =>
            Array.from({ length: c.h }).map((_, k) => (
              <rect key={`${i}-${k}`} x={c.x} y={horizon - 8 - (k + 1) * 16} width={34} height={15} fill={c.c} opacity={0.85} />
            )),
          )}
          {/* 吊机 */}
          {[300, 620, 960, 1300].map((x, i) => (
            <g key={x} transform={`translate(${x} ${horizon - 6}) scale(${0.62 + (i % 2) * 0.06})`}>
              <CraneShape color="#16283A" light={blink} />
            </g>
          ))}
          {/* 前景的浪：一排排长短不一的浪尖，越近越大、越亮，各自起伏漂移 */}
          {Array.from({ length: 8 }).map((_, k) => {
            const y0 = 590 + k * k * 9 + k * 30;
            const amp = 3 + k * 2.2;
            return Array.from({ length: 10 + k }).map((__, j) => {
              const seed = `w${k}-${j}`;
              const len = (70 + random(seed) * 180) * (0.6 + k * 0.18);
              const x0 = ((random(`${seed}x`) * 2300 + f * (0.4 + k * 0.25)) % 2300) - 200;
              const bob = amp * Math.sin(f * (0.05 + random(`${seed}s`) * 0.04) + random(`${seed}p`) * 6);
              const pts = Array.from({ length: 12 }).map((___, i) => {
                const u = i / 11;
                const x = x0 + u * len;
                const y = y0 + bob - amp * 1.6 * Math.sin(u * Math.PI) * (0.7 + 0.3 * Math.sin(f * 0.07 + j));
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              return (
                <polyline
                  key={seed}
                  points={pts.join(" ")}
                  fill="none"
                  stroke={SEA.foam}
                  strokeWidth={1 + k * 0.45}
                  strokeLinecap="round"
                  opacity={(0.12 + k * 0.05) * (0.6 + 0.4 * random(`${seed}o`))}
                />
              );
            });
          })}
        </svg>
      </AbsoluteFill>
      <Vignette strength={0.55} />
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 14 夏威夷海岸，一个人的背影
// ─────────────────────────────────────────────────────────

/** 年轻人背影：短发，T 恤，双手插兜 */
const BACK =
  "M -14 -262 C -30 -258, -58 -250, -66 -236 C -74 -220, -76 -190, -78 -160 C -80 -140, -76 -128, -70 -118 L -66 -126 C -62 -150, -60 -170, -58 -190 L -50 -150 C -48 -120, -46 -90, -46 -60 L -40 0 L -8 0 L -2 -80 L 2 -80 L 8 0 L 40 0 L 46 -60 C 46 -90, 48 -120, 50 -150 L 58 -190 C 60 -170, 62 -150, 66 -126 L 70 -118 C 76 -128, 80 -140, 78 -160 C 76 -190, 74 -220, 66 -236 C 58 -250, 30 -258, 14 -262 Z";

export const S14Shore: React.FC = () => {
  const f = useCurrentFrame();
  const horizon = 540;
  const push = interpolate(f, [0, 210], [1, 1.06]);
  const breathe = 1 + 0.004 * Math.sin(f * 0.08);
  const washes = [0, 70, 140].map((t0) => interpolate((f - t0 + 210) % 210, [0, 90, 150], [0, 1, 0], clamp));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "700px 600px" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <defs>
            <radialGradient id="dusk14" cx="0.62" cy="1" r="0.9">
              <stop offset="0" stopColor="#F2B27A" stopOpacity={0.7} />
              <stop offset="0.45" stopColor="#8E6A8E" stopOpacity={0.25} />
              <stop offset="1" stopColor="#8E6A8E" stopOpacity={0} />
            </radialGradient>
          </defs>
          <Ocean horizon={horizon} sky={["#0A1830", "#27466A", "#6C84A0"]} sea={["#1E4466", "#081627"]} brightness={1} glowX={1180} seed="s14" />
          <rect width={W} height={horizon} fill="url(#dusk14)" />
          <Stars n={30} maxY={260} opacity={0.4} seed="s14stars" />
          <circle cx={1180} cy={horizon - 10} r={42} fill="#FFE2B8" opacity={0.85} style={{ filter: "blur(3px)" }} />
          {/* 岸边的浪一次次涌上来 */}
          {washes.map((w, i) => (
            <path
              key={i}
              d={`M -40 ${840 - w * 70 - i * 10} C 400 ${820 - w * 80}, 900 ${860 - w * 60}, 1960 ${830 - w * 70 - i * 6}`}
              fill="none"
              stroke={SEA.foam}
              strokeWidth={3}
              opacity={0.5 * (1 - Math.abs(w - 0.5) * 1.2)}
            />
          ))}
          {/* 礁石与人 */}
          <path d="M 420 1080 C 440 900, 520 820, 640 790 C 760 770, 860 800, 920 860 C 980 920, 1000 1000, 1010 1080 Z" fill="#0A1119" />
          <g transform={`translate(700 ${792}) scale(${1.25 * breathe})`}>
            <g transform="scale(0.8 1.1)">
              <path d={BACK} fill="#080D14" />
            </g>
            <ellipse cx={0} cy={-312} rx={20} ry={24} fill="#080D14" />
            {/* 蓬松的短发，随风轻动 */}
            <path
              d={`M -24 -318 C -30 -342, -12 -356, 2 -352 C 16 -360, 32 -346, ${26 + 2 * Math.sin(f * 0.12)} ${-322 + Math.sin(f * 0.1)} C 30 -330, 20 -338, 12 -336 C 6 -342, -8 -342, -14 -334 C -22 -336, -26 -328, -24 -318 Z`}
              fill="#080D14"
            />
          </g>
          {/* 棕榈 */}
          <Palm x={1630} y={500} t={f} fill="#0A1119" />
        </svg>
      </AbsoluteFill>
      <Vignette strength={0.5} />
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};
