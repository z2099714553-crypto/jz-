import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Grain, clamp } from "./common";
import { CUES, Cue, FPS } from "./script";
import { Subtitle } from "./Subtitle";
import { ensureFonts } from "./theme";
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

/** 相邻两场交叉淡化的帧数 */
const OVERLAP = 14;

const FadeIn: React.FC<{ enabled: boolean; children: React.ReactNode }> = ({ enabled, children }) => {
  const frame = useCurrentFrame();
  const o = enabled ? interpolate(frame, [0, OVERLAP], [0, 1], clamp) : 1;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const SceneBlock: React.FC<{ cue: Cue; index: number; tail: number }> = ({ cue, index, tail }) => {
  const Scene = SCENES[cue.id];
  const duration = (cue.to - cue.from) * FPS;
  return (
    <FadeIn enabled={index > 0 && !cue.cut}>
      <Scene />
      <Subtitle cue={cue} duration={duration} tail={tail} />
    </FadeIn>
  );
};

export type SuanChouProps = { music: boolean };

export const SuanChou: React.FC<SuanChouProps> = ({ music }) => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {CUES.map((cue, i) => {
        const next = CUES[i + 1];
        const tail = next && !next.cut ? OVERLAP : 0;
        const duration = (cue.to - cue.from) * FPS;
        return (
          <Sequence key={cue.id} name={`${cue.id} ${cue.zh.slice(0, 10)}`} from={cue.from * FPS} durationInFrames={duration + tail}>
            <SceneBlock cue={cue} index={i} tail={tail} />
          </Sequence>
        );
      })}
      <Grain />
      {music ? <Audio src={staticFile("suanchou/score.mp3")} /> : null}
    </AbsoluteFill>
  );
};
