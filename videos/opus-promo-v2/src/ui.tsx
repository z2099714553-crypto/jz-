import '@fontsource/noto-sans-sc/700.css';
import '@fontsource/noto-sans-sc/900.css';
import '@fontsource/noto-serif-sc/700.css';
import '@fontsource/noto-serif-sc/900.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/cormorant-garamond/600.css';
import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  random,
  useCurrentFrame,
} from 'remotion';
import timeline from './timeline.json';

export const C = {
  bg: '#07060a',
  ink: '#f6efe3',
  dim: 'rgba(246,239,227,0.55)',
  gold: '#e8c27a',
  gold2: '#b8893e',
  coral: '#d97757',
  coralHi: '#ff9a72',
  red: '#ff4d4d',
};

export const SANS = '"Noto Sans SC", sans-serif';
export const SERIF = '"Noto Serif SC", serif';
export const MONO = '"JetBrains Mono", monospace';
export const LATIN = '"Cormorant Garamond", "Noto Serif SC", serif';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Block rendering until every glyph the video uses is downloaded (fonts are unicode-range split). */
export const FontGate: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const text =
      timeline.scenes.map((s) => s.text).join('') +
      '这条视频没有人类剪辑师公元前年世纪机械计算器与的芯片行代码次渲染个剪辑师回答你评论区见关注找到了凌晨报告自制宣传片你正在看的这条' +
      '0123456789πABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,:+-#@';
    const specs = [
      `900 80px "Noto Sans SC"`,
      `700 40px "Noto Sans SC"`,
      `900 80px "Noto Serif SC"`,
      `700 40px "Noto Serif SC"`,
      `500 30px "JetBrains Mono"`,
      `600 60px "Cormorant Garamond"`,
    ];
    Promise.all(specs.map((s) => document.fonts.load(s, text)))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
  return null;
};

/** Deep space background: radial glow, drifting stars, film grain, vignette. */
export const Space: React.FC<{tint?: string; glow?: number; stars?: number}> = ({
  tint = C.coral,
  glow = 0.18,
  stars = 70,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 45% at 50% 38%, ${hexA(tint, glow)}, transparent 70%)`,
        }}
      />
      {Array.from({length: stars}).map((_, i) => {
        const x = random(`sx${i}`) * 1080;
        const y = (random(`sy${i}`) * 1920 - f * (0.2 + random(`sv${i}`) * 0.8) + 1920 * 4) % 1920;
        const s = 1 + random(`ss${i}`) * 2.5;
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(f / 18 + i));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: s,
              background: i % 7 === 0 ? C.gold : '#fff',
              opacity: tw * 0.7,
              boxShadow: `0 0 ${s * 3}px ${i % 7 === 0 ? C.gold : '#fff'}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse 75% 60% at 50% 45%, transparent 55%, rgba(0,0,0,0.75))'}}
      />
      <AbsoluteFill
        style={{
          opacity: 0.07,
          backgroundImage: `repeating-radial-gradient(circle at ${(f * 37) % 100}% ${(f * 53) % 100}%, #fff 0 1px, transparent 1px 3px)`,
          mixBlendMode: 'overlay',
        }}
      />
    </AbsoluteFill>
  );
};

