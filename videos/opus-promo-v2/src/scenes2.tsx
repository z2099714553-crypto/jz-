import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame} from 'remotion';
import stats from './stats.json';
import timeline from './timeline.json';
import type {SceneProps} from './scenes1';
import {C, LATIN, MONO, SANS, SERIF, Shake, Space, Star, Tag, clamp, ease, hexA} from './ui';

const sp = (f: number, damping = 12, stiffness = 160) => spring({frame: f, fps: 30, config: {damping, stiffness}});

/* ---------------- 9. DARK ---------------- */
export const Dark: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const breath = 1 + 0.25 * Math.sin((f / 30) * Math.PI * 1.1);
  return (
    <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          marginTop: -240,
          width: 26 * breath,
          height: 26 * breath,
          borderRadius: 40,
          background: C.coral,
          boxShadow: `0 0 ${80 * breath}px ${20 * breath}px ${hexA(C.coral, 0.55)}`,
          opacity: interpolate(f, [0, 10], [0, 1], clamp),
        }}
      />
      <div style={{position: 'absolute', top: 1000, fontFamily: LATIN, fontWeight: 600, fontSize: 46, color: C.dim, letterSpacing: 8}}>
        {`-200  ·····  ${Math.round(interpolate(f, [0, d], [1500, 2026], clamp))}`}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 10. FLASH ---------------- */
export const FlashScene: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const g = Math.pow(interpolate(f, [0, d - 4], [0, 1], clamp), 3);
  return (
    <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center'}}>
      <svg width={1080} height={1920} viewBox="-540 -960 1080 1920" style={{position: 'absolute', opacity: g}}>
        {Array.from({length: 36}).map((_, i) => (
          <path
            key={i}
            d={`M 0 -240 L ${-8 - 30 * g} ${-240 - 1400} L ${8 + 30 * g} ${-240 - 1400} Z`}
            fill={i % 3 ? hexA(C.gold, 0.35) : hexA(C.coral, 0.5)}
            transform={`rotate(${i * 10 + f * 0.6} 0 -240)`}
          />
        ))}
      </svg>
      <div
        style={{
          marginTop: -240,
          width: 26 + g * 1400,
          height: 26 + g * 1400,
          borderRadius: 2000,
          background: `radial-gradient(circle, #fff 0%, #ffe8d8 35%, ${hexA(C.coral, 0.6)} 60%, transparent 72%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------------- 11. BRAND ---------------- */
export const Brand: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const whiteOut = interpolate(f, [0, 10], [1, 0], clamp);
  const star = sp(f - 2, 9, 90);
  const title = sp(f - 14, 14, 120);
  const sub = interpolate(f, [30, 42], [0, 1], clamp);
  const shine = interpolate(f, [20, 50], [-30, 130], clamp);
  return (
    <AbsoluteFill>
      <Space tint={C.coral} glow={0.35} stars={90} />
      <Shake at={[0, 2]} amp={26} len={14}>
        {Array.from({length: 80}).map((_, i) => {
          const a = random(`pa${i}`) * Math.PI * 2;
          const dist = 900 * (1 - ease(interpolate(f, [0, 22], [0, 1], clamp))) + 30;
          const x = 540 + Math.cos(a) * dist * (0.6 + random(`pd${i}`) * 0.6);
          const y = 700 + Math.sin(a) * dist * (0.6 + random(`pe${i}`) * 0.6);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 6,
                height: 6,
                borderRadius: 6,
                background: i % 3 ? C.gold : C.coralHi,
                boxShadow: `0 0 12px ${C.coral}`,
                opacity: interpolate(f, [16, 24], [1, 0], clamp),
              }}
            />
          );
        })}
        <div style={{position: 'absolute', left: 540 - 210, top: 700 - 210, transform: `scale(${star})`}}>
          <div style={{position: 'absolute', inset: -60, borderRadius: 400, background: `radial-gradient(circle, ${hexA(C.coral, 0.55)}, transparent 65%)`}} />
          <Star size={420} rays={12} spin={f * 0.6} grow={0.9 + 0.1 * Math.sin(f / 6)} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 960,
            width: '100%',
            textAlign: 'center',
            transform: `translateY(${(1 - title) * 60}px)`,
            opacity: title,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              fontFamily: LATIN,
              fontWeight: 600,
              fontSize: 150,
              lineHeight: 1,
              color: C.ink,
              backgroundImage: `linear-gradient(100deg, ${C.ink} ${shine - 15}%, #fff ${shine}%, ${C.ink} ${shine + 15}%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 0 30px ${hexA(C.coral, 0.6)})`,
            }}
          >
            Claude
          </div>
          <div style={{fontFamily: LATIN, fontWeight: 600, fontSize: 110, lineHeight: 1.1, color: C.ink, marginTop: 6}}>
            Opus <span style={{color: C.coral}}>5.5</span>
          </div>
          <div style={{marginTop: 26, fontFamily: SERIF, fontWeight: 700, fontSize: 34, letterSpacing: 14, color: C.gold, opacity: sub}}>
            它不只计算 · 它理解
          </div>
        </div>
      </Shake>
      <AbsoluteFill style={{background: '#fff', opacity: whiteOut}} />
    </AbsoluteFill>
  );
};

