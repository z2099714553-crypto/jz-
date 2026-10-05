import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame} from 'remotion';
import stats from './stats.json';
import {C, LATIN, MONO, SANS, SERIF, Shake, Space, Tag, clamp, ease, easeIO, hexA} from './ui';

export type SceneProps = {d: number; vs: number; vf: number};

/* ---------------- 1. HOOK ---------------- */
const Slam: React.FC<{text: string; at: number; size: number; color: string; step?: number; glitch?: boolean}> = ({
  text,
  at,
  size,
  color,
  step = 3,
  glitch,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 1.1}}>
      {Array.from(text).map((ch, i) => {
        const t = at + i * step;
        const p = interpolate(f, [t, t + 5], [0, 1], clamp);
        const g = glitch && f > t + 6 && random(`g${Math.floor(f / 2)}-${i}`) > 0.82;
        const off = g ? (random(`o${f}-${i}`) - 0.5) * 30 : 0;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              color,
              opacity: p > 0 ? 1 : 0,
              transform: `scale(${3 - 2 * ease(p)}) translateX(${off}px)`,
              filter: `blur(${(1 - p) * 14}px)`,
              textShadow: glitch
                ? `${4 + Math.abs(off) / 3}px 0 0 rgba(0,255,255,0.7), ${-4 - Math.abs(off) / 3}px 0 0 rgba(255,0,80,0.7), 0 0 40px ${hexA(color, 0.6)}`
                : `0 0 40px ${hexA(color, 0.35)}`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

export const Hook: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const slams = [0, 3, 6, 9, 30, 33, 36, 39, 48, 51, 54, 57, 60];
  const strike = interpolate(f, [70, 80], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 6px)',
        }}
      />
      <AbsoluteFill
        style={{background: `radial-gradient(circle at 50% 45%, ${hexA(C.coral, 0.25 * interpolate(f, [45, 70], [0, 1], clamp))}, transparent 60%)`}}
      />
      <Shake at={slams} amp={14} len={6}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 36, marginTop: -180}}>
          <Slam text="这条视频" at={0} size={170} color={C.ink} />
          <Slam text="没有一个" at={30} size={120} color={C.dim} />
          <div style={{position: 'relative'}}>
            <Slam text="人类剪辑师" at={46} size={186} color={C.coral} glitch />
            <div
              style={{
                position: 'absolute',
                left: -20,
                top: '52%',
                height: 16,
                width: `${strike * 104}%`,
                background: C.ink,
                boxShadow: `0 0 20px ${C.ink}`,
                transform: 'rotate(-4deg)',
                opacity: 0.9,
              }}
            />
          </div>
        </AbsoluteFill>
      </Shake>
      <div
        style={{
          position: 'absolute',
          bottom: 560,
          width: '100%',
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 30,
          color: C.gold,
          letterSpacing: 4,
          opacity: interpolate(f, [72, 82], [0, 1], clamp) * (Math.floor(f / 8) % 2 ? 1 : 0.6),
        }}
      >
        {'> rendered_by: claude-opus-5.5'}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 2. CODE RAIN ---------------- */
