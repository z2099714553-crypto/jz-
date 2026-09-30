import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { STAGE_H, STAGE_SCALE, STAGE_TOP, STAGE_W } from "./script";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const W = STAGE_W;
export const H = STAGE_H;

/** 竖屏中间的横向画面框：里面的内容按 1920×1080 画，整体缩放进框，上下留黑 */
export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: STAGE_TOP,
        width: STAGE_W,
        height: STAGE_H,
        transform: `scale(${STAGE_SCALE})`,
        transformOrigin: "0 0",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

/** 胶片颗粒 */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 12;
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity, pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`ograin-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#ograin-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** 暗角 */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 78% 72% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** 字幕区的压暗/提亮 */
export const Scrim: React.FC<{ tone: "dark" | "light"; strength?: number }> = ({ tone, strength = 1 }) => (
  <AbsoluteFill
    style={{
      background:
        tone === "dark"
          ? `linear-gradient(to bottom, rgba(0,0,0,0) 58%, rgba(3,8,14,${0.78 * strength}) 100%)`
          : `linear-gradient(to bottom, rgba(243,236,223,0) 58%, rgba(243,236,223,${0.88 * strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** 固定种子的随机点 */
export const scatter = (n: number, seed: string) =>
  Array.from({ length: n }).map((_, i) => ({
    x: random(`${seed}x${i}`),
    y: random(`${seed}y${i}`),
    r: random(`${seed}r${i}`),
    p: random(`${seed}p${i}`) * Math.PI * 2,
  }));

/** 平滑噪声（几组正弦叠加），用来做摆动、漂移 */
export const wobble = (t: number, seed: number, speed = 1) =>
  0.5 * Math.sin(t * 0.031 * speed + seed * 1.7) +
  0.3 * Math.sin(t * 0.057 * speed + seed * 3.1) +
  0.2 * Math.sin(t * 0.113 * speed + seed * 5.3);