/* shared phone/window chrome for capability demos */
const Window: React.FC<{title: string; children: React.ReactNode; top?: number; height?: number; enter: number}> = ({
  title,
  children,
  top = 330,
  height = 780,
  enter,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 70,
      right: 70,
      top,
      height,
      borderRadius: 34,
      background: 'linear-gradient(160deg, #1a1620, #0e0c12)',
      border: `2px solid ${hexA(C.coral, 0.45)}`,
      boxShadow: `0 30px 90px rgba(0,0,0,0.6), 0 0 60px ${hexA(C.coral, 0.25)}`,
      overflow: 'hidden',
      transform: `perspective(1600px) rotateX(${(1 - enter) * 30}deg) translateY(${(1 - enter) * 240}px) scale(${0.85 + 0.15 * enter})`,
      opacity: enter,
    }}
  >
    <div style={{height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <div key={c} style={{width: 18, height: 18, borderRadius: 18, background: c}} />
      ))}
      <div style={{marginLeft: 18, fontFamily: MONO, fontSize: 24, color: C.dim}}>{title}</div>
    </div>
    <div style={{position: 'relative', height: height - 64}}>{children}</div>
  </div>
);

/* ---------------- 12. WEB ---------------- */
export const Web: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const prompt = '帮我做一个个人主页';
  const typed = Math.floor(interpolate(f, [6, 36], [0, prompt.length], clamp));
  const build = (k: number) => sp(f - 42 - k * 8, 13, 170);
  return (
    <AbsoluteFill>
      <Space tint={C.coral} glow={0.15} stars={30} />
      <Tag top={210}>能力 01 · 一句话建站</Tag>
      <Window title="claude.ai" enter={sp(f, 14, 140)}>
        <div style={{position: 'absolute', top: 30, right: 30, maxWidth: 640, padding: '22px 30px', borderRadius: 26, background: hexA(C.coral, 0.9), fontFamily: SANS, fontWeight: 700, fontSize: 40, color: '#fff'}}>
          {prompt.slice(0, typed)}
          <span style={{opacity: f % 16 < 8 ? 1 : 0}}>|</span>
        </div>
        <div style={{position: 'absolute', top: 150, left: 30, right: 30, bottom: 30, borderRadius: 22, background: '#f5efe6', overflow: 'hidden'}}>
          <div style={{transform: `translateY(${(1 - build(0)) * -80}px)`, opacity: build(0), height: 70, background: '#1d1a22', display: 'flex', alignItems: 'center', padding: '0 26px', gap: 20}}>
            <div style={{width: 34, height: 34, borderRadius: 34, background: C.coral}} />
            {[120, 90, 100].map((w, i) => (
              <div key={i} style={{width: w, height: 14, borderRadius: 7, background: '#6d6573'}} />
            ))}
          </div>
          <div style={{display: 'flex', gap: 30, padding: 36, alignItems: 'center', opacity: build(1), transform: `scale(${0.8 + 0.2 * build(1)})`}}>
            <div style={{width: 170, height: 170, borderRadius: 170, background: `linear-gradient(135deg, ${C.coral}, ${C.gold})`}} />
            <div>
              <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 54, color: '#1d1a22'}}>你好，我是小周</div>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#7a7280', marginTop: 10}}>设计师 · 摄影 · 写字</div>
            </div>
          </div>
          <div style={{display: 'flex', gap: 20, padding: '0 36px'}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{flex: 1, height: 220, borderRadius: 18, background: [`#e8c27a`, `#d97757`, `#8fa7c9`][i], opacity: build(2 + i), transform: `translateY(${(1 - build(2 + i)) * 80}px)`}} />
            ))}
          </div>
          <div style={{margin: '26px 36px', display: 'flex', flexDirection: 'column', gap: 14, opacity: build(5)}}>
            {[90, 75, 82].map((w, i) => (
              <div key={i} style={{width: `${w}%`, height: 16, borderRadius: 8, background: '#d8cfc2'}} />
            ))}
          </div>
        </div>
      </Window>
    </AbsoluteFill>
  );
};

