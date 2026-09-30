import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { H, Scrim, W, clamp, scatter, wobble } from "../common";
import { OnSubject, Photo } from "../Photo";
import { FPS } from "../script";
import { FONT_ZH, HOME, RED } from "../theme";

// ─────────────────────────────────────────────────────────
// 公共：暖色的湖、树荫、照片位置
// ─────────────────────────────────────────────────────────

/** 图 1（妈妈和我）在舞台上的位置：原图 960×1280 */
const P1 = { src: "ohana/cutouts/mom_pair.png", w: 960, h: 1280, scale: 1.14, x: 372, y: -390 };
const toStage1 = (sx: number, sy: number) => [P1.x + sx * P1.scale, P1.y + sy * P1.scale] as const;
const MOM_FACE = toStage1(605, 715);
const MOM_CHEST = toStage1(625, 905);

/** 图 2（爸爸和我）：原图 1707×1280 */
const P2 = { w: 1707, h: 1280, scale: 0.99, x: 68, y: -186 };
const toStage2 = (sx: number, sy: number) => [P2.x + sx * P2.scale, P2.y + sy * P2.scale] as const;

const hillPath = (x0: number, x1: number, base: number, height: number, seed: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = x0 + (x1 - x0) * t;
    const y = base - height * (0.55 + 0.25 * Math.sin(t * 5 + seed) + 0.12 * Math.sin(t * 13 + seed * 2) + 0.08 * Math.sin(t * 29 + seed));
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M ${x0} ${base} L ${pts.join(" L ")} L ${x1} ${base} Z`;
};

/** 北仑的湖：暖白天空、远山、泛起涟漪的湖面。shift 做视差 */
const Lake: React.FC<{ shift: number }> = ({ shift }) => (
  <div style={{ position: "absolute", inset: 0, filter: "blur(2.5px)" }}>
    <LakeSharp shift={shift} />
  </div>
);

const LakeSharp: React.FC<{ shift: number }> = ({ shift }) => {
  const f = useCurrentFrame();
  const horizon = 560;
  const lines = scatter(70, "lake");
  const rings = [0, 45, 90].map((t0, i) => ({
    p: ((f + t0) % 135) / 135,
    x: [520, 1500, 900][i],
    y: [640, 700, 760][i],
  }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="warmSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9DCC3" />
          <stop offset="1" stopColor="#F7F0E2" />
        </linearGradient>
        <linearGradient id="warmLake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCDCC9" />
          <stop offset="1" stopColor="#C4C6B2" />
        </linearGradient>
      </defs>
      <rect width={W} height={horizon} fill="url(#warmSky)" />
      <g transform={`translate(${shift * 0.3} 0)`}>
        <path d={hillPath(-200, 2200, horizon, 120, 1)} fill="#C9C8B0" />
      </g>
      <g transform={`translate(${shift * 0.6} 0)`}>
        <path d={hillPath(-300, 1300, horizon, 70, 4)} fill="#B3B598" />
        <path d={hillPath(1200, 2300, horizon, 90, 7)} fill="#AEB293" />
      </g>
      <g transform={`translate(${shift} 0)`}>
        <rect x={-200} y={horizon} width={W + 400} height={H - horizon} fill="url(#warmLake)" />
        {lines.map((l, i) => {
          const d = l.r;
          const y = horizon + 6 + d * d * (H - horizon);
          const x = ((l.x * (W + 400) + f * (0.2 + d * 0.5)) % (W + 400)) - 200;
          return <rect key={i} x={x} y={y} width={20 + 90 * d} height={1.5 + d * 1.5} rx={1} fill="#FFFFFF" opacity={(0.2 + 0.4 * Math.abs(Math.sin(f * 0.05 + l.p))) * (0.5 + d * 0.5)} />;
        })}
        {rings.map((r, i) => (
          <ellipse key={i} cx={r.x} cy={r.y} rx={20 + r.p * 260} ry={4 + r.p * 40} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.5 * (1 - r.p)} />
        ))}
      </g>
    </svg>
  );
};

/** 树荫下的小路：天光从左边来 */
const Grove: React.FC<{ shift: number }> = ({ shift }) => (
  <div style={{ position: "absolute", inset: 0, filter: "blur(5px)" }}>
    <GroveSharp shift={shift} />
  </div>
);

const GroveSharp: React.FC<{ shift: number }> = ({ shift }) => {
  const f = useCurrentFrame();
  const leaves = scatter(130, "canopy");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="sunLeft" cx="0.05" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#FFF6DF" />
          <stop offset="0.5" stopColor="#EDE3C9" />
          <stop offset="1" stopColor="#D8CFB2" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sunLeft)" />
      <g transform={`translate(${shift * 0.4} 0)`}>
        {[180, 420, 1480, 1720].map((x, i) => (
          <path key={x} d={`M ${x} ${H} C ${x + 10} 800, ${x - 20} 500, ${x + 30 * (i % 2 ? 1 : -1)} 180`} stroke="#6F6A52" strokeWidth={14 - i} fill="none" strokeLinecap="round" opacity={0.55} />
        ))}
        {leaves.map((l, i) => {
          // 叶团集中在几棵树的树冠附近
          const tree = [180, 420, 1480, 1720][i % 4];
          const cx = tree + (l.x - 0.5) * 520 + 6 * wobble(f, i, 0.6);
          const cy = 60 + l.y * l.y * 360 + 4 * wobble(f, i + 9, 0.6);
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={26 + l.r * 46}
              ry={20 + l.r * 34}
              fill={["#A9B08E", "#95A07C", "#B9BE9F", "#8B9672", "#C4C7A6"][i % 5]}
              opacity={0.7}
            />
          );
        })}
      </g>
      <g transform={`translate(${shift} 0)`}>
        <path d={`M 700 ${H} C 900 820, 1300 700, 2100 640 L 2100 ${H} Z`} fill="#D6CDB6" opacity={0.8} />
        <rect x={-200} y={700} width={W + 400} height={10} fill="#C4BC9E" opacity={0.3} />
      </g>
    </svg>
  );
};

/** 树叶的影子：几团模糊的暗斑慢慢晃 */
const LeafShadows: React.FC<{ w: number; h: number; seed: string; strength?: number }> = ({ w, h, seed, strength = 1 }) => {
  const f = useCurrentFrame();
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
      <rect width={w} height={h} fill="#FFFFFF" />
      {scatter(34, seed).map((s, i) => (
        <ellipse
          key={i}
          cx={s.x * w + 30 * wobble(f, i, 0.8)}
          cy={s.y * h + 22 * wobble(f, i + 5, 0.8)}
          rx={22 + s.r * 50}
          ry={14 + s.r * 30}
          transform={`rotate(${s.p * 57} ${s.x * w} ${s.y * h})`}
          fill="#6E7458"
          opacity={0.28 * strength}
          style={{ filter: "blur(10px)" }}
        />
      ))}
    </svg>
  );
};

const LightDapples: React.FC<{ w: number; h: number; seed: string }> = ({ w, h, seed }) => {
  const f = useCurrentFrame();
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
      <rect width={w} height={h} fill="#000" />
      {scatter(12, seed).map((s, i) => (
        <circle
          key={i}
          cx={s.x * w + 50 * wobble(f, i + 3, 0.7)}
          cy={s.y * h + 40 * wobble(f, i + 11, 0.7)}
          r={10 + s.r * 16}
          fill="#FFE9B8"
          opacity={0.14 + 0.1 * Math.sin(f * 0.08 + s.p)}
          style={{ filter: "blur(8px)" }}
        />
      ))}
    </svg>
  );
};

const WIND_MOM = [
  { cx: 600, cy: 650, rx: 110, ry: 52 },
  { cx: 410, cy: 500, rx: 100, ry: 46 },
  { cx: 752, cy: 960, rx: 34, ry: 120 },
];

// ─────────────────────────────────────────────────────────
// 15 图 1：妈妈淡入，发丝衣角随风，湖面涟漪
// ─────────────────────────────────────────────────────────
export const S15Mom: React.FC = () => {
  const f = useCurrentFrame();
  const appear = interpolate(f, [4, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const blur = interpolate(f, [4, 40], [8, 0], clamp);
  const push = interpolate(f, [0, 210], [1.03, 1.08]);
  const shift = interpolate(f, [0, 210], [0, -40]);
  return (
    <AbsoluteFill style={{ background: HOME.paper }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${MOM_FACE[0]}px ${MOM_FACE[1]}px` }}>
        <Lake shift={shift} />
        <div style={{ position: "absolute", inset: 0, opacity: appear, filter: blur > 0.05 ? `blur(${blur}px)` : undefined, transform: `translateX(${-shift * 0.25}px)` }}>
          <Photo {...P1} wind={WIND_MOM} seed={3} />
        </div>
      </AbsoluteFill>
      <Scrim tone="light" strength={1.15} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 16 四句话化成光点绕着妈妈；心里的灰擦干净，家就亮了
