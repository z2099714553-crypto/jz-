import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

/**
 * 抠图人物/猫的照片层。
 * 图片按原图像素尺寸 × scale 放在舞台 (x, y) 处，(x, y) 对应原图左上角。
 * 动效：呼吸感的轻微缩放、绕脚下的小幅摆动；wind 给出的椭圆区域（原图坐标）里，
 * 叠一层随风流动的细微位移，用来做发丝、衣角的飘动，其余部分保持原样不变形。
 */
export type WindRegion = { cx: number; cy: number; rx: number; ry: number };

export const Photo: React.FC<{
  src: string;
  w: number;
  h: number;
  x: number;
  y: number;
  scale: number;
  /** 呼吸与摆动的支点（原图坐标），默认底部中间 */
  pivot?: [number, number];
  breathe?: number;
  sway?: number;
  wind?: WindRegion[];
  windStrength?: number;
  seed?: number;
  opacity?: number;
  /** 统一的暖色调，让冷调的原片融进暖米白的画面 */
  warm?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ src, w, h, x, y, scale, pivot, breathe = 0.006, sway = 0.3, wind = [], windStrength = 5, seed = 1, opacity = 1, warm = true, style, children }) => {
  const f = useCurrentFrame();
  const [px, py] = pivot ?? [w / 2, h];
  const b = 1 + breathe * Math.sin((f / 30) * Math.PI * 0.5 + seed);
  const r = sway * Math.sin((f / 30) * Math.PI * 0.33 + seed * 2);
  const url = staticFile(src);
  const id = `wind-${seed}`;
  const drift = f * 1.6;
  const gradients = wind
    .map((e) => `radial-gradient(ellipse ${e.rx * scale}px ${e.ry * scale}px at ${e.cx * scale}px ${e.cy * scale}px, black 55%, transparent 100%)`)
    .join(", ");
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w * scale,
        height: h * scale,
        transformOrigin: `${px * scale}px ${py * scale}px`,
        transform: `rotate(${r}deg) scale(${b})`,
        opacity,
        filter: warm ? "sepia(0.16) saturate(1.05) brightness(1.03) contrast(0.97)" : undefined,
        ...style,
      }}
    >
      <Img
        src={url}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          // 飘动区域里原图让位给下面那层，两层按同一个柔和遮罩互补，避免重影
          ...(wind.length > 0
            ? {
                WebkitMaskImage: `linear-gradient(#000, #000), ${gradients}`,
                maskImage: `linear-gradient(#000, #000), ${gradients}`,
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }
            : {}),
        }}
      />
      {wind.length > 0 ? (
        <>
          <svg width={0} height={0} style={{ position: "absolute" }}>
            <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves={2} seed={seed} result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale={windStrength} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              WebkitMaskImage: gradients,
              maskImage: gradients,
            }}
          >
            {/* 噪声场随时间平移，人不动：外层平移 +d，滤镜层，内层平移 −d */}
            <div style={{ position: "absolute", inset: 0, transform: `translate(${drift}px, ${drift * 0.3}px)` }}>
              <div style={{ position: "absolute", inset: 0, filter: `url(#${id})` }}>
                <div style={{ position: "absolute", inset: 0, transform: `translate(${-drift}px, ${-drift * 0.3}px)` }}>
                  <Img src={url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
      {children}
    </div>
  );
};

/** 只落在人物身上的光影（树影、光斑）：用抠图的透明度做遮罩 */
export const OnSubject: React.FC<{ src: string; children: React.ReactNode; blend?: React.CSSProperties["mixBlendMode"] }> = ({
  src,
  children,
  blend = "multiply",
}) => {
  const url = staticFile(src);
  return (
    <AbsoluteFill
      style={{
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        mixBlendMode: blend,
        pointerEvents: "none",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