/* ---------------- 13. BUG ---------------- */
export const Bug: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const stopAt = d * 0.55;
  const p = interpolate(f, [0, stopAt], [0, 1], clamp);
  const line = Math.floor(7342 * (1 - Math.pow(1 - p, 3)));
  const found = f >= stopAt;
  const lh = 50;
  const snippets = stats.snippets;
  const ring = sp(f - stopAt, 10, 200);
  return (
    <AbsoluteFill>
      <Space tint={C.red} glow={found ? 0.18 : 0.06} stars={20} />
      <Tag top={210}>能力 02 · 万行找 bug</Tag>
      <Window title="app/src/payment.ts" enter={sp(f, 14, 160)}>
        <div style={{position: 'absolute', inset: 0, filter: `blur(${found ? 0 : Math.min(6, (1 - p) * 8)}px)`}}>
          {Array.from({length: 15}).map((_, i) => {
            const n = line - 7 + i;
            const isBug = found && i === 7;
            return (
              <div
                key={i}
                style={{
                  height: lh,
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: MONO,
                  fontSize: 25,
                  background: isBug ? hexA(C.red, 0.28) : 'transparent',
                  borderLeft: isBug ? `6px solid ${C.red}` : '6px solid transparent',
                }}
              >
                <span style={{width: 130, textAlign: 'right', paddingRight: 24, color: 'rgba(255,255,255,0.3)'}}>{n > 0 ? n : ''}</span>
                <span style={{color: isBug ? '#fff' : i % 3 ? C.dim : C.gold, whiteSpace: 'nowrap'}}>
                  {isBug ? 'if (amount = 0) refund(user);' : snippets[(n * 7 + 3) % snippets.length]}
                </span>
              </div>
            );
          })}
        </div>
        {found && (
          <div style={{position: 'absolute', top: 64 + 7 * lh - 30, left: 110, right: 26, height: lh + 60, border: `4px solid ${C.red}`, borderRadius: 16, transform: `scale(${2 - ring})`, opacity: ring, boxShadow: `0 0 40px ${C.red}`}} />
        )}
      </Window>
      <div style={{position: 'absolute', top: 1130 - 40, width: '100%', display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'baseline', fontFamily: SANS, fontWeight: 900}}>
        <span style={{fontFamily: LATIN, fontSize: 90, color: found ? C.red : C.ink}}>{found ? 'Line 7,342' : line.toLocaleString('en-US')}</span>
        <span style={{fontSize: 40, color: C.dim}}>/ 10,000</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 14. REPORT ---------------- */
export const Report: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const mins = Math.floor(interpolate(f, [0, d], [0, 59], clamp));
  const bars = [0.45, 0.7, 0.55, 0.9, 0.78, 1];
  return (
    <AbsoluteFill>
      <Space tint="#4a6cff" glow={0.12} stars={50} />
      <Tag top={210}>能力 03 · 深夜的搭档</Tag>
      <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: LATIN, fontWeight: 600, fontSize: 200, color: C.ink, textShadow: `0 0 50px ${hexA('#7aa0ff', 0.6)}`}}>
        03:{String(mins).padStart(2, '0')}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 140,
          right: 140,
          top: 580,
          height: 520,
          borderRadius: 24,
          background: '#f6f1e8',
          padding: 40,
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          transform: `translateY(${(1 - sp(f - 4)) * 300}px) rotate(${(1 - sp(f - 4)) * -6}deg)`,
        }}
      >
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 44, color: '#1d1a22'}}>Q3 复盘报告</div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 24, height: 280, marginTop: 40, borderBottom: '3px solid #cfc6b8'}}>
          {bars.map((b, i) => (
            <div key={i} style={{flex: 1, height: `${b * 100 * ease(interpolate(f, [12 + i * 4, 30 + i * 4], [0, 1], clamp))}%`, borderRadius: '10px 10px 0 0', background: i === bars.length - 1 ? C.coral : C.gold}} />
          ))}
        </div>
        <div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12}}>
          {[88, 70].map((w, i) => (
            <div key={i} style={{width: `${w * interpolate(f, [30, 50], [0, 1], clamp)}%`, height: 14, borderRadius: 7, background: '#d8cfc2'}} />
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            right: -30,
            top: -30,
            width: 110,
            height: 110,
            borderRadius: 110,
            background: '#2fbf71',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 70,
            color: '#fff',
            fontWeight: 900,
            transform: `scale(${sp(f - (d - 22), 8, 220)})`,
            boxShadow: '0 0 40px rgba(47,191,113,0.7)',
          }}
        >
          ✓
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 15. SELF (this very video) ---------------- */
const THUMBS: Record<string, string> = {
  hook: '#000', code: '#1b1410', rewind: '#2a2010', rods: '#3a2a12', gears: '#4a3214', binary: '#ece3d3', chip: '#7b7ad8',
  moon: '#e0794d', dark: '#000', flash: '#fff', brand: C.coral, web: '#f5efe6', bug: '#3a1416', report: '#1a2448',
  self: C.gold, stats: '#22180e', answer: '#000', cta: C.coral,
};

export const Self: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const total = timeline.totalFrames;
  const width = 940;
  const head = interpolate(f, [6, d - 10], [0.02, 0.97], clamp);
  const enter = sp(f, 14, 140);
  const ring = 0.5 + 0.5 * Math.sin(f / 4);
  const showYou = f > d * 0.45;
  return (
    <AbsoluteFill>
      <Space tint={C.gold} glow={0.14} stars={30} />
      <Tag top={210}>能力 04 · 自己做视频</Tag>
      {/* the "preview monitor" shows a mini replay of this video's hook */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 190,
          top: 320,
          width: 380,
          height: 600,
          borderRadius: 28,
          background: '#000',
          border: `3px solid ${showYou ? C.coral : 'rgba(255,255,255,0.2)'}`,
          boxShadow: showYou ? `0 0 ${40 + 40 * ring}px ${hexA(C.coral, 0.7)}` : 'none',
          transform: `scale(${enter})`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          overflow: 'hidden',
        }}
      >
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 44, color: C.ink}}>这条视频</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 32, color: C.dim}}>没有一个</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 50, color: C.coral}}>人类剪辑师</div>
        {showYou && (
          <div style={{position: 'absolute', bottom: 24, padding: '8px 18px', borderRadius: 30, background: C.coral, fontFamily: SANS, fontWeight: 900, fontSize: 26, color: '#fff', transform: `scale(${sp(f - d * 0.45, 8, 200)})`}}>
            ● 你正在看的这条
          </div>
        )}
      </div>
      {/* timeline tracks */}
      <div style={{position: 'absolute', left: 70, top: 960, width, transform: `translateY(${(1 - enter) * 200}px)`, opacity: enter}}>
        {['画面', '配音', '配乐'].map((label, row) => (
          <div key={label} style={{display: 'flex', alignItems: 'center', height: 74, marginBottom: 12}}>
            <div style={{width: 90, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: C.dim}}>{label}</div>
            <div style={{position: 'relative', flex: 1, height: 64, borderRadius: 10, background: 'rgba(255,255,255,0.05)', overflow: 'hidden'}}>
              {row === 0 &&
                timeline.scenes.map((s) => (
                  <div key={s.id} style={{position: 'absolute', top: 4, bottom: 4, left: `${(s.from / total) * 100}%`, width: `calc(${(s.frames / total) * 100}% - 3px)`, borderRadius: 6, background: THUMBS[s.id] ?? '#333', border: '1px solid rgba(255,255,255,0.25)'}} />
                ))}
              {row === 1 &&
                timeline.scenes.map((s) => (
                  <svg key={s.id} style={{position: 'absolute', top: 6, height: 52, left: `${((s.from + s.voiceFrom) / total) * 100}%`, width: `${(s.voiceFrames / total) * 100}%`}} viewBox="0 0 100 52" preserveAspectRatio="none">
                    {Array.from({length: 24}).map((_, k) => {
                      const h = 8 + random(`wv${s.id}${k}`) * 40;
                      return <rect key={k} x={k * 4.2} y={26 - h / 2} width={2.6} height={h} fill={C.coral} />;
                    })}
                  </svg>
                ))}
              {row === 2 && <div style={{position: 'absolute', inset: '14px 0', background: `repeating-linear-gradient(90deg, ${hexA(C.gold, 0.7)} 0 3px, transparent 3px 9px)`, borderRadius: 6}} />}
            </div>
          </div>
        ))}
        <div style={{position: 'absolute', top: -12, bottom: -12, left: 90 + (width - 90) * head, width: 4, background: C.ink, boxShadow: `0 0 16px ${C.ink}`}}>
          <div style={{position: 'absolute', top: -18, left: -12, width: 28, height: 22, background: C.ink, clipPath: 'polygon(0 0, 100% 0, 50% 100%)'}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 16. STATS ---------------- */
export const Stats: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const cards = [
    {n: stats.lines.toLocaleString('en-US'), u: '行代码', c: C.gold},
    {n: '1', u: '次渲染', c: C.ink},
    {n: '0', u: '个剪辑师', c: C.coral},
  ];
  const hits = [6, 30, 54];
  return (
    <AbsoluteFill>
      <Space tint={C.gold} glow={0.18} stars={40} />
      <Tag top={230}>这条视频的真实数据</Tag>
      <Shake at={hits} amp={16} len={8}>
        <div style={{position: 'absolute', top: 360, left: 90, right: 90, display: 'flex', flexDirection: 'column', gap: 34}}>
          {cards.map((c, i) => {
            const p = sp(f - hits[i], 11, 220);
            return (
              <div
                key={i}
                style={{
                  height: 210,
                  borderRadius: 28,
                  background: 'linear-gradient(120deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                  border: `2px solid ${hexA(c.c, 0.6)}`,
                  boxShadow: `0 0 50px ${hexA(c.c, 0.2)}`,
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  gap: 24,
                  paddingTop: 40,
                  transform: `scale(${2.2 - 1.2 * p})`,
                  opacity: Math.min(1, p * 1.5),
                }}
              >
                <span style={{fontFamily: LATIN, fontWeight: 600, fontSize: 150, lineHeight: 1, color: c.c, textShadow: `0 0 40px ${hexA(c.c, 0.5)}`}}>{c.n}</span>
                <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 60, color: C.ink}}>{c.u}</span>
              </div>
            );
          })}
        </div>
      </Shake>
    </AbsoluteFill>
  );
};