export function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Shake wrapper: intensity decays from `at` over `len` frames. */
export const Shake: React.FC<{at: number[]; amp?: number; len?: number; children: React.ReactNode}> = ({
  at,
  amp = 18,
  len = 10,
  children,
}) => {
  const f = useCurrentFrame();
  let dx = 0;
  let dy = 0;
  for (const a of at) {
    const k = f - a;
    if (k >= 0 && k < len) {
      const p = 1 - k / len;
      dx += (random(`x${a}-${k}`) - 0.5) * 2 * amp * p;
      dy += (random(`y${a}-${k}`) - 0.5) * 2 * amp * p;
    }
  }
  return <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px)`}}>{children}</AbsoluteFill>;
};

/** Small era tag above the visual, e.g. "公元前 200 年 · 算筹". */
export const Tag: React.FC<{children: React.ReactNode; top?: number; delay?: number}> = ({
  children,
  top = 250,
  delay = 4,
}) => {
  const f = useCurrentFrame();
  const p = ease(interpolate(f, [delay, delay + 12], [0, 1], clamp));
  return (
    <div
      style={{
        position: 'absolute',
        top,
        width: '100%',
        textAlign: 'center',
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: 38,
        letterSpacing: 10,
        color: C.gold,
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
        textShadow: `0 0 24px ${hexA(C.gold, 0.6)}`,
      }}
    >
      <span style={{opacity: 0.6}}>—— </span>
      {children}
      <span style={{opacity: 0.6}}> ——</span>
    </div>
  );
};

const HIGHLIGHT: [RegExp, string][] = [
  [/(Claude|AI|bug|回答你|两千年|几年|理解|整个网页|零和一|月球|剪辑师|下一条)/g, C.coralHi],
  [/(竹签|齿轮|芯片|计算|一万行|凌晨三点|视频|评论区|点赞最高)/g, C.gold],
];

function colorize(text: string) {
  const marks: {i: number; j: number; c: string}[] = [];
  for (const [re, c] of HIGHLIGHT) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (!marks.some((k) => m!.index < k.j && m!.index + m![0].length > k.i))
        marks.push({i: m.index, j: m.index + m[0].length, c});
    }
  }
  return Array.from(text).map((ch, idx) => marks.find((k) => idx >= k.i && idx < k.j)?.c ?? C.ink);
}

/**
 * Karaoke subtitle: the line is split at commas into chunks; only the current chunk is shown,
 * big and centred, with characters popping in as the voice speaks them.
 */
export const Subtitle: React.FC<{text: string; start: number; frames: number; top?: number}> = ({
  text,
  start,
  frames,
  top = 1250,
}) => {
  const f = useCurrentFrame();
  const clean = text.replace(/[。]/g, '');
  const chunks = clean.split(/[，？、]/).filter(Boolean);
  const puncts = clean.match(/[，？、]/g) ?? [];
  const total = chunks.reduce((n, c) => n + c.length, 0);
  let acc = 0;
  const spans = chunks.map((c, i) => {
    const a = start + (acc / total) * frames;
    acc += c.length;
    const b = start + (acc / total) * frames;
    return {c: c + (puncts[i] === '？' ? '？' : ''), a, b};
  });
  let cur = spans.findIndex((s) => f < s.b);
  if (cur === -1) cur = spans.length - 1;
  const s = spans[cur];
  if (f < start - 2) return null;
  const chars = Array.from(s.c);
  const colors = colorize(s.c);
  const size = chars.length > 11 ? 62 : chars.length > 8 ? 72 : 84;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 60,
        right: 60,
        textAlign: 'center',
        fontFamily: SANS,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.25,
        letterSpacing: 2,
      }}
    >
      {chars.map((ch, i) => {
        const t = s.a + (i / chars.length) * (s.b - s.a) * 0.85;
        const p = interpolate(f, [t - 1, t + 4], [0, 1], clamp);
        return (
          <span
            key={`${cur}-${i}`}
            style={{
              display: 'inline-block',
              color: colors[i],
              opacity: p,
              transform: `translateY(${(1 - ease(p)) * 26}px) scale(${0.7 + 0.3 * ease(p)})`,
              textShadow: `0 4px 0 rgba(0,0,0,0.85), 0 0 30px rgba(0,0,0,0.9), 0 0 18px ${
                colors[i] === C.ink ? 'transparent' : hexA(colors[i], 0.55)
              }`,
              WebkitTextStroke: '2px rgba(0,0,0,0.6)',
              paintOrder: 'stroke fill',
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Constant top-left badge so viewers know it's AI-made from frame 0. */
export const Badge: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 120,
      left: 48,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 22px',
      borderRadius: 40,
      background: 'rgba(0,0,0,0.45)',
      border: `1.5px solid ${hexA(C.coral, 0.6)}`,
      fontFamily: SANS,
      fontWeight: 700,
      fontSize: 28,
      color: C.ink,
      letterSpacing: 2,
    }}
  >
    <div style={{width: 14, height: 14, borderRadius: 14, background: C.coral, boxShadow: `0 0 12px ${C.coral}`}} />
    100% AI 制作
  </div>
);

/** White flash used at hard cuts. */
export const Flash: React.FC<{at: number; len?: number; color?: string; peak?: number}> = ({
  at,
  len = 8,
  color = '#fff',
  peak = 0.85,
}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at - 1, at, at + len], [0, peak, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: color, opacity: o, mixBlendMode: 'screen'}} />;
};

/** Claude-style radial star made of tapered rays. */
export const Star: React.FC<{size: number; rays?: number; color?: string; grow?: number; spin?: number}> = ({
  size,
  rays = 12,
  color = C.coral,
  grow = 1,
  spin = 0,
}) => (
  <svg width={size} height={size} viewBox="-100 -100 200 200" style={{overflow: 'visible'}}>
    <g transform={`rotate(${spin})`}>
      {Array.from({length: rays}).map((_, i) => {
        const len = (i % 2 ? 72 : 96) * grow;
        return (
          <path
            key={i}
            d={`M -7 -6 L 0 ${-len} L 7 -6 Z`}
            fill={color}
            transform={`rotate(${(360 / rays) * i})`}
            strokeLinejoin="round"
            stroke={color}
            strokeWidth={4}
          />
        );
      })}
      <circle r={12} fill={color} />
    </g>
  </svg>
);
