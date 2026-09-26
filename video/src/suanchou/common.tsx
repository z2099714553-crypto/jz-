import React from "react";
import { AbsoluteFill, random } from "remotion";
import { C } from "./theme";
import { useTick } from "./time";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 底色 + 暗角。纸面场景用 paper，夜景用 night。 */
export const Backdrop: React.FC<{
  kind: "paper" | "night" | "warm" | "black";
  children?: React.ReactNode;
}> = ({ kind, children }) => {
  const bg = {
    paper: `radial-gradient(ellipse 75% 70% at 50% 45%, #F4EEE2 0%, ${C.paper} 55%, #CDBFA6 100%)`,
    night: `radial-gradient(ellipse 80% 75% at 50% 42%, #1A1714 0%, ${C.night} 70%, #030202 100%)`,
    warm: `radial-gradient(ellipse 80% 75% at 50% 42%, #2A1D12 0%, #120C08 65%, #050302 100%)`,
    black: "#000",
  }[kind];
  return (
    <AbsoluteFill style={{ background: bg }}>
      {children}
      {kind === "paper" ? <PaperFiber /> : null}
    </AbsoluteFill>
  );
};

/** 纸面纤维：极淡的噪点，让米白底不像纯色块 */
const PaperFiber: React.FC = () => (
  <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: 0.35, pointerEvents: "none" }}>
    <svg width="100%" height="100%">
      <filter id="fiber">
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves={2} seed={7} />
        <feColorMatrix
          values="0 0 0 0 0.55
                  0 0 0 0 0.47
                  0 0 0 0 0.36
                  0 0 0 0.55 0"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#fiber)" />
    </svg>
  </AbsoluteFill>
);

/** 胶片颗粒，全片统一叠一层 */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useTick();
  const seed = Math.floor(frame / 2) % 12;
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity, pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** 底部字幕区的柔和压暗/提亮，保证字幕在复杂画面上也看得清 */
export const Scrim: React.FC<{ tone: "dark" | "light"; strength?: number }> = ({ tone, strength = 1 }) => (
  <AbsoluteFill
    style={{
      background:
        tone === "dark"
          ? `linear-gradient(to bottom, rgba(0,0,0,0) 62%, rgba(5,4,3,${0.72 * strength}) 100%)`
          : `linear-gradient(to bottom, rgba(238,230,214,0) 62%, rgba(238,230,214,${0.85 * strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** 一根竹制算筹。以中心定位，angle 为角度（0 = 水平）。 */
export const Rod: React.FC<{
  x: number;
  y: number;
  length: number;
  angle?: number;
  width?: number;
  opacity?: number;
  tint?: string;
  glow?: number;
}> = ({ x, y, length, angle = 0, width = 10, opacity = 1, tint, glow = 0 }) => {
  const id = `rodgrad`;
  const nodes = Math.max(1, Math.round(length / 120));
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={opacity}>
      <defs>
        <linearGradient id={id} x1="0" y1="-1" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor={C.bambooLight} />
          <stop offset="0.45" stopColor={C.bamboo} />
          <stop offset="1" stopColor={C.bambooDark} />
        </linearGradient>
      </defs>
      {glow > 0 ? (
        <rect
          x={-length / 2 - 8}
          y={-width / 2 - 8}
          width={length + 16}
          height={width + 16}
          rx={width}
          fill={C.cinnabarSoft}
          opacity={0.35 * glow}
          style={{ filter: "blur(8px)" }}
        />
      ) : null}
      <rect
        x={-length / 2}
        y={-width / 2}
        width={length}
        height={width}
        rx={width / 2}
        fill={tint ?? `url(#${id})`}
      />
      {/* 高光 */}
      <rect
        x={-length / 2 + width * 0.6}
        y={-width / 2 + width * 0.18}
        width={length - width * 1.2}
        height={Math.max(1, width * 0.16)}
        rx={1}
        fill="#FFF3D6"
        opacity={0.45}
      />
      {/* 竹节 */}
      {Array.from({ length: nodes }).map((_, i) => {
        const nx = -length / 2 + ((i + 0.5) * length) / nodes + (random(`node${i}`) - 0.5) * 20;
        return (
          <rect key={i} x={nx} y={-width / 2} width={1.6} height={width} fill={C.bambooDark} opacity={0.55} />
        );
      })}
    </g>
  );
};

/** 蜡烛：烛身 + 跳动的火焰 + 光晕。(x, y) 是火焰根部。 */
export const Candle: React.FC<{ x: number; y: number; scale?: number; seed?: number }> = ({
  x,
  y,
  scale = 1,
  seed = 0,
}) => {
  const frame = useTick();
  const t = frame + seed * 37;
  const flick = 1 + 0.06 * Math.sin(t * 0.63) + 0.04 * Math.sin(t * 1.71 + 1) + 0.03 * Math.sin(t * 3.1);
  const sway = 2.2 * Math.sin(t * 0.37) + 1.1 * Math.sin(t * 1.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <radialGradient id="candleGlow">
          <stop offset="0" stopColor="#FFD58A" stopOpacity={0.55} />
          <stop offset="0.35" stopColor="#F5A64A" stopOpacity={0.18} />
          <stop offset="1" stopColor="#F5A64A" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="candleBody" x1="0" x2="1">
          <stop offset="0" stopColor="#8E7B62" />
          <stop offset="0.35" stopColor="#E9DCC4" />
          <stop offset="1" stopColor="#7C6A53" />
        </linearGradient>
        <radialGradient id="flame" cx="0.5" cy="0.75" r="0.7">
          <stop offset="0" stopColor="#FFFBEA" />
          <stop offset="0.4" stopColor="#FFD27A" />
          <stop offset="1" stopColor="#F07A2A" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={0} cy={-20} r={420 * flick} fill="url(#candleGlow)" />
      <rect x={-22} y={4} width={44} height={170} rx={3} fill="url(#candleBody)" />
      <ellipse cx={0} cy={5} rx={22} ry={5} fill="#F3E8D2" />
      <rect x={-1.5} y={-8} width={3} height={14} fill="#2A1C12" />
      <path
        d={`M 0 4 C -14 -10, -9 -34, ${sway} ${-62 * flick} C 9 -34, 14 -10, 0 4 Z`}
        fill="url(#flame)"
      />
      <ellipse cx={0} cy={-6} rx={4} ry={9} fill="#6FA0FF" opacity={0.35} />
    </g>
  );
};

/** 齿轮外形：梯形齿，pitchR = 节圆半径 */
export const gearPath = (teeth: number, pitchR: number, toothH = 14) => {
  const outer = pitchR + toothH / 2;
  const inner = pitchR - toothH / 2;
  const step = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const seq: [number, number][] = [
      [a - step * 0.5, inner],
      [a - step * 0.22, inner],
      [a - step * 0.13, outer],
      [a + step * 0.13, outer],
      [a + step * 0.22, inner],
    ];
    for (const [ang, r] of seq) pts.push(`${(Math.cos(ang) * r).toFixed(2)},${(Math.sin(ang) * r).toFixed(2)}`);
  }
  return `M ${pts.join(" L ")} Z`;
};

export const Gear: React.FC<{
  x: number;
  y: number;
  teeth: number;
  pitchR: number;
  angle: number; // 弧度
  opacity?: number;
}> = ({ x, y, teeth, pitchR, angle, opacity = 1 }) => {
  const spokes = teeth > 14 ? 6 : 4;
  return (
    <g transform={`translate(${x} ${y}) rotate(${(angle * 180) / Math.PI})`} opacity={opacity}>
      <path d={gearPath(teeth, pitchR)} fill="url(#bronze)" stroke={C.bronzeDark} strokeWidth={1.5} />
      <circle r={pitchR - 22} fill="none" stroke={C.bronzeDark} strokeWidth={3} opacity={0.6} />
      {Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        return (
          <path
            key={i}
            d={`M 0 0 L ${Math.cos(a - 0.12) * (pitchR - 24)} ${Math.sin(a - 0.12) * (pitchR - 24)} L ${
              Math.cos(a + 0.12) * (pitchR - 24)
            } ${Math.sin(a + 0.12) * (pitchR - 24)} Z`}
            fill={C.bronzeDark}
            opacity={0.35}
          />
        );
      })}
      <circle r={pitchR * 0.2} fill={C.bronzeDark} />
      <circle r={pitchR * 0.1} fill="#1A120B" />
    </g>
  );
};