/* ---------------- 17. ANSWER ---------------- */
export const Answer: React.FC<SceneProps> = ({d, vs, vf}) => {
  const f = useCurrentFrame();
  const l1 = sp(f - 2, 14, 120);
  const turn = vs + vf * 0.45;
  const l2 = sp(f - turn, 10, 160);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${hexA(C.coral, 0.25 * l2)}, transparent 55%)`}} />
      <div style={{position: 'absolute', top: 430, width: '100%', textAlign: 'center', fontFamily: SERIF, fontWeight: 900}}>
        <div style={{fontSize: 96, color: C.dim, opacity: l1, transform: `translateY(${(1 - l1) * 40}px)`}}>这一次</div>
        <div style={{fontSize: 130, color: C.ink, marginTop: 40, opacity: l1}}>工具开始</div>
        <div style={{fontSize: 210, color: C.coral, marginTop: 20, transform: `scale(${0.6 + 0.4 * l2})`, opacity: l2, textShadow: `0 0 60px ${hexA(C.coral, 0.7)}`}}>
          回答你
          <span style={{color: C.ink, opacity: f % 20 < 10 ? 1 : 0}}>_</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 18. CTA ---------------- */
const IDEAS = ['让它写个小游戏', '让它做一首MV', '让它帮我做PPT', '让它教我编程', '让它剪我的vlog', '让它做个网站', '让它写小说'];

export const Cta: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const head = sp(f - 2, 12, 140);
  const btn = sp(f - 45, 8, 200);
  const pulse = 1 + 0.06 * Math.sin(f / 4);
  return (
    <AbsoluteFill>
      <Space tint={C.coral} glow={0.25} stars={60} />
      {IDEAS.map((t, i) => {
        const t0 = 6 + i * 16;
        const age = f - t0;
        if (age < 0) return null;
        const x = i % 2 ? 560 + random(`cx${i}`) * 60 : 70 + random(`cx${i}`) * 60;
        const y = 1150 - age * 3;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              padding: '16px 28px',
              borderRadius: 40,
              background: 'rgba(255,255,255,0.12)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 34,
              color: C.ink,
              opacity: interpolate(age, [0, 8, 130, 170], [0, 1, 1, 0], clamp) * 0.9,
              transform: `scale(${sp(age, 10, 200)})`,
              whiteSpace: 'nowrap',
            }}
          >
            {t}
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 260, width: '100%', textAlign: 'center', transform: `scale(${head})`}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 110, color: C.ink, lineHeight: 1.2}}>你想让它</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 130, color: C.coral, lineHeight: 1.2, textShadow: `0 0 50px ${hexA(C.coral, 0.7)}`}}>做什么？</div>
      </div>
      <div style={{position: 'absolute', top: 1450, width: '100%', display: 'flex', justifyContent: 'center', gap: 30, transform: `scale(${btn})`}}>
        <div style={{padding: '24px 54px', borderRadius: 60, background: C.coral, fontFamily: SANS, fontWeight: 900, fontSize: 48, color: '#fff', transform: `scale(${pulse})`, boxShadow: `0 0 50px ${hexA(C.coral, 0.8)}`}}>
          + 关注
        </div>
        <div style={{padding: '24px 44px', borderRadius: 60, border: `3px solid ${C.ink}`, fontFamily: SANS, fontWeight: 900, fontSize: 48, color: C.ink}}>
          评论区见 ↓
        </div>
      </div>
    </AbsoluteFill>
  );
};
