import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop, Candle, LightPoint, Rod, Scrim, clamp, makeStars } from "../common";
import { END_CARD } from "../script";
import { C, FONT_EN, FONT_ZH } from "../theme";
import { useTick } from "../time";

const W = 1920;
const H = 1080;

// ── 11 骤然全黑 ────────────────────────────────────────────
export const S11Black: React.FC = () => <AbsoluteFill style={{ background: "#000" }} />;

// ── 12 星点汇聚成一个光点 ──────────────────────────────────
export const S12Converge: React.FC = () => {
  const f = useTick();
  const cx = 960;
  const cy = 400;
  const stars = makeStars(340, "converge");
  const bloom = interpolate(f, [98, 122], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  let arrived = 0;
  const dots = stars.map((s, i) => {
    const delay = random(`cd${i}`) * 34;
    const dur = 50 + random(`cu${i}`) * 26;
    const p = interpolate(f, [delay, delay + dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    arrived += p;
    const sx = s.x * W;
    const sy = s.y * H;
    const ang = Math.atan2(sy - cy, sx - cx) + (1 - p) * 0.0 + p * 0.9;
    const dist = Math.hypot(sx - cx, sy - cy) * (1 - p);
    return {
      x: cx + Math.cos(ang) * dist,
      y: cy + Math.sin(ang) * dist,
      r: s.r * (1 - 0.6 * p),
      o: s.b * interpolate(f, [0, 12], [0, 1], clamp) * (1 - p * p),
    };
  });
  const gather = arrived / stars.length;
  return (
    <AbsoluteFill>
      <Backdrop kind="night" />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#FFF3E0" opacity={d.o} />
        ))}
        <LightPoint x={cx} y={cy} size={0.4 + gather * 0.9} intensity={Math.min(1, gather * 1.3)} />
        <defs>
          <radialGradient id="bloomSoft">
            <stop offset="0" stopColor="#F4EEE2" />
            <stop offset="0.72" stopColor={C.paper} />
            <stop offset="1" stopColor={C.paper} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={bloom * 1900} fill="url(#bloomSoft)" opacity={bloom > 0 ? 1 : 0} />
      </svg>
      <Scrim tone="dark" strength={1 - bloom} />
    </AbsoluteFill>
  );
};

// ── 13 米白底，一行字 ──────────────────────────────────────
export const S13Understand: React.FC = () => <Backdrop kind="paper" />;

// ── 14 光点停住，稳定下来 ─────────────────────────────────
export const S14Point: React.FC = () => {
  const f = useTick();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - (4 * fps) / 30, fps, config: { damping: 9, stiffness: 60, mass: 1 } });
  const x = interpolate(s, [0, 1], [1260, 960]);
  const y = interpolate(s, [0, 1], [300, 420]);
  const appear = interpolate(f, [0, 16], [0, 1], clamp);
  const breathe = 0.85 + 0.15 * Math.sin(f * 0.09);
  return (
    <AbsoluteFill>
      <Backdrop kind="paper" />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <LightPoint x={x} y={y} size={1.3} intensity={appear * breathe} onPaper />
      </svg>
    </AbsoluteFill>
  );
};

