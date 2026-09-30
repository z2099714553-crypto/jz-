import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp } from "./common";

/**
 * 念念这一层：呼吸、眨眼、耳朵抖动（素材是照片转的卡通图，和原照片逐像素对齐）。
 * 坐标都用原图像素；图片按 scale 放在舞台 (x, y)，(x, y) 对应原图左上角。
 *
 * 眨眼：用眼睛正上方真实的毛发往下「滑」成眼皮（眼皮区域显示的是上移 d 像素处的原图），
 *       下沿加一道深色眼线；不画假眼皮，毛色和线条都是图本身的。
 * 耳朵：把耳朵单独切成一层，绕耳根转动；原图里的耳朵位置让位，露出的是背景，不会出现两只耳朵。
 */
export type Eye = { x: number; y: number; rx: number; ry: number };
export type Ear = { poly: [number, number][]; pivot: [number, number]; dir: 1 | -1 };

const clip = (pts: [number, number][], s: number) => `polygon(${pts.map(([x, y]) => `${x * s}px ${y * s}px`).join(", ")})`;

/** 一次眨眼的闭合程度：4 帧合上，停 2 帧，5 帧睁开 */
export const blinkAt = (f: number, t0: number) =>
  interpolate(f, [t0, t0 + 4, t0 + 6, t0 + 11], [0, 1, 1, 0], { ...clamp, easing: Easing.inOut(Easing.quad) });

/** 耳朵抖一下：快速转开再弹回，带一点余振 */
export const twitchAt = (f: number, t0: number) => {
  const k = f - t0;
  if (k < 0 || k > 18) return 0;
  if (k < 3) return k / 3;
  return Math.exp(-(k - 3) / 3.5) * Math.cos((k - 3) * 0.9);
};

const Eyelid: React.FC<{ src: string; w: number; h: number; s: number; eye: Eye; close: number }> = ({ src, w, h, s, eye, close }) => {
  if (close <= 0.01) return null;
  const pad = 1.18;
  const left = (eye.x - eye.rx * pad) * s;
  const top = (eye.y - eye.ry * pad) * s;
  const bw = eye.rx * 2 * pad * s;
  const bh = eye.ry * 2 * pad * s;
  const y0 = (pad - 1) * eye.ry * s; // 眼睛上缘
  const y1 = bh - y0; // 眼睛下缘
  const ys = y0 + 1.12 * eye.ry * s; // 闭合时的那道缝，略低于中线
  const yU = y0 + close * (ys - y0); // 上眼皮下沿
  const yL = y1 - close * (y1 - ys); // 下眼皮上沿
  const curve = eye.ry * 0.28 * s;
  const img = (shift: number) => (
    <Img src={staticFile(src)} style={{ position: "absolute", left: -left, top: -top + shift, width: w * s, height: h * s, maxWidth: "none", filter: "brightness(0.93)" }} />
  );
  // 外圈羽化，和周围的毛自然衔接
  const feather = "radial-gradient(ellipse 50% 50% at 50% 50%, #000 86%, transparent 100%)";
  return (
    <div style={{ position: "absolute", left, top, width: bw, height: bh, WebkitMaskImage: feather, maskImage: feather }}>
      {/* 上眼皮：显示眼睛上方的毛，往下盖 */}
      <div style={{ position: "absolute", left: 0, top: 0, width: bw, height: yU + curve, overflow: "hidden", borderBottomLeftRadius: `50% ${curve * 2}px`, borderBottomRightRadius: `50% ${curve * 2}px` }}>
        {img(yU)}
      </div>
      {/* 下眼皮：显示眼睛下方的毛，往上合 */}
      <div style={{ position: "absolute", left: 0, top: yL - curve * 0.5, width: bw, height: bh - yL + curve * 0.5, overflow: "hidden", borderTopLeftRadius: `50% ${curve}px`, borderTopRightRadius: `50% ${curve}px` }}>
        <div style={{ position: "absolute", left: 0, top: -(yL - curve * 0.5), width: bw, height: bh }}>{img(-(bh - yL))}</div>
      </div>
      <svg width={bw} height={bh} style={{ position: "absolute", left: 0, top: 0 }}>
        <path
          d={`M ${bw * 0.12} ${yU} Q ${bw / 2} ${yU + curve * 1.6} ${bw * 0.88} ${yU}`}
          fill="none"
          stroke="#2A1D12"
          strokeWidth={Math.max(1.2, 1.8 * s)}
          strokeLinecap="round"
          opacity={Math.min(1, close * 1.5) * 0.62}
        />
      </svg>
    </div>
  );
};

export const CatPhoto: React.FC<{
  src: string;
  w: number;
  h: number;
  x: number;
  y: number;
  scale: number;
  eyes?: Eye[];
  ears?: Ear[];
  blinks?: number[];
  twitches?: { ear: number; t: number; deg?: number }[];
  /** 呼吸：整体缩放幅度，或只在竖直方向（趴着睡时肚子的起伏） */
  breathe?: number;
  breatheAxis?: "both" | "y";
  breathePeriod?: number;
  pivot?: [number, number];
  opacity?: number;
  warm?: boolean;
}> = ({
  src,
  w,
  h,
  x,
  y,
  scale: s,
  eyes = [],
  ears = [],
  blinks = [],
  twitches = [],
  breathe = 0.006,
  breatheAxis = "both",
  breathePeriod = 3,
  pivot,
  opacity = 1,
  warm = true,
}) => {
  const f = useCurrentFrame();
  const url = staticFile(src);
  const b = breathe * Math.sin(((f / 30) * Math.PI * 2) / breathePeriod);
  const [px, py] = pivot ?? [w / 2, h];
  const transform = breatheAxis === "y" ? `scale(1, ${1 + b})` : `scale(${1 + b})`;
  const close = blinks.reduce((m, t0) => Math.max(m, blinkAt(f, t0)), 0);
  const holes = ears.map((e) => `M ${e.poly.map(([a, c]) => `${a} ${c}`).join(" L ")} Z`).join(" ");
  const baseMask =
    ears.length > 0
      ? `url("data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' preserveAspectRatio='none'><path fill-rule='evenodd' fill='black' d='M 0 0 H ${w} V ${h} H 0 Z ${holes}'/></svg>`,
        )}")`
      : undefined;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w * s,
        height: h * s,
        transformOrigin: `${px * s}px ${py * s}px`,
        transform,
        opacity,
        filter: warm ? "sepia(0.08) saturate(1.04) brightness(1.02)" : undefined,
      }}
    >
      <Img
        src={url}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          ...(baseMask ? { WebkitMaskImage: baseMask, maskImage: baseMask, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" } : {}),
        }}
      />
      {ears.map((e, i) => {
        const deg = twitches.filter((t) => t.ear === i).reduce((a, t) => a + (t.deg ?? 9) * twitchAt(f, t.t), 0) * e.dir;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              clipPath: clip(e.poly, s),
              transformOrigin: `${e.pivot[0] * s}px ${e.pivot[1] * s}px`,
              transform: `rotate(${deg}deg)`,
            }}
          >
            <Img src={url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          </div>
        );
      })}
      {eyes.map((e, i) => (
        <Eyelid key={i} src={src} w={w} h={h} s={s} eye={e} close={close} />
      ))}
    </div>
  );
};