/** 齿轮所需的铜色渐变，放在用到齿轮的 svg 里一次 */
export const BronzeDefs: React.FC = () => (
  <defs>
    <radialGradient id="bronze" cx="0.4" cy="0.35" r="0.8">
      <stop offset="0" stopColor={C.bronzeLight} />
      <stop offset="0.55" stopColor={C.bronze} />
      <stop offset="1" stopColor={C.bronzeDark} />
    </radialGradient>
  </defs>
);

/** 两个齿轮啮合时，从动轮的初始相位 */
export const meshPhase = (theta: number, n1: number, n2: number) =>
  theta + Math.PI - (0.5 - (theta * n1) / (Math.PI * 2)) * ((Math.PI * 2) / n2);

/** 固定种子的星点 */
export const makeStars = (n: number, seed: string) =>
  Array.from({ length: n }).map((_, i) => ({
    x: random(`${seed}x${i}`),
    y: random(`${seed}y${i}`),
    r: 0.6 + random(`${seed}r${i}`) ** 3 * 2.4,
    tw: random(`${seed}t${i}`) * Math.PI * 2,
    b: 0.35 + random(`${seed}b${i}`) * 0.65,
  }));

/** 光点：朱砂色内核 + 暖白光晕。Claude 在片中的化身。 */
export const LightPoint: React.FC<{ x: number; y: number; size?: number; intensity?: number; onPaper?: boolean }> = ({
  x,
  y,
  size = 1,
  intensity = 1,
  onPaper = false,
}) => (
  <g transform={`translate(${x} ${y}) scale(${size})`}>
    <defs>
      <radialGradient id="lpHalo">
        <stop offset="0" stopColor={onPaper ? C.cinnabarSoft : "#FFE7C2"} stopOpacity={0.9} />
        <stop offset="0.25" stopColor={onPaper ? C.cinnabarSoft : "#F3A36F"} stopOpacity={0.35} />
        <stop offset="1" stopColor={C.cinnabarSoft} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle r={90} fill="url(#lpHalo)" opacity={intensity} />
    <circle r={9} fill={onPaper ? C.cinnabar : "#FFF4E2"} opacity={Math.min(1, intensity * 1.2)} />
    <circle r={16} fill={C.cinnabarSoft} opacity={0.35 * intensity} />
  </g>
);