// ─────────────────────────────────────────────────────────
const WORDS = ["对不起", "请原谅", "谢谢你", "我爱你"];
export const S16_MERGE = 112;

export const S16Glow: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 150], [1.08, 1.2], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const clean = interpolate(f, [S16_MERGE - 10, S16_MERGE + 30], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const merge = interpolate(f, [S16_MERGE - 22, S16_MERGE], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const burst = interpolate(f, [S16_MERGE, S16_MERGE + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const c = { x: MOM_CHEST[0], y: MOM_CHEST[1] - 60 };
  const dust = scatter(40, "dust16");
  const words = WORDS.map((w, i) => {
    const th = f * 0.035 + (i * Math.PI) / 2;
    const rx = 380 * (1 - merge);
    const ry = 130 * (1 - merge);
    const x = c.x + rx * Math.cos(th);
    const y = c.y + ry * Math.sin(th) - 40 * (1 - merge);
    const inFront = Math.sin(th) > 0;
    const o = interpolate(f, [8 + i * 12, 26 + i * 12], [0, 1], clamp);
    return { w, x, y, inFront, o };
  });
  const Word: React.FC<{ d: (typeof words)[number] }> = ({ d }) => (
    <div
      style={{
        position: "absolute",
        left: d.x,
        top: d.y,
        transform: `translate(-50%, -50%) scale(${1 - merge * 0.85})`,
        fontFamily: FONT_ZH,
        fontSize: 34,
        letterSpacing: "0.2em",
        color: "#FFF6E2",
        textShadow: "0 0 14px rgba(255,200,120,0.9), 0 0 30px rgba(255,180,90,0.6)",
        opacity: d.o * (d.inFront ? 1 : 0.55) * (1 - burst),
        whiteSpace: "nowrap",
      }}
    >
      {merge > 0.7 ? "·" : d.w}
    </div>
  );
  return (
    <AbsoluteFill style={{ background: HOME.paper }}>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: `${MOM_FACE[0]}px ${MOM_FACE[1]}px`,
          filter: `saturate(${0.6 + 0.45 * clean}) brightness(${0.9 + 0.12 * clean})`,
        }}
      >
        <Lake shift={-40} />
        {words.filter((d) => !d.inFront).map((d) => <Word key={d.w} d={d} />)}
        <div style={{ position: "absolute", inset: 0, transform: `translateX(10px)` }}>
          <Photo {...P1} wind={WIND_MOM} seed={3} />
        </div>
        {words.filter((d) => d.inFront).map((d) => <Word key={d.w} d={d} />)}
        {/* 光点汇入胸口后漾开 */}
        <div
          style={{
            position: "absolute",
            left: c.x - 400 * burst,
            top: c.y - 400 * burst,
            width: 800 * burst,
            height: 800 * burst,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,236,196,0.75) 0%, rgba(255,214,150,0.25) 45%, rgba(255,214,150,0) 70%)",
            opacity: 1 - burst * 0.6,
            mixBlendMode: "screen",
          }}
        />
      </AbsoluteFill>
      {/* 心里的灰：一开始飘着细尘，擦干净后散去 */}
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", opacity: 1 - clean }}>
        {dust.map((d, i) => (
          <circle key={i} cx={d.x * W + 20 * wobble(f, i, 0.5)} cy={d.y * H + 15 * wobble(f, i + 7, 0.5)} r={1 + d.r * 2.5} fill="#8A8176" opacity={0.35} />
        ))}
      </svg>
      <AbsoluteFill style={{ background: "#8E877C", mixBlendMode: "multiply", opacity: 0.18 * (1 - clean) }} />
      <Scrim tone="light" strength={1.15} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 17 图 2：爸爸大笑，搭着我的肩，树影在两人身上晃动
// ─────────────────────────────────────────────────────────
const WIND_DAD = [
  { cx: 620, cy: 420, rx: 75, ry: 40 },
  { cx: 985, cy: 390, rx: 85, ry: 48 },
];

export const S17Dad: React.FC = () => {
  const f = useCurrentFrame();
  const appear = interpolate(f, [2, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shift = interpolate(f, [0, 180], [0, -36]);
  const push = interpolate(f, [0, 180], [1.02, 1.07]);
  return (
    <AbsoluteFill style={{ background: HOME.paper }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "960px 420px" }}>
        <Grove shift={shift} />
        <div style={{ position: "absolute", inset: 0, opacity: appear, transform: `translateX(${-shift * 0.25}px)` }}>
          <Photo src="ohana/cutouts/dad_pair.png" {...P2} wind={WIND_DAD} seed={5}>
            <OnSubject src="ohana/cutouts/dad_pair.png">
              <LeafShadows w={P2.w} h={P2.h} seed="dadShade" />
            </OnSubject>
            <OnSubject src="ohana/cutouts/dad_pair.png" blend="screen">
              <LightDapples w={P2.w} h={P2.h} seed="dadLight" />
            </OnSubject>
          </Photo>
        </div>
      </AbsoluteFill>
      <Scrim tone="light" strength={1.15} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 18 爸爸的手在我肩上轻轻拍了两下
// ─────────────────────────────────────────────────────────
export const PATS = [26, 44];
const FOREARM_PIVOT = [1085, 560] as const;

export const S18Pat: React.FC = () => {
  const f = useCurrentFrame();
  // 镜头从第 17 场结束时的取景（1.07 倍，以 960,420 为中心）平滑推到肩膀，交叉淡化时两场对得上
  const k = interpolate(f, [0, 150], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const focus = toStage2(1060, 560);
  const zoom = interpolate(k, [0, 1], [1.07, 1.22]);
  const ox = interpolate(k, [0, 1], [(1 - 1.07) * 960, (1 - 1.22) * focus[0]]);
  const oy = interpolate(k, [0, 1], [(1 - 1.07) * 420, (1 - 1.22) * focus[1]]);
  // 每拍一下：5 帧抬起，4 帧落下
  const lift = PATS.reduce(
    (a, t) => a + interpolate(f, [t, t + 5, t + 9], [0, 1, 0], { ...clamp, easing: Easing.inOut(Easing.quad) }),
    0,
  );
  const angle = -3.5 * lift;
  return (
    <AbsoluteFill style={{ background: HOME.paper }}>
      <AbsoluteFill style={{ transform: `translate(${ox}px, ${oy}px) scale(${zoom})`, transformOrigin: "0 0" }}>
        <Grove shift={-36} />
        <div style={{ position: "absolute", inset: 0, transform: "translateX(9px)" }}>
          <Photo src="ohana/cutouts/dad_pat_base.png" {...P2} wind={WIND_DAD} seed={5}>
            <OnSubject src="ohana/cutouts/dad_pat_base.png">
              <LeafShadows w={P2.w} h={P2.h} seed="dadShade" />
            </OnSubject>
            <AbsoluteFill
              style={{
                transformOrigin: `${FOREARM_PIVOT[0] * P2.scale}px ${FOREARM_PIVOT[1] * P2.scale}px`,
                transform: `rotate(${angle}deg)`,
              }}
            >
              <Img src={staticFile("ohana/cutouts/dad_forearm.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
              <OnSubject src="ohana/cutouts/dad_forearm.png">
                <LeafShadows w={P2.w} h={P2.h} seed="dadShade" />
              </OnSubject>
            </AbsoluteFill>
          </Photo>
        </div>
      </AbsoluteFill>
      <Scrim tone="light" strength={1.15} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 19 图 1、图 2 并排，中间是一条海平线
// ─────────────────────────────────────────────────────────
const Print: React.FC<{ src: string; x: number; y: number; w: number; h: number; rot: number; delay: number }> = ({ src, x, y, w, h, rot, delay }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + 22], [0, 1], clamp);
  const dy = interpolate(f, [delay, delay + 30], [30, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const float = 4 * Math.sin(f * 0.05 + delay);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + dy + float,
        width: w + 32,
        height: h + 32,
        padding: 16,
        background: "#FBF8F2",
        boxShadow: "0 18px 40px rgba(80,60,40,0.28), 0 2px 6px rgba(80,60,40,0.18)",
        transform: `rotate(${rot}deg)`,
        opacity: o,
      }}
    >
      <Img src={staticFile(src)} style={{ width: w, height: h, objectFit: "cover", display: "block" }} />
    </div>
  );
};

export const S19Prints: React.FC = () => {
  const f = useCurrentFrame();
  const drift = interpolate(f, [0, 180], [0, 22]);
  const line = interpolate(f, [0, 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const horizon = 470;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 45%, #FBF6EC 0%, ${HOME.paper} 60%, ${HOME.sand} 100%)` }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <line x1={960 - 960 * line} y1={horizon} x2={960 + 960 * line} y2={horizon} stroke={HOME.inkSoft} strokeWidth={1.5} opacity={0.5} />
        {Array.from({ length: 9 }).map((_, i) => {
          const x = 760 + i * 50 + ((f * 0.6) % 50);
          const y = horizon + 18 + (i % 3) * 16;
          return <path key={i} d={`M ${x} ${y} q 10 -6 20 0`} fill="none" stroke={HOME.inkSoft} strokeWidth={1.4} opacity={0.35 * line} />;
        })}
        <circle cx={960} cy={horizon} r={5} fill={RED} opacity={line} />
      </svg>
      <Print src="photos/mom.jpg" x={300 + drift} y={120} w={330} h={440} rot={-3} delay={6} />
      <Print src="photos/dad.jpg" x={1050 - drift} y={170} w={520} h={390} rot={2.5} delay={16} />
      <Scrim tone="light" strength={1.15} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 20 四句话再次出现，每句后面接一个词；圆上四个暖点依次亮起
// ─────────────────────────────────────────────────────────
export const S20Circle: React.FC = () => {
  const f = useCurrentFrame();
  const duration = 7 * FPS;
  const first = Math.round(0.4 * FPS);
  const slot = (duration - first) / 4;
  const cx = 960;
  const cy = 520;
  const r = 360;
  const lit = [0, 1, 2, 3].map((k) => interpolate(f, [first + k * slot, first + k * slot + 20], [0, 1], clamp));
  const whole = interpolate(f, [first + 3 * slot + 20, first + 3 * slot + 60], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 75% at 50% 48%, #FFF9EE 0%, ${HOME.paper} 65%, #E7D9BF 100%)` }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <radialGradient id="warmDot">
            <stop offset="0" stopColor="#FFE0A8" stopOpacity={0.9} />
            <stop offset="1" stopColor="#FFE0A8" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#C9A77A" strokeWidth={2} opacity={0.25 + 0.35 * whole} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F4C98A" strokeWidth={14} opacity={0.25 * whole} style={{ filter: "blur(8px)" }} />
        {lit.map((l, k) => {
          const a = -Math.PI / 2 + (k * Math.PI) / 2;
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          return (
            <g key={k} opacity={l}>
              <circle cx={x} cy={y} r={46} fill="url(#warmDot)" />
              <circle cx={x} cy={y} r={7} fill={k === 3 ? RED : "#E0A35C"} />
            </g>
          );
        })}
        {scatter(24, "warm20").map((s, i) => (
          <circle key={i} cx={cx + (r + 40 * s.r) * Math.cos(s.p + f * 0.004)} cy={cy + (r + 40 * s.r) * Math.sin(s.p + f * 0.004)} r={1.5 + s.r * 2} fill="#E9B878" opacity={whole * (0.3 + 0.4 * Math.abs(Math.sin(f * 0.06 + i)))} />
        ))}
      </svg>
      <AbsoluteFill style={{ background: `rgba(255,236,200,${0.12 * whole})`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
