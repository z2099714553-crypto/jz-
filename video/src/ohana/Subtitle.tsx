import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { clamp } from "./common";
import { Cue, FPS } from "./script";
import { CORAL, FONT_EN, FONT_ZH, HOME, RED, SEA } from "./theme";

const palette = {
  dark: { main: SEA.moon, en: "rgba(238,244,244,0.64)", label: CORAL, rule: "rgba(238,244,244,0.3)" },
  light: { main: HOME.ink, en: "rgba(43,38,34,0.62)", label: "#A9432F", rule: "rgba(43,38,34,0.26)" },
};

/** 估算一段文字的视觉宽度（以汉字宽度为 1） */
const visualWidth = (s: string) => [...s].reduce((w, ch) => w + (ch.codePointAt(0)! > 0x2e80 || ch === "—" ? 1 : 0.52), 0);

const MAX_LINE = 24;

/** 太长的句子在最靠中间的标点后断成两行 */
export const breakLines = (text: string): string[] => {
  const chars = [...text];
  if (visualWidth(text) <= MAX_LINE) return [text];
  let best = -1;
  let bestScore = Infinity;
  chars.forEach((ch, i) => {
    if (!"，。：；！？".includes(ch) || i === chars.length - 1) return;
    const left = visualWidth(chars.slice(0, i + 1).join(""));
    const right = visualWidth(chars.slice(i + 1).join(""));
    const score = Math.abs(left - right) + (Math.max(left, right) > MAX_LINE + 3 ? 100 : 0);
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  });
  if (best < 0) best = Math.floor(chars.length / 2) - 1;
  return [chars.slice(0, best + 1).join(""), chars.slice(best + 1).join("")];
};

/** 分句：中文按「。」和结尾的「——」，英文按句末标点 */
const splitZh = (s: string) => s.match(/[^。]+?(。|——|$)/g)!.filter((p) => p.trim());
const splitEn = (s: string) => s.split(/(?<=[.!?—])\s+/).filter((p) => p.trim());

type LineProps = {
  big?: boolean;
  zh: string;
  en: string;
  label?: string;
  tone: Cue["tone"];
  center: boolean;
  start: number;
  stagger: number;
  outStart: number;
  outEnd: number;
};

const SubtitleBlock: React.FC<LineProps> = ({ big, zh, en, label, tone, center, start, stagger, outStart, outEnd }) => {
  const frame = useCurrentFrame();
  const colors = palette[tone];
  const lines = breakLines(zh);
  const total = [...zh].length;
  const revealEnd = start + total * stagger + 14;
  const out = interpolate(frame, [outStart, outEnd], [1, 0], clamp);
  if (out <= 0 || frame < start - 14) return null;

  const labelStart = start - 12;
  const labelIn = interpolate(frame, [labelStart, labelStart + 18], [0, 1], clamp);
  const labelSpacing = interpolate(frame, [labelStart, labelStart + 30], [0.28, 0.44], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const ruleIn = interpolate(frame, [start + 6, start + 26], [0, 1], clamp);
  const enIn = interpolate(frame, [Math.min(revealEnd - 8, start + 30), revealEnd + 10], [0, 1], clamp);
  const mainSize = big ? 78 : center ? 60 : lines.length > 1 ? 48 : 52;

  let idx = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        ...(center ? { top: 0, bottom: 0, justifyContent: "center" } : { bottom: 70 }),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: out,
        pointerEvents: "none",
        textAlign: "center",
      }}
    >
      {label ? (
        <div
          style={{
            fontFamily: FONT_ZH,
            fontSize: 26,
            letterSpacing: `${labelSpacing}em`,
            marginRight: `-${labelSpacing}em`,
            color: colors.label,
            opacity: labelIn,
            marginBottom: 22,
          }}
        >
          {label}
        </div>
      ) : null}

      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            fontFamily: FONT_ZH,
            fontSize: mainSize,
            letterSpacing: "0.1em",
            marginRight: "-0.1em",
            color: colors.main,
            whiteSpace: "pre",
            lineHeight: 1.42,
          }}
        >
          {[...line].map((ch) => {
            const t0 = start + idx++ * stagger;
            const o = interpolate(frame, [t0, t0 + 14], [0, 1], clamp);
            const y = interpolate(frame, [t0, t0 + 18], [8, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
            const blur = interpolate(frame, [t0, t0 + 14], [5, 0], clamp);
            return (
              <span
                key={t0}
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
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 12px", opacity: ruleIn }}>
        <div style={{ width: 40 * ruleIn, height: 1.5, background: colors.rule }} />
        <div style={{ width: 8, height: 8, borderRadius: 4, background: RED }} />
        <div style={{ width: 40 * ruleIn, height: 1.5, background: colors.rule }} />
      </div>

      <div
        style={{
          fontFamily: FONT_EN,
          fontStyle: "italic",
          fontSize: big ? 36 : center ? 32 : 29,
          letterSpacing: "0.02em",
          color: colors.en,
          opacity: enIn,
          maxWidth: 1640,
          lineHeight: 1.3,
        }}
      >
        {en}
      </div>
    </div>
  );
};

/**
 * 一场的字幕。duration / tail 为帧数：tail 是与下一场交叉淡化的长度（硬切为 0）。
 * steps 场景把台词拆成几句，平分时长，一句接一句。
 */
export const Subtitle: React.FC<{ cue: Cue; duration: number; tail: number }> = ({ cue, duration, tail }) => {
  if (!cue.zh) return null;
  const center = cue.place === "center";
  const stagger = cue.stagger ?? 2;
  const outEnd = tail > 0 ? duration + Math.min(6, tail) : duration - 2;
  const start = Math.round((cue.textDelay ?? (cue.label ? 0.75 : 0.5)) * FPS);

  if (!cue.steps) {
    return (
      <SubtitleBlock
        big={cue.big}
        zh={cue.zh}
        en={cue.en}
        label={cue.label}
        tone={cue.tone}
        center={center}
        start={start}
        stagger={stagger}
        outStart={outEnd - 12}
        outEnd={outEnd}
      />
    );
  }

  const zhParts = splitZh(cue.zh);
  const enParts = splitEn(cue.en);
  const first = Math.round(0.4 * FPS);
  const slot = (duration - first) / zhParts.length;
  return (
    <>
      {zhParts.map((zh, i) => {
        const s = Math.round(first + i * slot);
        const last = i === zhParts.length - 1;
        const e = last ? outEnd : Math.round(first + (i + 1) * slot) - 2;
        return (
          <SubtitleBlock
            key={i}
            big={cue.big}
            zh={zh}
            en={enParts[i] ?? ""}
            label={i === 0 ? cue.label : undefined}
            tone={cue.tone}
            center={center}
            start={s}
            stagger={3}
            outStart={e - 10}
            outEnd={e}
          />
        );
      })}
    </>
  );
};
