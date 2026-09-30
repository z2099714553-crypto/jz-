import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Grain, Stage, clamp } from "./common";
import { CHAPTERS, CUES, Cue, FPS } from "./script";
import { Subtitle } from "./Subtitle";
import { ensureFonts } from "./theme";
import { S01Horizon, S02Islands, S03Circle, S04Threads, S05Seaweed, S06Word } from "./scenes/Ch1Sea";
import { S07OldPhoto, S08Files, S09Book, S10Four } from "./scenes/Ch2Phrases";
import { S11Map, S12Split, S13Port, S14Shore } from "./scenes/Ch3Distance";
import { S15Mom, S16Glow, S17Dad, S18Pat, S19Prints, S20Circle } from "./scenes/Ch4Home";
import { Placeholder } from "./scenes/Placeholder";

ensureFonts();

/** 已完成的场景；不在表里的用占位画面 */
const SCENES: Record<string, React.FC> = {
  s01: S01Horizon,
  s02: S02Islands,
  s03: S03Circle,
  s04: S04Threads,
  s05: S05Seaweed,
  s06: S06Word,
  s07: S07OldPhoto,
  s08: S08Files,
  s09: S09Book,
  s10: S10Four,
  s11: S11Map,
  s12: S12Split,
  s13: S13Port,
  s14: S14Shore,
  s15: S15Mom,
  s16: S16Glow,
  s17: S17Dad,
  s18: S18Pat,
  s19: S19Prints,
  s20: S20Circle,
};

/** 相邻两场交叉淡化的帧数 */
const OVERLAP = 14;

const SceneBlock: React.FC<{ cue: Cue; fadeIn: boolean; tail: number }> = ({ cue, fadeIn, tail }) => {
  const frame = useCurrentFrame();
  const Scene = SCENES[cue.id];
  const duration = (cue.to - cue.from) * FPS;
  const o = fadeIn ? interpolate(frame, [0, OVERLAP], [0, 1], clamp) : 1;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {Scene ? <Scene /> : <Placeholder cue={cue} />}
      <Subtitle cue={cue} duration={duration} tail={tail} />
    </AbsoluteFill>
  );
};

export type FilmProps = { music: boolean };

/** 渲染 [from, to) 秒之间的所有场景。整片和各章都用它 */
export const Film: React.FC<FilmProps & { from: number; to: number }> = ({ music, from, to }) => {
  const cues = CUES.filter((c) => c.from >= from && c.to <= to);
  return (
    <Stage>
      <AbsoluteFill style={{ background: "#000" }}>
        {cues.map((cue, i) => {
          const next = cues[i + 1];
          const tail = next && !next.cut ? OVERLAP : 0;
          const duration = (cue.to - cue.from) * FPS;
          return (
            <Sequence key={cue.id} name={`${cue.id} ${cue.zh.slice(0, 10)}`} from={(cue.from - from) * FPS} durationInFrames={duration + tail}>
              <SceneBlock cue={cue} fadeIn={i > 0 && !cue.cut} tail={tail} />
            </Sequence>
          );
        })}
        <Grain />
      </AbsoluteFill>
      {music ? <Audio src={staticFile("ohana/score.mp3")} trimBefore={from * FPS} /> : null}
    </Stage>
  );
};

export const OhanaFull: React.FC<FilmProps> = ({ music }) => <Film music={music} from={0} to={CUES[CUES.length - 1].to} />;

export const chapterComponent = (id: string): React.FC<FilmProps> => {
  const ch = CHAPTERS.find((c) => c.id === id)!;
  const C: React.FC<FilmProps> = ({ music }) => <Film music={music} from={ch.from} to={ch.to} />;
  C.displayName = `Ohana_${id}`;
  return C;
};
