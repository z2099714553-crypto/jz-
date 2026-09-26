import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Cue, FPS } from "./script";
import { C, FONT_EN, FONT_ZH } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const palette = {
  dark: { main: C.moon, en: "rgba(239,231,216,0.66)", label: "#D38E70", rule: "rgba(239,231,216,0.28)" },
  light: { main: C.ink, en: "rgba(42,37,33,0.62)", label: "#A4492F", rule: "rgba(42,37,33,0.25)" },
};

/**
 * 字幕：小标签 → 主字幕逐字淡入 → 红点细线 → 英文。
 * duration 是本场的帧数，字幕在场景结束前淡出，不和下一场重叠。
 */
export const Subtitle: React.FC<{ cue: Cue; duration: number }> = ({ cue, duration }) => {
  const frame = useCurrentFrame();
  if (!cue.zh) return null;

  const colors = palette[cue.tone];
  const stagger = cue.stagger ?? 2;
  const defaultDelay = cue.label ? 0.75 : 0.5;
  const start = Math.round((cue.textDelay ?? defaultDelay) * FPS);
  const labelStart = start - 12;
  const chars = [...cue.zh];
  const revealEnd = start + chars.length * stagger + 14;

  // 整体淡出
  const out = interpolate(frame, [duration - 18, duration - 4], [1, 0], clamp);

  const labelIn = interpolate(frame, [labelStart, labelStart + 18], [0, 1], clamp);
  const labelSpacing = interpolate(frame, [labelStart, labelStart + 30], [0.26, 0.42], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  const ruleIn = interpolate(frame, [start + 6, start + 26], [0, 1], clamp);
  const enIn = interpolate(frame, [Math.min(revealEnd - 8, start + 30), revealEnd + 10], [0, 1], clamp);

  const center = cue.place === "center";

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        ...(center ? { top: 0, bottom: 0, justifyContent: "center" } : { bottom: 86 }),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: out,
        pointerEvents: "none",
      }}
    >
      {cue.label ? (
        <div
          style={{
            fontFamily: FONT_ZH,
            fontSize: 21,
            letterSpacing: `${labelSpacing}em`,
            color: colors.label,
            opacity: labelIn,
            marginBottom: 20,
            // 字间距会在最后一个字后面多出一截，用负边距抵消，保证视觉居中
            marginRight: `-${labelSpacing}em`,
          }}
        >
          {cue.label}
        </div>
      ) : null}

      <div
        style={{
          fontFamily: FONT_ZH,
          fontSize: center ? 54 : 46,
          fontWeight: 400,
          letterSpacing: "0.12em",
          marginRight: "-0.12em",
          color: colors.main,
          whiteSpace: "pre",
          lineHeight: 1.3,
        }}
      >
        {chars.map((ch, i) => {
          const t0 = start + i * stagger;
          const o = interpolate(frame, [t0, t0 + 14], [0, 1], clamp);
          const y = interpolate(frame, [t0, t0 + 18], [7, 0], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });
          const blur = interpolate(frame, [t0, t0 + 14], [5, 0], clamp);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: o,
                transform: `translateY(${y}px)`,
                filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "16px 0 12px", opacity: ruleIn }}>
        <div style={{ width: 38 * ruleIn, height: 1, background: colors.rule }} />
        <div style={{ width: 6, height: 6, borderRadius: 3, background: C.cinnabar }} />
        <div style={{ width: 38 * ruleIn, height: 1, background: colors.rule }} />
      </div>

      <div
        style={{
          fontFamily: FONT_EN,
          fontStyle: "italic",
          fontSize: center ? 28 : 25,
          letterSpacing: "0.02em",
          color: colors.en,
          opacity: enIn,
        }}
      >
        {cue.en}
      </div>
    </div>
  );
};
