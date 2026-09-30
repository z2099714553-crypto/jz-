import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { H, Scrim, Vignette, W, clamp, scatter } from "../common";
import { FPS } from "../script";
import { HOME, RED, SEA } from "../theme";
import { Ocean, Stars } from "./Seascape";

// ─────────────────────────────────────────────────────────
// 07 老照片质感，一位老人的剪影
// ─────────────────────────────────────────────────────────

/** 老妇人侧影：发髻、长裙、双手合在胸前，面朝右边的海 */
const ELDER_BODY =
  "M -4 -350 C -22 -344, -34 -326, -36 -300 C -40 -250, -44 -180, -52 -110 C -58 -60, -66 -20, -70 0 L 58 0 C 52 -30, 44 -80, 38 -130 C 34 -170, 34 -210, 36 -240 C 40 -262, 48 -276, 46 -290 C 42 -300, 32 -304, 26 -310 C 24 -326, 18 -342, 8 -350 Z";

const ElderWoman: React.FC<{ fill: string }> = ({ fill }) => (
  <g fill={fill}>
    <path d={ELDER_BODY} />
    <circle cx={6} cy={-374} r={25} />
    <path d="M 28 -380 L 36 -372 L 29 -366 Z" />
    <circle cx={-16} cy={-390} r={14} />
    <rect x={-12} y={-4} width={46} height={8} rx={3} />
  </g>
);

/** 棕榈树：弯曲的树干 + 一簇下垂的叶 */
const Palm: React.FC<{ x: number; y: number; t: number; fill: string }> = ({ x, y, t, fill }) => {
  const fronds = [-172, -146, -118, -64, -30, 6, 34];
  return (
    <g>
      <path d={`M ${x + 150} ${H + 20} C ${x + 125} ${y + 480}, ${x + 60} ${y + 230}, ${x} ${y}`} fill="none" stroke={fill} strokeWidth={24} strokeLinecap="round" />
      {fronds.map((deg, k) => {
        const a = ((deg + 2.5 * Math.sin(t * 0.05 + k)) * Math.PI) / 180;
        const len = 250 + (k % 3) * 30;
        const tip = { x: x + Math.cos(a) * len, y: y + Math.sin(a) * len + 90 };
        const ctl = { x: x + Math.cos(a) * len * 0.5, y: y + Math.sin(a) * len * 0.5 - 40 };
        const leaflets = Array.from({ length: 13 }).map((_, i) => {
          const u = 0.12 + i * 0.066;
          const m = 1 - u;
          const px = m * m * x + 2 * m * u * ctl.x + u * u * tip.x;
          const py = m * m * y + 2 * m * u * ctl.y + u * u * tip.y;
          const l = 62 * (1 - u * 0.65);
          return [-1, 1].map((side) => {
            const b = a + side * 1.0 + 0.5;
            return <line key={`${i}${side}`} x1={px} y1={py} x2={px + Math.cos(b) * l} y2={py + Math.sin(b) * l + l * 0.35} stroke={fill} strokeWidth={4} strokeLinecap="round" />;
          });
        });
        return (
          <g key={k}>
            <path d={`M ${x} ${y} Q ${ctl.x} ${ctl.y} ${tip.x} ${tip.y}`} fill="none" stroke={fill} strokeWidth={6} strokeLinecap="round" />
            {leaflets}
          </g>
        );
      })}
    </g>
  );
};