// ── 15 一篇报告、一段代码、一张草稿 ───────────────────────
const Card: React.FC<{ from: number; to: number; children: React.ReactNode; bg: string; shadow?: string }> = ({
  from,
  to,
  children,
  bg,
  shadow = "0 24px 50px rgba(80,60,40,0.28)",
}) => {
  const f = useTick();
  const o = interpolate(f, [from, from + 12, to - 10, to], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const y = interpolate(f, [from, from + 18], [26, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const sc = interpolate(f, [from, to], [0.985, 1.02]);
  return (
    <div
      style={{
        position: "absolute",
        left: 960 - 390,
        top: 400 - 240 + y,
        width: 780,
        height: 480,
        background: bg,
        borderRadius: 10,
        boxShadow: shadow,
        opacity: o,
        transform: `scale(${sc})`,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
};

const Report: React.FC<{ t: number }> = ({ t }) => {
  const hl = interpolate(t, [22, 52], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <svg width={780} height={480}>
      <text x={56} y={78} fontFamily={FONT_ZH} fontSize={28} fill={C.ink} letterSpacing="0.2em">
        报告
      </text>
      <rect x={56} y={96} width={200} height={2} fill={C.cinnabar} />
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={56} y={136 + i * 30} width={i === 6 ? 220 : 380 - random(`rp${i}`) * 60} height={7} rx={3} fill="#CFC6B8" />
      ))}
      <rect x={56} y={218} width={330 * hl} height={14} rx={3} fill={C.cinnabarSoft} opacity={0.35} />
      {[0.45, 0.7, 0.55, 0.9, 0.78].map((v, i) => (
        <rect key={i} x={500 + i * 44} y={360 - 190 * v} width={28} height={190 * v} fill={i === 3 ? C.cinnabarSoft : "#B9AE9C"} />
      ))}
      <rect x={490} y={362} width={240} height={2} fill={C.inkSoft} opacity={0.5} />
      {Array.from({ length: 3 }).map((_, i) => (
        <rect key={i} x={56} y={392 + i * 26} width={640 - i * 90} height={7} rx={3} fill="#DDD5C8" />
      ))}
      <circle cx={56 + 330 * hl} cy={225} r={7} fill={C.cinnabar} opacity={hl > 0 && hl < 1 ? 1 : 0.4} />
    </svg>
  );
};

const Code: React.FC<{ t: number }> = ({ t }) => {
  const strike = interpolate(t, [18, 30], [0, 1], clamp);
  const fix = interpolate(t, [32, 44], [0, 1], clamp);
  const cursorOn = Math.floor(t / 8) % 2 === 0;
  const lines = [
    [["#C9A36A", 70], ["#9CB6C9", 150], ["#DDD5C8", 90]],
    [["#DDD5C8", 40], ["#9CB6C9", 120], ["#C98E78", 60]],
    [["#DDD5C8", 60], ["#B7C79B", 180]],
    [["#C9A36A", 90], ["#DDD5C8", 140], ["#9CB6C9", 70]],
    [["#DDD5C8", 50], ["#C98E78", 160], ["#DDD5C8", 60]],
    [["#DDD5C8", 60], ["#9CB6C9", 90]],
    [["#C9A36A", 50], ["#DDD5C8", 110]],
  ] as const;
  const bugLine = 3;
  return (
    <svg width={780} height={480}>
      <rect width={780} height={40} fill="#2A2724" />
      {["#D8795C", "#C9A36A", "#8FA879"].map((c, i) => (
        <circle key={c} cx={26 + i * 22} cy={20} r={6} fill={c} opacity={0.8} />
      ))}
      {lines.map((segs, li) => {
        const y = 80 + li * 44 + (li > bugLine ? 44 * fix : 0);
        let x = 90 + (li === 2 || li === 4 ? 40 : 0);
        return (
          <g key={li}>
            <text x={40} y={y + 8} fontFamily={FONT_EN} fontSize={18} fill="#6F675E">
              {li + 1 + (li > bugLine && fix > 0.5 ? 1 : 0)}
            </text>
            {li === bugLine ? (
              <rect x={70} y={y - 16} width={680} height={32} fill="#8F3B2A" opacity={0.25 * strike} />
            ) : null}
            {segs.map(([c, w], si) => {
              const r = <rect key={si} x={x} y={y - 4} width={w} height={9} rx={3} fill={c} opacity={li === bugLine ? 1 - 0.5 * strike : 1} />;
              x += w + 14;
              return r;
            })}
            {li === bugLine ? <rect x={90} y={y} width={330 * strike} height={2} fill="#E08B73" /> : null}
          </g>
        );
      })}
      <g opacity={fix}>
        <rect x={70} y={80 + (bugLine + 1) * 44 - 16} width={680} height={32} fill="#5E7A4E" opacity={0.28} />
        <rect x={90} y={80 + (bugLine + 1) * 44 - 4} width={100} height={9} rx={3} fill="#C9A36A" />
        <rect x={204} y={80 + (bugLine + 1) * 44 - 4} width={150} height={9} rx={3} fill="#B7C79B" />
        <rect x={368} y={80 + (bugLine + 1) * 44 - 4} width={60} height={9} rx={3} fill="#9CB6C9" />
        <rect x={436} y={80 + (bugLine + 1) * 44 - 12} width={3} height={24} fill="#F0E6D4" opacity={cursorOn ? 1 : 0} />
      </g>
      <circle cx={740} cy={80 + (bugLine + 1) * 44} r={7} fill={C.cinnabar} opacity={fix} />
    </svg>
  );
};

const Sketch: React.FC<{ t: number }> = ({ t }) => {
  const draw = (a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const box = (x: number, y: number, w: number, h: number, p: number, key: string) => {
    const per = 2 * (w + h);
    return (
      <rect
        key={key}
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill="none"
        stroke={C.ink}
        strokeWidth={2.4}
        strokeDasharray={`${per * p} ${per}`}
        transform={`rotate(${(random(key) - 0.5) * 2} ${x + w / 2} ${y + h / 2})`}
      />
    );
  };
  const main = draw(4, 20);
  const arrows = draw(20, 34);
  const subs = [draw(28, 42), draw(33, 47), draw(38, 52)];
  const subX = [120, 320, 520];
  return (
    <svg width={780} height={480}>
      {box(290, 60, 200, 80, main, "main")}
      <text x={390} y={110} textAnchor="middle" fontFamily={FONT_ZH} fontSize={30} fill={C.ink} opacity={main} letterSpacing="0.15em">
        难题
      </text>
      {subX.map((sx, i) => {
        const x2 = sx + 70;
        const len = Math.hypot(x2 - 390, 130);
        return (
          <g key={i}>
            <path
              d={`M 390 146 Q ${(390 + x2) / 2} ${200 + (i - 1) * 6} ${x2} 268`}
              fill="none"
              stroke={C.cinnabar}
              strokeWidth={2.2}
              strokeDasharray={`${len * 1.1 * arrows} ${len * 2}`}
            />
            <path d={`M ${x2 - 8} 258 L ${x2} 270 L ${x2 + 8} 258`} fill="none" stroke={C.cinnabar} strokeWidth={2.2} opacity={arrows > 0.9 ? 1 : 0} />
            {box(sx, 280, 140, 64, subs[i], `sub${i}`)}
            <text x={x2} y={321} textAnchor="middle" fontFamily={FONT_ZH} fontSize={22} fill={C.inkSoft} opacity={subs[i]}>
              子问题
            </text>
          </g>
        );
      })}
      <path
        d="M 120 400 C 240 380, 360 420, 480 396 S 640 390, 660 402"
        fill="none"
        stroke={C.inkSoft}
        strokeWidth={1.5}
        strokeDasharray={`${600 * draw(50, 64)} 700`}
        opacity={0.5}
      />
    </svg>
  );
};

export const S15Work: React.FC = () => {
  const f = useTick();
  const spans: [number, number][] = [
    [0, 80],
    [70, 150],
    [140, 224],
  ];
  return (
    <AbsoluteFill>
      <Backdrop kind="paper" />
      <Card from={spans[0][0]} to={spans[0][1]} bg="#FBF8F2">
        <Report t={f - spans[0][0]} />
      </Card>
      <Card from={spans[1][0]} to={spans[1][1]} bg="#1F1C1A" shadow="0 24px 50px rgba(30,20,10,0.4)">
        <Code t={f - spans[1][0]} />
      </Card>
      <Card from={spans[2][0]} to={spans[2][1]} bg="#FAF6EC">
        <Sketch t={f - spans[2][0]} />
      </Card>
      <Scrim tone="light" />
    </AbsoluteFill>
  );
};

// ── 16 回到烛光，一根竹签静静躺着 ─────────────────────────
const CandleTable: React.FC<{ opacity?: number; candleOpacity?: number }> = ({ opacity = 1, candleOpacity = 1 }) => (
  <g opacity={opacity}>
    <defs>
      <linearGradient id="table16" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2B1E13" />
        <stop offset="1" stopColor="#070504" />
      </linearGradient>
      <radialGradient id="pool16">
        <stop offset="0" stopColor="#F0B46A" stopOpacity={0.24} />
        <stop offset="1" stopColor="#F0B46A" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={0} y={640} width={W} height={H - 640} fill="url(#table16)" />
    <rect x={0} y={640} width={W} height={1.5} fill="#6B5035" opacity={0.5} />
    <ellipse cx={1150} cy={690} rx={820} ry={170} fill="url(#pool16)" />
    <g opacity={candleOpacity}>
      <Candle x={1480} y={455} seed={5} />
    </g>
  </g>
);

export const S16Rod: React.FC = () => {
  const f = useTick();
  const push = interpolate(f, [0, 180], [1, 1.06]);
  const glow = 0.35 + 0.1 * Math.sin(f * 0.07);
  return (
    <AbsoluteFill>
      <Backdrop kind="warm" />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "900px 640px" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <CandleTable />
          <ellipse cx={880} cy={650} rx={290} ry={9} fill="#000" opacity={0.6} style={{ filter: "blur(6px)" }} />
          <Rod x={880} y={634} length={560} width={13} angle={-2.5} glow={glow} />
        </svg>
      </AbsoluteFill>
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ── 17 竹签淡出，星空展开 ─────────────────────────────────
export const S17Stars: React.FC = () => {
  const f = useTick();
  const stars = makeStars(420, "sky");
  const rodOut = interpolate(f, [0, 70], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const rodRise = interpolate(f, [0, 90], [0, -60], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const tableOut = interpolate(f, [0, 50], [1, 0], clamp);
  const expand = interpolate(f, [20, 180], [0.15, 1.15], { ...clamp, easing: Easing.out(Easing.cubic) });
  const starsIn = interpolate(f, [20, 80], [0, 1], clamp);
  const cx = 960;
  const cy = 420;
  return (
    <AbsoluteFill>
      <Backdrop kind="night" />
      <AbsoluteFill style={{ transform: "scale(1.06)", transformOrigin: "900px 640px" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <CandleTable opacity={tableOut} candleOpacity={tableOut} />
        </svg>
      </AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        {stars.map((s, i) => {
          const dx = (s.x - 0.5) * W * 1.3;
          const dy = (s.y - 0.5) * H * 1.3;
          const depth = 0.5 + random(`depth${i}`) * 0.8;
          const k = expand * depth;
          return (
            <circle
              key={i}
              cx={cx + dx * k}
              cy={cy + dy * k}
              r={s.r * (0.6 + depth * 0.5)}
              fill="#FFF3E0"
              opacity={starsIn * s.b * (0.7 + 0.3 * Math.sin(f * 0.08 + s.tw))}
            />
          );
        })}
        <g opacity={rodOut} transform={`translate(0 ${rodRise * 1.06})`}>
          <g transform="translate(900 640) scale(1.06) translate(-900 -640)">
            <Rod x={880} y={634} length={560} width={13} angle={-2.5} glow={0.4} />
          </g>
        </g>
      </svg>
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ── 片尾 ──────────────────────────────────────────────────
export const SEnd: React.FC = () => {
  const f = useTick();
  const stars = makeStars(240, "end");
  const a = (s: number, e: number) => interpolate(f, [s, e], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const out = interpolate(f, [150, 178], [1, 0], clamp);
  const point = a(4, 30);
  const title = a(14, 44);
  const rule = a(30, 62);
  const credit = a(44, 70);
  const en = a(56, 82);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop kind="night" />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x * W} cy={s.y * H} r={s.r * 0.8} fill="#FFF3E0" opacity={0.35 * s.b * (0.7 + 0.3 * Math.sin(f * 0.08 + s.tw))} />
        ))}
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", transform: "translateY(-30px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
            <svg width={120} height={120} viewBox="-60 -60 120 120" style={{ opacity: point, overflow: "visible" }}>
              <LightPoint x={0} y={0} size={0.75 + 0.05 * Math.sin(f * 0.1)} intensity={point} />
            </svg>
            <div
              style={{
                fontFamily: FONT_EN,
                fontSize: 124,
                color: C.moon,
                letterSpacing: "0.01em",
                opacity: title,
                transform: `translateY(${(1 - title) * 12}px)`,
                lineHeight: 1,
              }}
            >
              {END_CARD.title} <span style={{ color: C.cinnabarSoft }}>{END_CARD.version}</span>
            </div>
          </div>
          <div style={{ height: 1, width: 760 * rule, background: "rgba(239,231,216,0.35)", margin: "34px 0 30px 20px" }} />
          <div
            style={{
              fontFamily: FONT_ZH,
              fontSize: 30,
              letterSpacing: "0.32em",
              color: C.moon,
              opacity: credit * 0.9,
              marginLeft: 20,
            }}
          >
            {END_CARD.credit}
          </div>
          <div
            style={{
              fontFamily: FONT_EN,
              fontStyle: "italic",
              fontSize: 24,
              color: "rgba(239,231,216,0.55)",
              opacity: en,
              marginTop: 14,
              marginLeft: 20,
            }}
          >
            {END_CARD.creditEn}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