export const Code: React.FC<SceneProps> = ({d, vs, vf}) => {
  const f = useCurrentFrame();
  const snippets = stats.snippets.length ? stats.snippets : ['const frame = useCurrentFrame();'];
  const cols = 3;
  const collapse = ease(interpolate(f, [d - 22, d - 4], [0, 1], clamp));
  const chips = ['台词', '画面', '配乐', '每一帧'];
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          perspective: 1200,
          transform: `scale(${1 - collapse * 0.95})`,
          opacity: 1 - collapse,
          filter: `blur(${collapse * 6}px)`,
        }}
      >
        <AbsoluteFill style={{transform: 'rotateX(28deg) translateY(-80px)', transformOrigin: '50% 100%'}}>
          {Array.from({length: cols}).map((_, c) => {
            const speed = 9 + c * 4;
            const y = -((f * speed) % 52) ;
            const base = Math.floor((f * speed) / 52);
            return (
              <div key={c} style={{position: 'absolute', left: 40 + c * 340, top: 0, width: 330, transform: `translateY(${y}px)`}}>
                {Array.from({length: 40}).map((__, r) => {
                  const s = snippets[(base + r + c * 37) % snippets.length];
                  const hot = random(`h${c}-${base + r}`) > 0.86;
                  return (
                    <div
                      key={r}
                      style={{
                        height: 52,
                        fontFamily: MONO,
                        fontSize: 22,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        color: hot ? C.coralHi : r % 4 === 0 ? C.gold : 'rgba(246,239,227,0.5)',
                        textShadow: hot ? `0 0 14px ${C.coral}` : 'none',
                      }}
                    >
                      {s}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </AbsoluteFill>
        <AbsoluteFill style={{background: `linear-gradient(${C.bg} 6%, transparent 30%, transparent 70%, ${C.bg} 96%)`}} />
      </AbsoluteFill>

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', width: 900, marginTop: -250, opacity: 1 - collapse}}>
          {chips.map((c, i) => {
            const t = vs + i * vf * 0.14;
            const p = spring({frame: f - t, fps: 30, config: {damping: 12, stiffness: 180}});
            return (
              <div
                key={c}
                style={{
                  transform: `scale(${p})`,
                  padding: '18px 34px',
                  borderRadius: 18,
                  background: 'rgba(10,8,12,0.85)',
                  border: `2px solid ${C.coral}`,
                  boxShadow: `0 0 30px ${hexA(C.coral, 0.5)}`,
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 54,
                  color: C.ink,
                }}
              >
                <span style={{color: C.coral}}>✓ </span>
                {c}
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 960 - 40,
            width: 80 * collapse + 10,
            height: 80 * collapse + 10,
            borderRadius: 100,
            background: C.coral,
            opacity: collapse,
            boxShadow: `0 0 ${120 * collapse}px ${40 * collapse}px ${hexA(C.coral, 0.6)}`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- 3. REWIND ---------------- */
export const Rewind: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const p = easeIO(interpolate(f, [4, d - 12], [0, 1], clamp));
  const year = Math.round(2026 - p * 2226);
  const speed = Math.abs(easeIO(interpolate(f + 1, [4, d - 12], [0, 1], clamp)) - p) * 2226;
  const bc = year < 0;
  return (
    <AbsoluteFill>
      <Space tint={C.gold} glow={0.12} stars={50} />
      {Array.from({length: 26}).map((_, i) => {
        const y = random(`ly${i}`) * 1920;
        const x = ((random(`lx${i}`) * 1600 + f * (30 + random(`lv${i}`) * 50)) % 1600) - 300;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: y,
              left: x,
              width: 120 + speed * 3,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${hexA(C.gold, 0.7)})`,
              opacity: Math.min(1, speed / 25),
            }}
          />
        );
      })}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', marginTop: -240}}>
        <svg width={820} height={820} viewBox="-410 -410 820 820" style={{position: 'absolute'}}>
          <g transform={`rotate(${-p * 1440})`}>
            {Array.from({length: 120}).map((_, i) => (
              <line
                key={i}
                x1={0}
                y1={-380}
                x2={0}
                y2={i % 10 === 0 ? -340 : -362}
                stroke={i % 10 === 0 ? C.gold : hexA(C.gold, 0.4)}
                strokeWidth={i % 10 === 0 ? 4 : 2}
                transform={`rotate(${i * 3})`}
              />
            ))}
          </g>
          <circle r={300} fill="none" stroke={hexA(C.coral, 0.4)} strokeWidth={2} strokeDasharray="4 12" />
          <line x1={0} y1={0} x2={0} y2={-280} stroke={C.coral} strokeWidth={6} strokeLinecap="round" transform={`rotate(${-p * 4320})`} />
          <circle r={12} fill={C.coral} />
        </svg>
        <div style={{position: 'absolute', top: 960 - 240 - 250, fontFamily: SERIF, fontWeight: 900, fontSize: 52, color: C.dim, letterSpacing: 12}}>
          {bc ? '公元前' : '公元'}
        </div>
        <div
          style={{
            fontFamily: LATIN,
            fontWeight: 600,
            fontSize: 260,
            color: bc ? C.gold : C.ink,
            fontVariantNumeric: 'tabular-nums',
            filter: `blur(${Math.min(speed / 12, 6)}px)`,
            textShadow: `0 0 50px ${hexA(C.gold, 0.5)}`,
          }}
        >
          {Math.abs(year)}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- 4. COUNTING RODS ---------------- */
const Rod: React.FC<{x: number; y: number; w: number; h: number; delay: number; rot?: number}> = ({x, y, w, h, delay}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - delay, fps: 30, config: {damping: 14, stiffness: 120}});
  const r0 = (random(`r${x}-${y}-${delay}`) - 0.5) * 160;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y - (1 - p) * 900,
        width: w,
        height: h,
        borderRadius: 6,
        background: `linear-gradient(90deg, ${C.gold2}, ${C.gold} 45%, #fff3d6 55%, ${C.gold2})`,
        boxShadow: `0 0 18px ${hexA(C.gold, 0.6)}`,
        transform: `rotate(${(1 - p) * r0}deg)`,
        opacity: p > 0.01 ? 1 : 0,
      }}
    />
  );
};

function rodDigit(n: number, vertical: boolean, cx: number, cy: number, delay: number) {
  const out: React.ReactNode[] = [];
  const L = 84;
  const T = 11;
  const ones = n > 5 ? n - 5 : n;
  const five = n > 5;
  for (let k = 0; k < ones; k++) {
    const off = (k - (ones - 1) / 2) * 20;
    if (vertical) out.push(<Rod key={`${cx}-${k}`} x={cx + off - T / 2} y={cy - L / 2 + (five ? 14 : 0)} w={T} h={five ? L - 28 : L} delay={delay + k * 2} />);
    else out.push(<Rod key={`${cx}-${k}`} x={cx - L / 2 + 6} y={cy + off - T / 2 + (five ? 12 : 0)} w={L - 12} h={T} delay={delay + k * 2} />);
  }
  if (five) {
    if (vertical) out.push(<Rod key={`${cx}-5`} x={cx - 42} y={cy - L / 2 - 4} w={84} h={T} delay={delay + 8} />);
    else out.push(<Rod key={`${cx}-5`} x={cx - T / 2} y={cy - L / 2 - 26} w={T} h={42} delay={delay + 8} />);
  }
  return out;
}

export const Rods: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const digits = [3, 1, 4, 1, 5, 9, 2, 6];
  // Zu Chongzhi pushed the inscribed polygon to 24576 sides to reach 3.1415926.
  const k = interpolate(f, [0, d * 0.75], [0, 12], clamp);
  const sides = Math.round(6 * Math.pow(2, k));
  const pi = Math.floor(sides * Math.sin(Math.PI / sides) * 1e7) / 1e7;
  const R = 230;
  const drawn = Math.min(sides, 360);
  const pts = Array.from({length: drawn}, (_, i) => {
    const a = (i / drawn) * Math.PI * 2 - Math.PI / 2;
    return `${Math.cos(a) * R},${Math.sin(a) * R}`;
  }).join(' ');
  return (
    <AbsoluteFill>
      <Space tint={C.gold} glow={0.16} stars={40} />
      <Tag>公元前 · 算筹</Tag>
      <svg width={1080} height={700} viewBox="-540 -350 1080 700" style={{position: 'absolute', top: 300}}>
        <circle r={R} fill="none" stroke={hexA(C.ink, 0.25)} strokeWidth={3} />
        <polygon points={pts} fill={hexA(C.coral, 0.12)} stroke={C.coral} strokeWidth={3} />
        <text y={20} textAnchor="middle" fill={C.ink} style={{fontFamily: LATIN, fontWeight: 600, fontSize: 120}}>
          π
        </text>
        <text y={105} textAnchor="middle" fill={C.gold} style={{fontFamily: MONO, fontSize: 30}}>
          {`${sides} 边形`}
        </text>
      </svg>
      {digits.map((n, i) => rodDigit(n, i % 2 === 0, 540 + (i - 3.5) * 118, 1010, 6 + i * 4))}
      <div
        style={{
          position: 'absolute',
          top: 1088,
          width: '100%',
          textAlign: 'center',
          fontFamily: LATIN,
          fontWeight: 600,
          fontSize: 86,
          color: C.gold,
          letterSpacing: 10,
          textShadow: `0 0 30px ${hexA(C.gold, 0.6)}`,
        }}
      >
        {pi.toFixed(7)}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 5. GEARS ---------------- */
function gearPath(teeth: number, r: number, depth: number) {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const rr = i % 4 === 1 || i % 4 === 2 ? r : r - depth;
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}

const Gear: React.FC<{x: number; y: number; teeth: number; r: number; speed: number; phase?: number; id: string}> = ({
  x,
  y,
  teeth,
  r,
  speed,
  phase = 0,
  id,
}) => {
  const f = useCurrentFrame();
  return (
    <svg width={r * 2 + 40} height={r * 2 + 40} viewBox={`${-r - 20} ${-r - 20} ${r * 2 + 40} ${r * 2 + 40}`} style={{position: 'absolute', left: x - r - 20, top: y - r - 20, overflow: 'visible'}}>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#fff1cc" />
          <stop offset="45%" stopColor={C.gold} />
          <stop offset="100%" stopColor="#6b4a1c" />
        </radialGradient>
      </defs>
      <g transform={`rotate(${phase + f * speed})`} style={{filter: `drop-shadow(0 0 30px ${hexA(C.gold, 0.35)})`}}>
        <path d={gearPath(teeth, r, r * 0.12)} fill={`url(#${id})`} />
        <circle r={r * 0.72} fill="none" stroke="#5a3d15" strokeWidth={6} opacity={0.6} />
        {Array.from({length: 6}).map((_, i) => (
          <rect key={i} x={-r * 0.06} y={-r * 0.7} width={r * 0.12} height={r * 0.5} fill="#7a5520" opacity={0.7} transform={`rotate(${i * 60})`} />
        ))}
        <circle r={r * 0.2} fill="#3a280d" />
        <circle r={r * 0.08} fill={C.coral} />
      </g>
    </svg>
  );
};

export const Gears: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, d], [1.15, 1], clamp);
  const counter = String(Math.floor(interpolate(f, [0, d], [186, 314], clamp))).padStart(3, '0');
  return (
    <AbsoluteFill>
      <Space tint={C.gold} glow={0.2} stars={30} />
      <Tag>17 世纪 · 机械计算器</Tag>
      <AbsoluteFill style={{transform: `scale(${z})`}}>
        <Gear id="g1" x={420} y={640} teeth={24} r={250} speed={2} />
        <Gear id="g2" x={420 + 250 + 150 - 22} y={640 - 175} teeth={14} r={150} speed={-2 * (24 / 14)} phase={8} />
        <Gear id="g3" x={420 + 175} y={640 + 250 + 70} teeth={8} r={95} speed={-2 * 3} phase={4} />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 1050, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14}}>
        {Array.from(counter).map((ch, i) => (
          <div
            key={i}
            style={{
              width: 92,
              height: 120,
              borderRadius: 12,
              background: 'linear-gradient(#f4ecdc, #c9bca2 50%, #f4ecdc)',
              border: `4px solid ${C.gold2}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: LATIN,
              fontWeight: 600,
              fontSize: 96,
              color: '#2a1d0b',
            }}
          >
            {ch}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 6. BINARY ---------------- */
export const Binary: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const rows = 7;
  return (
    <AbsoluteFill>
      <Space tint={C.coral} glow={0.1} stars={20} />
      <Tag>20 世纪 · 二进制</Tag>
      <AbsoluteFill style={{perspective: 900}}>
        <AbsoluteFill style={{transform: 'rotateY(-24deg) rotateZ(-8deg)', transformOrigin: '30% 50%'}}>
          {Array.from({length: rows}).map((_, r) => {
            const speed = 18 + r * 7;
            const dir = r % 2 ? 1 : -1;
            const off = ((f * speed * dir) % 120) - 120;
            const base = Math.floor((f * speed) / 120);
            return (
              <div key={r} style={{position: 'absolute', top: 380 + r * 108, left: -200, display: 'flex', transform: `translateX(${off}px)`}}>
                {Array.from({length: 14}).map((__, k) => {
                  const bit = random(`b${r}-${k + base * dir}`) > 0.5 ? 1 : 0;
                  const hot = random(`bh${r}-${k + base * dir}`) > 0.9;
                  return (
                    <div
                      key={k}
                      style={{
                        width: 112,
                        height: 92,
                        marginRight: 8,
                        background: hot ? hexA(C.coral, 0.9) : '#f1e9da',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: LATIN,
                        fontWeight: 600,
                        fontSize: 70,
                        color: hot ? '#fff' : '#2a1d0b',
                        boxShadow: hot ? `0 0 30px ${C.coral}` : 'none',
                        opacity: 0.35 + 0.65 * (1 - Math.abs(r - 3) / 4),
                      }}
                    >
                      {bit}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(90deg, ${C.bg}, transparent 18%, transparent 82%, ${C.bg})`}} />
    </AbsoluteFill>
  );
};

/* ---------------- 7. CHIP ---------------- */
export const Chip: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const zoom = Math.pow(interpolate(f, [0, d], [0, 1], clamp), 1.6);
  const s = 1 + zoom * 5;
  const R = 330;
  const cell = 46;
  const n = Math.ceil((R * 2) / cell);
  return (
    <AbsoluteFill>
      <Space tint="#7a8cff" glow={0.12} stars={30} />
      <Tag>一整个房间 → 一粒米</Tag>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', marginTop: -240}}>
        <svg width={1080} height={1080} viewBox="-540 -540 1080 1080" style={{transform: `scale(${s}) rotate(${f * 0.4 - zoom * 20}deg)`}}>
          <defs>
            <linearGradient id="wafer" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6fd6ff" />
              <stop offset="0.35" stopColor="#a58cff" />
              <stop offset="0.6" stopColor="#ffb38a" />
              <stop offset="1" stopColor="#7af0c8" />
            </linearGradient>
            <clipPath id="wclip">
              <circle r={R} />
            </clipPath>
          </defs>
          <circle r={R + 8} fill="#22222c" />
          <g clipPath="url(#wclip)">
            <rect x={-R} y={-R} width={R * 2} height={R * 2} fill="url(#wafer)" opacity={0.85} />
            {Array.from({length: n * n}).map((_, i) => {
              const cx = -R + (i % n) * cell;
              const cy = -R + Math.floor(i / n) * cell;
              const center = Math.abs(cx + cell / 2) < cell / 2 && Math.abs(cy + cell / 2) < cell / 2;
              return (
                <rect
                  key={i}
                  x={cx + 2}
                  y={cy + 2}
                  width={cell - 4}
                  height={cell - 4}
                  fill={center ? C.coral : '#0d0d14'}
                  opacity={center ? 1 : 0.35 + 0.2 * random(`w${i}`)}
                />
              );
            })}
          </g>
          {/* circuit inside centre die */}
          <g transform={`translate(${-cell / 2 + 2} ${-cell / 2 + 2})`} opacity={interpolate(zoom, [0.3, 0.7], [0, 1], clamp)}>
            {Array.from({length: 7}).map((_, i) => (
              <path
                key={i}
                d={`M ${4 + i * 5.5} 2 V ${10 + (i % 3) * 6} H ${8 + ((i * 13) % 26)} V ${cell - 6}`}
                stroke="#fff4e6"
                strokeWidth={0.8}
                fill="none"
                strokeDasharray="60"
                strokeDashoffset={60 - ((f * 2 + i * 9) % 60)}
              />
            ))}
          </g>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 38%, ${hexA('#fff', 0.5 * zoom * zoom)}, transparent 40%)`}} />
    </AbsoluteFill>
  );
};

/* ---------------- 8. MOON ---------------- */
export const Moon: React.FC<SceneProps> = ({d}) => {
  const f = useCurrentFrame();
  const lift = Math.pow(interpolate(f, [6, d], [0, 1], clamp), 1.7);
  const y = 1500 - lift * 1500;
  const flick = 0.85 + 0.15 * Math.sin(f * 2.3) + 0.1 * random(`fl${f}`);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#030512 0%, #0b1440 45%, #5a3a6b 72%, #e0794d 92%, #ffb36b 100%)'}}>
      <Shake at={[6, 10, 14, 18, 22, 26, 30]} amp={6} len={4}>
        <Tag top={240}>1969 · 登月</Tag>
        <div
          style={{
            position: 'absolute',
            right: 120,
            top: 360,
            width: 220,
            height: 220,
            borderRadius: 220,
            background: 'radial-gradient(circle at 35% 35%, #fffaf0, #d9d2c4 60%, #9c958a)',
            boxShadow: '0 0 120px rgba(255,250,235,0.5)',
          }}
        />
        {Array.from({length: 26}).map((_, i) => {
          const age = (f + i * 3) % 40;
          const sx = 540 + (random(`smx${i}`) - 0.5) * (40 + age * 10);
          const sy = y + 470 + age * 6;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: sx - 60,
                top: sy,
                width: 120 + age * 4,
                height: 120 + age * 4,
                borderRadius: 400,
                background: 'radial-gradient(circle, rgba(255,230,200,0.5), transparent 70%)',
                opacity: (1 - age / 40) * Math.min(1, f / 10),
              }}
            />
          );
        })}
        <svg width={200} height={700} viewBox="-100 0 200 700" style={{position: 'absolute', left: 440, top: y}}>
          <defs>
            <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.3" stopColor="#ffd27a" />
              <stop offset="1" stopColor={C.coral} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`M -26 470 Q 0 ${470 + 230 * flick} 26 470 Z`} fill="url(#flame)" />
          <path d="M 0 0 L 16 60 L 16 140 L -16 140 L -16 60 Z" fill="#f1ede6" />
          <rect x={-22} y={140} width={44} height={150} fill="#f6f3ee" />
          <rect x={-22} y={210} width={44} height={14} fill="#222" />
          <rect x={-30} y={290} width={60} height={170} fill="#f6f3ee" />
          <rect x={-30} y={330} width={60} height={20} fill="#222" />
          <path d="M -30 420 L -52 470 L -30 460 Z M 30 420 L 52 470 L 30 460 Z" fill="#cfc9be" />
          <rect x={-24} y={460} width={48} height={12} fill="#555" />
        </svg>
      </Shake>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% ${(y + 600) / 19.2}%, rgba(255,200,140,${0.35 * flick}), transparent 35%)`}} />
      <AbsoluteFill style={{background: 'rgba(0,0,0,0.25)'}} />
    </AbsoluteFill>
  );
};