/** 旧相片的灰尘与划痕，每隔几帧换一次位置 */
const FilmDamage: React.FC = () => {
  const f = useCurrentFrame();
  const bucket = Math.floor(f / 3);
  const sBucket = Math.floor(f / 4);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", pointerEvents: "none" }}>
      {Array.from({ length: 36 }).map((_, i) => {
        if (random(`dv${i}-${bucket}`) > 0.3) return null;
        const light = random(`dl${i}`) > 0.5;
        return (
          <circle
            key={i}
            cx={random(`dx${i}-${bucket}`) * W}
            cy={random(`dy${i}-${bucket}`) * H}
            r={0.8 + random(`dr${i}-${bucket}`) * 2}
            fill={light ? "#FFF8E6" : "#3A2A1A"}
            opacity={0.4}
          />
        );
      })}
      {[0, 1].map((j) => {
        if (random(`sv${j}-${sBucket}`) > 0.55) return null;
        const x = random(`sx${j}-${sBucket}`) * W;
        return <line key={j} x1={x} y1={0} x2={x + (random(`sw${j}-${sBucket}`) - 0.5) * 18} y2={H} stroke="#FFF6E0" strokeWidth={1.2} opacity={0.2} />;
      })}
    </svg>
  );
};

export const S07OldPhoto: React.FC = () => {
  const f = useCurrentFrame();
  // 像相片显影：先是一片发白，再慢慢显出影像，暗部最后出来
  const develop = interpolate(f, [0, 52], [1, 0], { ...clamp, easing: Easing.out(Easing.quad) });
  const figureIn = interpolate(f, [16, 64], [0, 1], clamp);
  const push = interpolate(f, [0, 180], [1.02, 1.07]);
  const horizon = 520;
  const glints = scatter(40, "sepia");
  return (
    <AbsoluteFill style={{ background: "#E9DDC4" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "760px 560px" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <defs>
            <linearGradient id="sepiaSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#B29C77" />
              <stop offset="0.72" stopColor="#D9C8A5" />
              <stop offset="1" stopColor="#F1E6CB" />
            </linearGradient>
            <linearGradient id="sepiaSea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#A38D6C" />
              <stop offset="1" stopColor="#6C5942" />
            </linearGradient>
          </defs>
          <rect width={W} height={horizon} fill="url(#sepiaSky)" />
          <rect y={horizon} width={W} height={H - horizon} fill="url(#sepiaSea)" />
          <circle cx={1290} cy={horizon - 30} r={58} fill="#F7EEDA" opacity={0.85} style={{ filter: "blur(4px)" }} />
          {glints.map((g, i) => (
            <rect
              key={i}
              x={1290 - 260 + g.x * 520 - 20}
              y={horizon + 6 + g.y * g.y * 220}
              width={16 + g.r * 50}
              height={2}
              fill="#F4E8CE"
              opacity={0.25 + 0.4 * Math.abs(Math.sin(f * 0.05 + g.p))}
            />
          ))}
          <path d={`M 0 758 C 500 744, 900 766, 1300 788 C 1600 804, 1800 812, ${W} 818 L ${W} ${H} L 0 ${H} Z`} fill="#4A3A29" />
          <Palm x={1660} y={300} t={f} fill="#3E3124" />
          <g transform="translate(740 770)" opacity={figureIn}>
            <ElderWoman fill="#34281C" />
          </g>
        </svg>
      </AbsoluteFill>
      {/* 相纸纤维 */}
      <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: 0.45 }}>
        <svg width="100%" height="100%">
          <filter id="photoPaper">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={4} />
            <feColorMatrix values="0 0 0 0 0.6  0 0 0 0 0.5  0 0 0 0 0.36  0 0 0 0.6 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#photoPaper)" />
        </svg>
      </AbsoluteFill>
      <FilmDamage />
      <AbsoluteFill style={{ background: "#F4EBD8", opacity: develop }} />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse 75% 70% at 50% 48%, rgba(60,40,20,0) 50%, rgba(60,40,20,0.55) 100%)" }}
      />
      {/* 相片的白边 */}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 0 22px #EEE4CF, inset 0 0 0 24px rgba(90,70,45,0.35)" }} />
      <Scrim tone="light" strength={0.7} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 08 一叠病历，一盏台灯
// ─────────────────────────────────────────────────────────

/** 桌面透视：u 向右，v 向桌子深处，h 向上 */
const X0 = 700;
const Y0 = 690;
const P = (u: number, v: number, h = 0): [number, number] => [X0 + u + 0.5 * v, Y0 - 0.36 * v - h];
const quad = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
const PAGE_W = 250;
const PAGE_D = 330;
export const FLIPS = [36, 82, 128];
const FLIP_LEN = 24;

const PageLines: React.FC<{ seed: string; angle: number; h0: number }> = ({ seed, angle, h0 }) => (
  <>
    {Array.from({ length: 9 }).map((_, k) => {
      const v = PAGE_D - 40 - k * 17;
      const u1 = 26;
      const u2 = PAGE_W - 26 - random(`${seed}${k}`) * (k === 0 ? 120 : 70);
      const a = P(u1 * Math.cos(angle), v, h0 + u1 * Math.sin(angle));
      const b = P(u2 * Math.cos(angle), v, h0 + u2 * Math.sin(angle));
      return <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={k === 0 ? "#6D5F52" : "#9A8F82"} strokeWidth={k === 0 ? 3 : 2} />;
    })}
  </>
);

export const S08Files: React.FC = () => {
  const f = useCurrentFrame();
  const flipped = FLIPS.filter((t) => f >= t + FLIP_LEN).length;
  const active = FLIPS.find((t) => f >= t && f < t + FLIP_LEN);
  const theta = active === undefined ? 0 : interpolate(f, [active, active + FLIP_LEN], [0, Math.PI], { easing: Easing.inOut(Easing.cubic) });
  const top = 14;

  // 台灯：灯罩对着病历
  const pivot = { x: 1270, y: 300 };
  const target = P(PAGE_W * 0.1, PAGE_D * 0.5, top);
  const dx = target[0] - pivot.x;
  const dy = target[1] - pivot.y;
  const len = Math.hypot(dx, dy);
  const dir = { x: dx / len, y: dy / len };
  const perp = { x: -dir.y, y: dir.x };
  const mouth = { x: pivot.x + dir.x * 110, y: pivot.y + dir.y * 110 };
  const far = { x: mouth.x + dir.x * 560, y: mouth.y + dir.y * 560 };
  const motes = scatter(46, "motes");

  return (
    <AbsoluteFill style={{ background: "#08111B" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0A1726" />
            <stop offset="1" stopColor="#0C1B2A" />
          </linearGradient>
          <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#13202C" />
            <stop offset="1" stopColor="#060B11" />
          </linearGradient>
          <radialGradient id="deskPool">
            <stop offset="0" stopColor={SEA.lamp} stopOpacity={0.42} />
            <stop offset="0.5" stopColor={SEA.lampDeep} stopOpacity={0.12} />
            <stop offset="1" stopColor={SEA.lampDeep} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="beam" gradientUnits="userSpaceOnUse" x1={mouth.x} y1={mouth.y} x2={far.x} y2={far.y}>
            <stop offset="0" stopColor="#FFE2A8" stopOpacity={0.28} />
            <stop offset="1" stopColor="#FFE2A8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect width={W} height={560} fill="url(#wall)" />
        <rect y={560} width={W} height={H - 560} fill="url(#desk)" />
        <ellipse cx={target[0]} cy={target[1] + 30} rx={560} ry={180} fill="url(#deskPool)" />

        {/* 一叠合上的病历夹，右边露出标签 */}
        {[7, 6, 5, 4, 3, 2, 1].map((k) => {
          const h = -k * 8;
          const off = (random(`st${k}`) - 0.5) * 22;
          const c = [P(-PAGE_W - 14 + off, -6, h), P(PAGE_W + 14 + off, -6, h), P(PAGE_W + 14 + off, PAGE_D + 6, h), P(-PAGE_W - 14 + off, PAGE_D + 6, h)];
          const front = [P(-PAGE_W - 14 + off, -6, h), P(PAGE_W + 14 + off, -6, h), P(PAGE_W + 14 + off, -6, h - 7), P(-PAGE_W - 14 + off, -6, h - 7)];
          const tabV = 40 + ((k * 53) % 200);
          return (
            <g key={k}>
              <polygon points={quad(c)} fill={k % 2 ? "#B8955A" : "#C9A66B"} />
              <polygon points={quad(front)} fill={k % 2 ? "#8E6E3D" : "#9C7B46"} />
              <polygon points={quad([P(PAGE_W + 14 + off, tabV, h), P(PAGE_W + 44 + off, tabV + 8, h), P(PAGE_W + 44 + off, tabV + 62, h), P(PAGE_W + 14 + off, tabV + 70, h)])} fill={["#D8BA82", "#E6CC96", "#A9C1C9", "#D8BA82", "#E3B7A0", "#D8BA82", "#E6CC96"][k - 1]} />
              <polygon points={quad([P(-PAGE_W - 14 + off, -6, h - 7), P(-PAGE_W + 30 + off, -6, h - 7), P(-PAGE_W + 30 + off, -6, h - 3), P(-PAGE_W - 14 + off, -6, h - 3)])} fill="#F2EBDD" opacity={0.7} />
            </g>
          );
        })}
        {/* 摊开的那一份 */}
        <polygon points={quad([P(-PAGE_W - 14, -6, 0), P(PAGE_W + 14, -6, 0), P(PAGE_W + 14, PAGE_D + 6, 0), P(-PAGE_W - 14, PAGE_D + 6, 0)])} fill="#CDAA6F" />
        {[0, 1, 2].map((k) => (
          <polygon key={`l${k}`} points={quad([P(-PAGE_W, 0, 4 + k * 3), P(0, 0, 4 + k * 3), P(0, PAGE_D, 4 + k * 3), P(-PAGE_W, PAGE_D, 4 + k * 3)])} fill={k === 2 ? "#F1EBDF" : "#DCD4C6"} />
        ))}
        {[0, 1, 2].map((k) => (
          <polygon key={`r${k}`} points={quad([P(0, 0, 4 + k * 3), P(PAGE_W, 0, 4 + k * 3), P(PAGE_W, PAGE_D, 4 + k * 3), P(0, PAGE_D, 4 + k * 3)])} fill={k === 2 ? "#F4EFE4" : "#DDD5C7"} />
        ))}
        {/* 右页上的表格与回形针 */}
        {[0, 1, 2, 3, 4].map((r) => {
          const v = 40 + r * 22;
          const a1 = P(24, v, top);
          const b1 = P(PAGE_W - 24, v, top);
          return <line key={`tr${r}`} x1={a1[0]} y1={a1[1]} x2={b1[0]} y2={b1[1]} stroke="#B3A895" strokeWidth={1.4} />;
        })}
        {[24, 110, 180, PAGE_W - 24].map((u) => {
          const a1 = P(u, 40, top);
          const b1 = P(u, 128, top);
          return <line key={`tc${u}`} x1={a1[0]} y1={a1[1]} x2={b1[0]} y2={b1[1]} stroke="#B3A895" strokeWidth={1.4} />;
        })}
        <polygon points={quad([P(PAGE_W - 70, PAGE_D - 8, top + 2), P(PAGE_W - 52, PAGE_D - 8, top + 2), P(PAGE_W - 52, PAGE_D + 30, top + 2), P(PAGE_W - 70, PAGE_D + 30, top + 2)])} fill="none" stroke="#A7B0B6" strokeWidth={3} />
        <PageLines seed={`right${flipped + (active !== undefined ? 1 : 0)}`} angle={0} h0={top} />
        <PageLines seed={`left${flipped}`} angle={Math.PI} h0={top} />
        {/* 正在翻的那一页 */}
        {active !== undefined ? (
          <g>
            <polygon
              points={quad([P(0, 0, top), P(PAGE_W * Math.cos(theta), 0, top + PAGE_W * Math.sin(theta)), P(PAGE_W * Math.cos(theta), PAGE_D, top + PAGE_W * Math.sin(theta)), P(0, PAGE_D, top)])}
              fill={theta < Math.PI / 2 ? "#F6F1E6" : "#E8E0D0"}
              stroke="#CFC5B4"
              strokeWidth={1}
            />
            {theta < Math.PI / 2 ? <PageLines seed={`right${flipped}`} angle={theta} h0={top} /> : null}
          </g>
        ) : null}
        <polygon points={quad([P(-3, 0, top), P(3, 0, top), P(3, PAGE_D, top), P(-3, PAGE_D, top)])} fill="#B9AE9C" />

        {/* 光柱与灰尘 */}
        <polygon
          points={quad([
            [mouth.x + perp.x * 64, mouth.y + perp.y * 64],
            [far.x + perp.x * 330, far.y + perp.y * 330],
            [far.x - perp.x * 330, far.y - perp.y * 330],
            [mouth.x - perp.x * 64, mouth.y - perp.y * 64],
          ])}
          fill="url(#beam)"
        />
        {motes.map((m, i) => {
          const s = 0.1 + 0.85 * ((m.x + f * 0.0012 * (0.5 + m.r)) % 1);
          const l = (m.y - 0.5) * 1.6;
          const w = 64 + 266 * s;
          const x = mouth.x + dir.x * 560 * s + perp.x * w * l + 6 * Math.sin(f * 0.03 + m.p);
          const y = mouth.y + dir.y * 560 * s + perp.y * w * l + 6 * Math.cos(f * 0.025 + m.p);
          return <circle key={i} cx={x} cy={y} r={0.9 + m.r * 1.6} fill="#FFE6B8" opacity={(0.2 + 0.5 * Math.abs(Math.sin(f * 0.06 + m.p))) * (1 - s * 0.6)} />;
        })}

        {/* 台灯：底座、两节灯臂、灯罩，朝灯光一侧有暖色轮廓 */}
        <ellipse cx={1520} cy={675} rx={100} ry={24} fill="#1A2733" />
        <ellipse cx={1520} cy={667} rx={84} ry={15} fill="#2A3B4B" />
        <path d="M 1446 662 A 84 15 0 0 1 1520 652" fill="none" stroke={SEA.lamp} strokeWidth={2} opacity={0.5} />
        {[
          [1520, 664, 1430, 420],
          [1430, 420, pivot.x, pivot.y],
        ].map(([x1, y1, x2, y2], i) => (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#243444" strokeWidth={12} strokeLinecap="round" />
            <line x1={x1 - 4} y1={y1} x2={x2 - 4} y2={y2} stroke={SEA.lamp} strokeWidth={2} strokeLinecap="round" opacity={0.45} />
          </g>
        ))}
        <circle cx={1430} cy={420} r={12} fill="#2F4153" stroke={SEA.lamp} strokeOpacity={0.4} strokeWidth={2} />
        <polygon
          points={quad([
            [pivot.x - perp.x * 22 - dir.x * 10, pivot.y - perp.y * 22 - dir.y * 10],
            [pivot.x + perp.x * 22 - dir.x * 10, pivot.y + perp.y * 22 - dir.y * 10],
            [mouth.x + perp.x * 72, mouth.y + perp.y * 72],
            [mouth.x - perp.x * 72, mouth.y - perp.y * 72],
          ])}
          fill="#22313F"
          stroke="#3A4E60"
          strokeWidth={2}
        />
        <line x1={mouth.x + perp.x * 72} y1={mouth.y + perp.y * 72} x2={mouth.x - perp.x * 72} y2={mouth.y - perp.y * 72} stroke={SEA.lamp} strokeWidth={4} opacity={0.9} />
        <circle cx={mouth.x - dir.x * 8} cy={mouth.y - dir.y * 8} r={28} fill="#FFF3D6" opacity={0.9} style={{ filter: "blur(6px)" }} />
        {/* 一支笔 */}
        <polygon points={quad([P(-PAGE_W - 120, 60, 0), P(-PAGE_W - 110, 60, 0), P(-PAGE_W - 60, 250, 0), P(-PAGE_W - 70, 250, 0)])} fill="#1F2B36" />
      </svg>
      <Vignette strength={0.6} />
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 09 一本书合上，飞过海面
// ─────────────────────────────────────────────────────────

/** 正面看的一本书：书脊在中间，两片封面像翅膀。phi 是封面与水平面的夹角。
 *  摊开时看到的是内页；合上飞起后，看到赭红色的封面，书页夹在中间 */
const Book: React.FC<{ phi: number; open: boolean }> = ({ phi, open }) => {
  const Wc = 170;
  const sp = { x: 36, y: -84 }; // 书脊朝画面深处
  const cover = (sign: number, a: number, w: number, lift = 0) => {
    const c = { x: sign * w * Math.cos(a), y: -w * Math.sin(a) - lift };
    return quad([
      [0, -lift],
      [sp.x, sp.y - lift],
      [sp.x + c.x, sp.y + c.y],
      [c.x, c.y],
    ]);
  };
  const rad = (phi * Math.PI) / 180;
  const pageAngles = open ? [2, 4, 6, 8] : [5, 9, 13, 17];
  return (
    <g>
      {open ? (
        <>
          {[-1, 1].map((sign) => (
            <polygon key={`c${sign}`} points={cover(sign, rad, Wc)} fill="#A8452F" stroke="#7E3322" strokeWidth={2} />
          ))}
          {[-1, 1].flatMap((sign) =>
            pageAngles.map((k, i) => (
              <polygon key={`${sign}${k}`} points={cover(sign, rad + (k * Math.PI) / 180, Wc * 0.95, 3 + i * 2)} fill={i === 3 ? "#FBF8F1" : "#ECE5D8"} stroke="#D2C8B6" strokeWidth={1} />
            )),
          )}
          {[-1, 1].map((sign) =>
            [0, 1, 2, 3, 4].map((r) => {
              const u = 0.2 + r * 0.14;
              const a2 = rad + (8 * Math.PI) / 180;
              const x1 = sign * Wc * 0.18 * Math.cos(a2) + sp.x * u;
              const y1 = -Wc * 0.18 * Math.sin(a2) + sp.y * u - 11;
              const x2 = sign * Wc * 0.82 * Math.cos(a2) + sp.x * u;
              const y2 = -Wc * 0.82 * Math.sin(a2) + sp.y * u - 11;
              return <line key={`t${sign}${r}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#B8AE9E" strokeWidth={2} />;
            }),
          )}
        </>
      ) : (
        <>
          {[-1, 1].flatMap((sign) =>
            pageAngles.map((k, i) => (
              <polygon key={`${sign}${k}`} points={cover(sign, rad + (k * Math.PI) / 180, Wc * 0.94)} fill={i % 2 ? "#FBF8F1" : "#E9E2D4"} stroke="#CFC5B3" strokeWidth={1} />
            )),
          )}
          {[-1, 1].map((sign) => (
            <polygon key={`c${sign}`} points={cover(sign, rad, Wc)} fill="#A8452F" stroke="#7E3322" strokeWidth={2} />
          ))}
        </>
      )}
      <line x1={0} y1={0} x2={sp.x} y2={sp.y} stroke="#6E2A1C" strokeWidth={7} strokeLinecap="round" />
    </g>
  );
};

export const BOOK_CLOSE = 30;

export const S09Book: React.FC = () => {
  const f = useCurrentFrame();
  const horizon = 600;
  // 合上：封面从摊平到立起
  const close = interpolate(f, [4, BOOK_CLOSE], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const flutter = f < BOOK_CLOSE ? 5 * Math.sin(f * 0.9) * (1 - close) : 0;
  // 起飞后沿曲线飞向左边的夕阳，越飞越远
  const fly = interpolate(f, [BOOK_CLOSE + 8, 150], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const flap = f > BOOK_CLOSE + 8 ? 58 + 24 * Math.sin((f - BOOK_CLOSE - 8) * 0.42) : 0;
  const phi = f <= BOOK_CLOSE + 8 ? 10 + 78 * close + flutter : flap;
  const m = 1 - fly;
  const p0 = { x: 1000, y: 470 };
  const p1 = { x: 820, y: 170 };
  const p2 = { x: 400, y: horizon - 40 };
  const bx = m * m * p0.x + 2 * m * fly * p1.x + fly * fly * p2.x;
  const by = m * m * p0.y + 2 * m * fly * p1.y + fly * fly * p2.y;
  const scale = interpolate(fly, [0, 1], [1.25, 0.16]);
  const tilt = interpolate(fly, [0, 0.4, 1], [0, -10, 6]);
  const trail = Array.from({ length: 22 }).map((_, i) => {
    const age = i * 3;
    const tf = interpolate(f - age, [BOOK_CLOSE + 8, 150], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
    const mm = 1 - tf;
    return {
      x: mm * mm * p0.x + 2 * mm * tf * p1.x + tf * tf * p2.x + (random(`tx${i}`) - 0.5) * 30,
      y: mm * mm * p0.y + 2 * mm * tf * p1.y + tf * tf * p2.y + 20 + (random(`ty${i}`) - 0.5) * 30,
      o: f - age > BOOK_CLOSE + 8 ? (1 - i / 22) * 0.6 : 0,
    };
  });
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="sunset" cx="0.2" cy="1" r="0.7">
            <stop offset="0" stopColor="#F0A56E" stopOpacity={0.75} />
            <stop offset="0.4" stopColor="#B7667A" stopOpacity={0.25} />
            <stop offset="1" stopColor="#B7667A" stopOpacity={0} />
          </radialGradient>
        </defs>
        <Ocean horizon={horizon} sky={["#06111F", "#16304D", "#3C5670"]} sea={["#112C47", "#040C16"]} brightness={0.9} glowX={380} seed="s09" />
        <rect width={W} height={horizon} fill="url(#sunset)" />
        <Stars n={40} maxY={300} opacity={0.5} seed="s09stars" />
        <circle cx={380} cy={horizon - 4} r={34} fill="#FFD9A8" opacity={0.9} style={{ filter: "blur(3px)" }} />
        {trail.map((t, i) => (
          <circle key={i} cx={t.x} cy={t.y} r={1.6} fill="#FFE9C4" opacity={t.o} />
        ))}
        <g transform={`translate(${bx} ${by}) rotate(${tilt}) scale(${scale})`}>
          <Book phi={phi} open={f < BOOK_CLOSE - 2} />
        </g>
      </svg>
      <Vignette strength={0.5} />
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────
// 10 纯白底，四句话依次出现；背后每句画出四分之一个圆
// ─────────────────────────────────────────────────────────
export const S10Four: React.FC = () => {
  const f = useCurrentFrame();
  const duration = 8 * FPS;
  const first = Math.round(0.4 * FPS);
  const slot = (duration - first) / 4;
  const r = 360;
  const cx = 960;
  const cy = 520;
  const circ = 2 * Math.PI * r;
  let drawn = 0;
  for (let k = 0; k < 4; k++) {
    drawn += interpolate(f, [first + k * slot + 4, first + k * slot + 46], [0, 0.25], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  }
  const head = -Math.PI / 2 + drawn * Math.PI * 2;
  const whole = interpolate(f, [first + 3 * slot + 46, first + 3 * slot + 70], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#FCFBF8" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={HOME.ink}
          strokeOpacity={0.14 + 0.06 * whole}
          strokeWidth={2}
          strokeDasharray={`${circ * drawn} ${circ}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {drawn > 0.002 && whole < 1 ? <circle cx={cx + r * Math.cos(head)} cy={cy + r * Math.sin(head)} r={6} fill={RED} opacity={1 - whole} /> : null}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 75% at 50% 48%, rgba(0,0,0,0) 60%, rgba(120,100,70,0.08) 100%)" }} />
    </AbsoluteFill>
  );
};
