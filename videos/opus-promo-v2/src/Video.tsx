import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import timeline from './timeline.json';
import {Code, Hook, Rewind, Rods, Gears, Binary, Chip, Moon, type SceneProps} from './scenes1';
import {Answer, Brand, Bug, Cta, Dark, FlashScene, Report, Self, Stats, Web} from './scenes2';
import {Badge, Flash, FontGate, Subtitle, Vignette} from './ui';

const SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook, code: Code, rewind: Rewind, rods: Rods, gears: Gears, binary: Binary, chip: Chip, moon: Moon,
  dark: Dark, flash: FlashScene, brand: Brand, web: Web, bug: Bug, report: Report, self: Self, stats: Stats,
  answer: Answer, cta: Cta,
};
// Final cut is BGM-only; flip to true to bring the narration back.
const WITH_VOICE = false;
// Scenes whose big on-screen text already *is* the line.
const NO_SUB = new Set(['hook', 'brand', 'answer']);
// Hard cuts that get a white flash.
const FLASH_IN = new Set(['rods', 'gears', 'binary', 'chip', 'moon', 'web', 'bug', 'report', 'self', 'stats', 'cta']);

export const OpusPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <FontGate />
      <Audio src={staticFile('music.wav')} volume={1} />
      {timeline.scenes.map((s, i) => {
        const Scene = SCENES[s.id];
        const isLast = i === timeline.scenes.length - 1;
        const len = isLast ? timeline.totalFrames - s.from : s.frames;
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={len} name={s.id}>
            <Scene d={s.frames} vs={s.voiceFrom} vf={s.voiceFrames} />
            {!NO_SUB.has(s.id) && <Subtitle text={s.text} start={s.voiceFrom} frames={s.voiceFrames} />}
            {WITH_VOICE && (
              <Sequence from={s.voiceFrom}>
                <Audio src={staticFile(s.file)} volume={1} />
              </Sequence>
            )}
          </Sequence>
        );
      })}
      <Vignette />
      {timeline.scenes.filter((s) => FLASH_IN.has(s.id)).map((s) => (
        <Flash key={s.id} at={s.from} len={10} peak={0.3} />
      ))}
      <Badge />
    </AbsoluteFill>
  );
};
