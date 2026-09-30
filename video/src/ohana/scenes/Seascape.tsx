import React from "react";
import { useCurrentFrame } from "remotion";
import { H, W, scatter } from "../common";
import { SEA } from "../theme";

// 海面与星空：第一、二、三章共用

type SkyStops = [string, string, string];

/** 天空渐变 + 海面 + 海面上闪烁的碎光。brightness 控制碎光亮度 */
export const Ocean: React.FC<{
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

export const Stars: React.FC<{ n: number; maxY: number; opacity?: number; seed?: string }> = ({
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

