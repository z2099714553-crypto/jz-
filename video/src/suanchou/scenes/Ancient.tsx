import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, Candle, Rod, Scrim, clamp } from "../common";
import { rodDigit } from "../rodNumeral";
import { C, FONT_EN, FONT_ZH } from "../theme";

const W = 1920;
const H = 1080;

/** 桌面：暗色木面 + 一圈暖光 */
const Table: React.FC<{ y: number; glowX?: number; opacity?: number }> = ({ y, glowX = 960, opacity = 1 }) => (
  <g opacity={opacity}>
    <defs>
      <linearGradient id="tableTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2B1E13" />
        <stop offset="1" stopColor="#070504" />
      </linearGradient>
      <radialGradient id="tablePool">
        <stop offset="0" stopColor="#F0B46A" stopOpacity={0.22} />
        <stop offset="1" stopColor="#F0B46A" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={0} y={y} width={W} height={H - y} fill="url(#tableTop)" />
    <rect x={0} y={y} width={W} height={1.5} fill="#6B5035" opacity={0.5} />
    <ellipse cx={glowX} cy={y + 40} rx={760} ry={150} fill="url(#tablePool)" />
  </g>
);

// ── 01 黑屏，一根竹签缓缓落下 ──────────────────────────────
export const S01Fall: React.FC = () => {
  const f = useCurrentFrame();
  const LAND = 60;
  const tableY = 640;
  const fall = interpolate(f, [0, LAND], [0, 1], { ...clamp, easing: Easing.bezier(0.35, 0, 0.75, 0.7) });
  let y = interpolate(fall, [0, 1], [-180, tableY - 8]);
  let angle = interpolate(fall, [0, 1], [68, -2.5]);
  if (f > LAND) {
    // 落桌后轻轻弹一下再静止
    const k = f - LAND;
    y -= 14 * Math.exp(-k / 5) * Math.abs(Math.sin(k / 3.2));
    angle = -2.5 + 3.2 * Math.exp(-k / 7) * Math.sin(k / 2.6);
  }
  const shadow = interpolate(f, [20, LAND], [0, 0.6], clamp);
  const glow = interpolate(f, [80, 150], [0, 0.6], clamp);
  const push = interpolate(f, [0, 180], [1, 1.05]);
  const light = interpolate(f, [0, 40], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <Backdrop kind="black" />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `960px ${tableY}px` }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <g opacity={light}>
            <Table y={tableY} />
          </g>
          <ellipse cx={960} cy={tableY + 10} rx={290} ry={10} fill="#000" opacity={shadow} style={{ filter: "blur(6px)" }} />
          <Rod x={960} y={y} length={560} width={13} angle={angle} glow={glow} />
        </svg>
      </AbsoluteFill>
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ── 02 算筹纵横排开 ────────────────────────────────────────
const NUMERALS = "一二三四五六七八九";

export const S02Rods: React.FC = () => {
  const f = useCurrentFrame();
  const cell = 148;
  const x0 = 960 - cell * 4;
  const rows = [
    { form: "zong" as const, y: 250, name: "纵式" },
    { form: "heng" as const, y: 520, name: "横式" },
  ];
  const appear = (row: number, d: number) => {
    if (d === 1) return row === 0 ? 8 : 30;
    return 58 + (d - 2) * 7 + row * 4;
  };
  return (
    <AbsoluteFill>
      <Backdrop kind="paper" />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        {rows.map((row, r) => (
          <g key={row.name}>
            <text
              x={x0 - 150}
              y={row.y + 8}
              fontFamily={FONT_ZH}
              fontSize={22}
              letterSpacing="0.4em"
              fill={C.inkSoft}
              opacity={interpolate(f, [r * 20, r * 20 + 20], [0, 0.8], clamp)}
            >
              {row.name}
            </text>
            {Array.from({ length: 9 }).map((_, i) => {
              const d = i + 1;
              const t0 = appear(r, d);
              const segs = rodDigit(d, row.form, 150);
              const cx = x0 + i * cell;
              const numO = interpolate(f, [t0 + 10, t0 + 24], [0, 0.7], clamp);
              return (
                <g key={d}>
                  <g style={{ filter: "drop-shadow(3px 5px 3px rgba(70,45,20,0.35))" }}>
                    {segs.map((s, k) => {
                      const tk = t0 + k * 2;
                      const o = interpolate(f, [tk, tk + 10], [0, 1], clamp);
                      const dy = interpolate(f, [tk, tk + 14], [-26, 0], {
                        ...clamp,
                        easing: Easing.out(Easing.cubic),
                      });
                      return (
                        <Rod
                          key={k}
                          x={cx + s.x}
                          y={row.y + s.y + dy}
                          length={s.length}
                          angle={s.angle}
                          width={9}
                          opacity={o}
                          glow={d === 1 ? interpolate(f, [t0 + 10, t0 + 30], [0, 1], clamp) : 0}
                        />
                      );
                    })}
                  </g>
                  <text
                    x={cx}
                    y={row.y + 118}
                    textAnchor="middle"
                    fontFamily={FONT_ZH}
                    fontSize={21}
                    fill={d === 1 ? C.cinnabar : C.inkSoft}
                    opacity={numO}
                  >
                    {NUMERALS[i]}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
      <Scrim tone="light" />
    </AbsoluteFill>
  );
};

// ── 03 烛光下割圆 ──────────────────────────────────────────
const SIDES = [6, 12, 24, 48, 96, 192, 384, 768, 1536, 3072, 6144, 12288, 24576];

const polygon = (cx: number, cy: number, r: number, n: number) => {
  const m = Math.min(n, 480);
  const pts: string[] = [];
  for (let i = 0; i < m; i++) {
    const a = -Math.PI / 2 + (i / m) * Math.PI * 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
};

export const S03Circle: React.FC = () => {
  const f = useCurrentFrame();
  const cx = 1040;
  const cy = 380;
  const r = 250;
  const step = Math.max(0, Math.min(SIDES.length - 1, Math.floor((f - 24) / 12)));
  const n = SIDES[step];
  const stepFrame = f - 24 - step * 12;
  const flash = f >= 24 ? interpolate(stepFrame, [0, 10], [1, 0], clamp) : 0;
  const approx = n * Math.sin(Math.PI / n);
  const circleDraw = interpolate(f, [0, 30], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const circ = 2 * Math.PI * r;
  const textIn = interpolate(f, [18, 36], [0, 1], clamp);
  const wedge = n <= 96 ? 1 : interpolate(n, [96, 384], [1, 0], clamp);
  const a0 = -Math.PI / 2;
  const a1 = a0 + (Math.PI * 2) / n;

  return (
    <AbsoluteFill>
      <Backdrop kind="warm" />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <Table y={700} glowX={420} />
        <Candle x={330} y={520} seed={1} />
        {/* 桌上几根算筹 */}
        <Rod x={600} y={728} length={300} width={9} angle={-4} />
        <Rod x={640} y={748} length={300} width={9} angle={2} />
        <Rod x={560} y={764} length={300} width={9} angle={-1} opacity={0.9} />

        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={C.moon}
          strokeOpacity={0.8}
          strokeWidth={2}
          strokeDasharray={`${circ * circleDraw} ${circ}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {f >= 24 ? (
          <>
            <polygon
              points={polygon(cx, cy, r, n)}
              fill={C.cinnabar}
              fillOpacity={0.07 + 0.08 * flash}
              stroke={C.cinnabarSoft}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <path
              d={`M ${cx} ${cy} L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} L ${cx + r * Math.cos(a1)} ${
                cy + r * Math.sin(a1)
              } Z`}
              fill={C.candle}
              fillOpacity={0.18 * wedge}
              stroke={C.candle}
              strokeOpacity={0.5 * wedge}
              strokeWidth={1}
            />
          </>
        ) : null}
        <circle cx={cx} cy={cy} r={3} fill={C.moon} opacity={0.7} />

        <g opacity={textIn} fontFamily={FONT_EN}>
          <text x={1400} y={320} fontSize={30} fill={C.moon} opacity={0.6} fontStyle="italic">
            n = {n.toLocaleString("en-US")}
          </text>
          <text x={1400} y={400} fontSize={60} fill={C.moon} letterSpacing="0.03em">
            π ≈ {approx.toFixed(7).slice(0, 9)}
          </text>
          <text x={1402} y={452} fontFamily={FONT_ZH} fontSize={20} letterSpacing="0.4em" fill={C.cinnabarSoft} opacity={0.85}>
            割圆术
          </text>
        </g>
      </svg>
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ── 04 3.1415926 逐位浮现 ──────────────────────────────────
export const S04Pi: React.FC = () => {
  const f = useCurrentFrame();
  const digits = [3, 1, 4, 1, 5, 9, 2, 6];
  const gap = 150;
  const dotW = 60;
  const total = gap * digits.length + dotW;
  const left = 960 - total / 2 + gap / 2;
  const xs = digits.map((_, i) => left + i * gap + (i >= 1 ? dotW : 0));
  const settle = interpolate(f, [92, 120], [0, 1], clamp);
  const sweep = interpolate(f, [96, 150], [-300, 2200], clamp);

  return (
    <AbsoluteFill>
      <Backdrop kind="warm" />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="piSweep" gradientUnits="userSpaceOnUse" x1={sweep - 200} x2={sweep + 200} y1="0" y2="0">
            <stop offset="0" stopColor={C.moon} />
            <stop offset="0.5" stopColor="#FFE2B0" />
            <stop offset="1" stopColor={C.moon} />
          </linearGradient>
        </defs>
        <circle cx={960} cy={420} r={330} fill="none" stroke={C.moon} strokeOpacity={0.07} strokeWidth={2} />
        {digits.map((d, i) => {
          const t0 = 8 + i * 9;
          // 个位纵式，往后小数位纵横相间
          const form = i % 2 === 0 ? "zong" : "heng";
          const segs = rodDigit(d, form, 120);
          const o = interpolate(f, [t0, t0 + 12], [0, 1], clamp);
          const numO = interpolate(f, [t0 + 6, t0 + 20], [0, 1], clamp);
          const dy = interpolate(f, [t0, t0 + 16], [-20, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
          return (
            <g key={i}>
              <g opacity={o}>
                {segs.map((s, k) => (
                  <Rod key={k} x={xs[i] + s.x} y={290 + s.y + dy} length={s.length} angle={s.angle} width={8} />
                ))}
              </g>
              <text
                x={xs[i]}
                y={560}
                textAnchor="middle"
                fontFamily={FONT_EN}
                fontSize={124}
                fill="url(#piSweep)"
                opacity={numO}
              >
                {d}
              </text>
            </g>
          );
        })}
        <circle
          cx={xs[0] + gap / 2 + dotW / 2 - 8}
          cy={548}
          r={7}
          fill={C.cinnabar}
          opacity={interpolate(f, [14, 26], [0, 1], clamp)}
        />
        <text
          x={960}
          y={650}
          textAnchor="middle"
          fontFamily={FONT_EN}
          fontStyle="italic"
          fontSize={34}
          letterSpacing="0.04em"
          fill={C.cinnabarSoft}
          opacity={settle * 0.9}
        >
          3.1415926 {"<"} π {"<"} 3.1415927
        </text>
      </svg>
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};
