import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, interpolateColors, staticFile } from "remotion";
import { Grain, clamp } from "./common";
import { ANIM_FPS, CUES, Cue, FPS, TOTAL_SECONDS, WATERMARK } from "./script";
import { Subtitle } from "./Subtitle";
import { C, FONT_EN, ensureFonts } from "./theme";
import { useTick } from "./time";
import { S01Fall, S02Rods, S03Circle, S04Pi } from "./scenes/Ancient";
import { S05Gears, S06Carry } from "./scenes/Mechanical";
import { S07Boole, S08Tape, S09Wafer, S10Apollo } from "./scenes/Modern";
import { S11Black, S12Converge, S13Understand, S14Point, S15Work, S16Rod, S17Stars, SEnd } from "./scenes/Claude";

ensureFonts();

const SCENES: Record<string, React.FC> = {
  s01: S01Fall,
  s02: S02Rods,
  s03: S03Circle,
  s04: S04Pi,
  s05: S05Gears,
  s06: S06Carry,
  s07: S07Boole,
  s08: S08Tape,
  s09: S09Wafer,
  s10: S10Apollo,
  s11: S11Black,
  s12: S12Converge,
  s13: S13Understand,
  s14: S14Point,
  s15: S15Work,
  s16: S16Rod,
  s17: S17Stars,
  end: SEnd,
};

/** 相邻两场交叉淡化的长度（按 30fps 节拍） */
const OVERLAP = 14;

const FadeIn: React.FC<{ enabled: boolean; children: React.ReactNode }> = ({ enabled, children }) => {
  const t = useTick();
  const o = enabled ? interpolate(t, [0, OVERLAP], [0, 1], clamp) : 1;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const SceneBlock: React.FC<{ cue: Cue; index: number; tail: number }> = ({ cue, index, tail }) => {
  const Scene = SCENES[cue.id];
  const duration = (cue.to - cue.from) * ANIM_FPS;
  return (
    <FadeIn enabled={index > 0 && !cue.cut}>
      <Scene />
      <Subtitle cue={cue} duration={duration} tail={tail} />
    </FadeIn>
  );
};

/** 当前时刻底色的明暗：0 = 深色场景，1 = 浅色场景，交叉淡化时取中间值 */
const toneAt = (t: number) => {
  const sec = t / ANIM_FPS;
  const i = Math.max(0, CUES.findIndex((c) => sec >= c.from && sec < c.to));
  const cur = CUES[i];
  const k = cur.tone === "light" ? 1 : 0;
  const prev = CUES[i - 1];
  if (!prev || cur.cut) return k;
  const kp = prev.tone === "light" ? 1 : 0;
  return interpolate(t - cur.from * ANIM_FPS, [0, OVERLAP], [kp, k], clamp);
};

/** 右上角署名水印，颜色随场景明暗切换，带一层柔和阴影，压在彩色画面上也看得清 */
const Watermark: React.FC = () => {
  const t = useTick();
  const end = TOTAL_SECONDS * ANIM_FPS;
  const o = interpolate(t, [20, 60, end - 30, end], [0, 1, 1, 0], clamp);
  const k = toneAt(t);
  const color = interpolateColors(k, [0, 1], ["rgba(239,231,216,0.62)", "rgba(42,37,33,0.55)"]);
  const shadow = interpolateColors(k, [0, 1], ["rgba(0,0,0,0.55)", "rgba(245,239,228,0.7)"]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o }}>
      <div style={{ position: "absolute", top: 42, right: 58, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 5, height: 5, borderRadius: 3, background: C.cinnabar, opacity: 0.85 }} />
        <div
          style={{
            fontFamily: FONT_EN,
            fontStyle: "italic",
            fontSize: 27,
            letterSpacing: "0.06em",
            color,
            textShadow: `0 1px 8px ${shadow}, 0 0 2px ${shadow}`,
          }}
        >
          {WATERMARK}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export type SuanChouProps = { music: boolean };

export const SuanChou: React.FC<SuanChouProps> = ({ music }) => {
  const toFrames = (ticks: number) => Math.round((ticks * FPS) / ANIM_FPS);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {CUES.map((cue, i) => {
        const next = CUES[i + 1];
        const tail = next && !next.cut ? OVERLAP : 0;
        const duration = (cue.to - cue.from) * FPS;
        return (
          <Sequence
            key={cue.id}
            name={`${cue.id} ${cue.zh.slice(0, 10)}`}
            from={cue.from * FPS}
            durationInFrames={duration + toFrames(tail)}
          >
            <SceneBlock cue={cue} index={i} tail={tail} />
          </Sequence>
        );
      })}
      <Grain />
      <Watermark />
      {music ? <Audio src={staticFile("suanchou/score.mp3")} /> : null}
    </AbsoluteFill>
  );
};
