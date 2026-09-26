import React from "react";
import { AbsoluteFill, Easing, interpolate, random } from "remotion";
import { Backdrop, BronzeDefs, Candle, Gear, Scrim, clamp, meshPhase } from "../common";
import { C, FONT_EN } from "../theme";
import { useTick } from "../time";

const W = 1920;
const H = 1080;

/** 三只互相咬合的齿轮，a1 为主轮转角 */
const GearTrain: React.FC<{ a1: number; x: number; y: number; opacity?: number; scale?: number }> = ({
  a1,
  x,
  y,
  opacity = 1,
  scale = 1,
}) => {
  const g1 = { n: 30, r: 180 };
  const g2 = { n: 18, r: 108 };
  const g3 = { n: 12, r: 72 };
  const th2 = -0.5;
  const th3 = 2.3;
  const p2 = { x: Math.cos(th2) * (g1.r + g2.r), y: Math.sin(th2) * (g1.r + g2.r) };
  const p3 = { x: Math.cos(th3) * (g1.r + g3.r), y: Math.sin(th3) * (g1.r + g3.r) };
  const a2 = -a1 * (g1.n / g2.n) + meshPhase(th2, g1.n, g2.n);
  const a3 = -a1 * (g1.n / g3.n) + meshPhase(th3, g1.n, g3.n);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <g style={{ filter: "drop-shadow(8px 12px 10px rgba(0,0,0,0.55))" }}>
        <Gear x={0} y={0} teeth={g1.n} pitchR={g1.r} angle={a1} />
        <Gear x={p2.x} y={p2.y} teeth={g2.n} pitchR={g2.r} angle={a2} />
        <Gear x={p3.x} y={p3.y} teeth={g3.n} pitchR={g3.r} angle={a3} />
      </g>
    </g>
  );
};

/** 一摞账本 + 摊开的一本，上面密密麻麻的数字 */
const Ledgers: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const books = [
    { w: 330, h: 44, c: "#5A2A1F" },
    { w: 300, h: 38, c: "#3F3524" },
    { w: 318, h: 48, c: "#6B3A22" },
    { w: 290, h: 36, c: "#2F2A22" },
    { w: 310, h: 42, c: "#5C4A2C" },
  ];
  let top = y;
  const rows = books.map((b, i) => {
    top -= b.h;
    const dx = (random(`book${i}`) - 0.5) * 26;
    return (
      <g key={i}>
        <rect x={x + dx} y={top} width={b.w} height={b.h} rx={3} fill={b.c} />
        <rect x={x + dx} y={top + 4} width={b.w} height={2} fill="#D9B77A" opacity={0.35} />
        <rect x={x + dx} y={top + b.h - 6} width={b.w} height={2} fill="#D9B77A" opacity={0.35} />
        <rect x={x + dx + b.w - 10} y={top + 2} width={8} height={b.h - 4} fill="#EADBC0" opacity={0.5} />
      </g>
    );
  });
  const pageTop = top - 6;
  return (
    <g>
      {rows}
      {/* 摊开的账本 */}
      <path
        d={`M ${x - 30} ${pageTop} L ${x + 150} ${pageTop - 14} L ${x + 330} ${pageTop} L ${x + 330} ${pageTop - 6} L ${
          x + 150
        } ${pageTop - 20} L ${x - 30} ${pageTop - 6} Z`}
        fill="#E8DCC2"
      />
      <g transform={`translate(${x - 26} ${pageTop - 12}) skewY(-4)`}>
        <rect x={0} y={-150} width={176} height={150} fill="#EFE4CC" />
        {Array.from({ length: 9 }).map((_, i) => (
          <g key={i}>
            <rect x={12} y={-138 + i * 15} width={152} height={0.8} fill="#8A6B45" opacity={0.5} />
            <text x={20} y={-141 + i * 15} fontFamily={FONT_EN} fontSize={11} fill="#4A3524" opacity={0.75}>
              {String(Math.floor(random(`l${i}`) * 9000 + 1000))}
            </text>
            <text x={118} y={-141 + i * 15} fontFamily={FONT_EN} fontSize={11} fill="#4A3524" opacity={0.75}>
              {String(Math.floor(random(`r${i}`) * 900 + 100))}
            </text>
          </g>
        ))}
      </g>
      <g transform={`translate(${x + 152} ${pageTop - 26}) skewY(4)`}>
        <rect x={0} y={-138} width={176} height={150} fill="#E9DDC3" />
        {Array.from({ length: 9 }).map((_, i) => (
          <g key={i}>
            <rect x={12} y={-126 + i * 15} width={152} height={0.8} fill="#8A6B45" opacity={0.5} />
            <text x={20} y={-129 + i * 15} fontFamily={FONT_EN} fontSize={11} fill="#4A3524" opacity={0.75}>
              {String(Math.floor(random(`L${i}`) * 9000 + 1000))}
            </text>
            <text x={118} y={-129 + i * 15} fontFamily={FONT_EN} fontSize={11} fill="#4A3524" opacity={0.75}>
              {String(Math.floor(random(`R${i}`) * 900 + 100))}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
};

// ── 05 铜色齿轮咬合转动，旁边堆着账本 ─────────────────────
export const S05Gears: React.FC = () => {
  const f = useTick();
  const a1 = f * 0.011;
  const dawn = interpolate(f, [0, 210], [0, 1], clamp);
  const gearsIn = interpolate(f, [0, 30], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Backdrop kind="warm" />
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, rgba(236,150,96,${0.16 * dawn}) 0%, rgba(236,150,96,0) 55%)`,
        }}
      />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <BronzeDefs />
        <defs>
          <linearGradient id="deskTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2E2015" />
            <stop offset="1" stopColor="#080504" />
          </linearGradient>
        </defs>
        <rect x={0} y={720} width={W} height={H - 720} fill="url(#deskTop)" />
        <Candle x={660} y={430} scale={0.72} seed={3} />
        <Ledgers x={220} y={722} />
        <GearTrain a1={a1} x={1240} y={420} opacity={gearsIn} />
      </svg>
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};

// ── 06 齿轮自动进位 ────────────────────────────────────────
// 先慢后快地拨动：184 → 200，途中两次进位，最后一次连进两位
export const CARRY_STEPS = [12, 26, 38, 48, 57, 65, 72, 78, 84, 89, 94, 99, 103, 107, 111, 115];
const STEPS = CARRY_STEPS;
const START = 184;

/** 某一位数字轮在第 f 帧的连续位置（可以超过 9，取模显示） */
const wheelPos = (f: number, place: number) => {
  let pos = Math.floor(START / 10 ** place) % 10;
  let value = START;
  for (const s of STEPS) {
    const before = Math.floor(value / 10 ** place) % 10;
    value += 1;
    const after = Math.floor(value / 10 ** place) % 10;
    if (before !== after) {
      // 高位比低位晚几帧，像机械传动
      const delay = place * 5;
      const p = interpolate(f, [s + delay, s + delay + 12], [0, 1], {
        ...clamp,
        easing: Easing.bezier(0.3, 1.45, 0.5, 1),
      });
      pos += p;
    }
  }
  return pos;
};

const carryMoments = (() => {
  const out: { frame: number; from: number }[] = [];
  let value = START;
  for (const s of STEPS) {
    const next = value + 1;
    for (let place = 0; place < 2; place++) {
      const d = Math.floor(value / 10 ** place) % 10;
      if (d === 9) out.push({ frame: s + place * 5 + 3, from: place });
    }
    value = next;
  }
  return out;
})();

export const S06Carry: React.FC = () => {
  const f = useTick();
  const bx = 960;
  const by = 380;
  const winW = 150;
  const winH = 170;
  const xs = [bx + 210, bx, bx - 210]; // 个位、十位、百位
  const digitH = 150;
  const boxIn = interpolate(f, [0, 16], [0.96, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill>
      <Backdrop kind="warm" />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        <BronzeDefs />
        <defs>
          <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C58F55" />
            <stop offset="0.5" stopColor={C.bronze} />
            <stop offset="1" stopColor="#7A4E26" />
          </linearGradient>
          <linearGradient id="windowShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity={0.75} />
            <stop offset="0.3" stopColor="#000" stopOpacity={0} />
            <stop offset="0.7" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.75} />
          </linearGradient>
          {xs.map((x, i) => (
            <clipPath id={`win${i}`} key={i}>
              <rect x={x - winW / 2} y={by - winH / 2} width={winW} height={winH} rx={10} />
            </clipPath>
          ))}
        </defs>

        <GearTrain a1={f * 0.02} x={960} y={420} opacity={0.18} scale={1.6} />

        <g transform={`translate(${bx} ${by}) scale(${boxIn}) translate(${-bx} ${-by})`}>
          <rect
            x={bx - 380}
            y={by - 150}
            width={760}
            height={300}
            rx={22}
            fill="url(#plate)"
            style={{ filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.6))" }}
          />
          <rect x={bx - 364} y={by - 134} width={728} height={268} rx={16} fill="none" stroke="#5C3A1B" strokeOpacity={0.5} strokeWidth={2} />
          {[
            [-350, -120],
            [350, -120],
            [-350, 120],
            [350, 120],
          ].map(([dx, dy], i) => (
            <circle key={i} cx={bx + dx} cy={by + dy} r={6} fill="#6A4420" stroke="#E0AE6E" strokeOpacity={0.5} />
          ))}

          {xs.map((x, place) => {
            const pos = wheelPos(f, place);
            const offset = (pos % 10) * digitH;
            return (
              <g key={place}>
                <rect x={x - winW / 2 - 6} y={by - winH / 2 - 6} width={winW + 12} height={winH + 12} rx={14} fill="#3B2410" />
                <g clipPath={`url(#win${place})`}>
                  <rect x={x - winW / 2} y={by - winH / 2} width={winW} height={winH} fill="#F1E6CF" />
                  <g transform={`translate(0 ${-offset})`}>
                    {Array.from({ length: 12 }).map((_, k) => (
                      <text
                        key={k}
                        x={x}
                        y={by + 44 + k * digitH}
                        textAnchor="middle"
                        fontFamily={FONT_EN}
                        fontSize={128}
                        fill={C.ink}
                      >
                        {k % 10}
                      </text>
                    ))}
                  </g>
                  <rect x={x - winW / 2} y={by - winH / 2} width={winW} height={winH} fill="url(#windowShade)" />
                </g>
                {/* 数字轮下方的小齿轮随之转动 */}
                <Gear x={x} y={by + 250} teeth={10} pitchR={44} angle={(pos / 10) * Math.PI * 2} />
              </g>
            );
          })}

          {carryMoments.map(({ frame: cf, from }, i) => {
            const o = interpolate(f, [cf, cf + 4, cf + 22], [0, 1, 0], clamp);
            if (o <= 0) return null;
            const x1 = xs[from];
            const x2 = xs[from + 1];
            const lift = interpolate(f, [cf, cf + 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
            return (
              <g key={i} opacity={o}>
                <path
                  d={`M ${x1} ${by - 175} Q ${(x1 + x2) / 2} ${by - 250} ${x2} ${by - 175}`}
                  fill="none"
                  stroke={C.cinnabarSoft}
                  strokeWidth={3}
                  strokeDasharray={`${260 * lift} 400`}
                />
                <circle cx={x2} cy={by - 175} r={7 * lift} fill={C.cinnabarSoft} />
                <rect
                  x={x2 - winW / 2 - 8}
                  y={by - winH / 2 - 8}
                  width={winW + 16}
                  height={winH + 16}
                  rx={16}
                  fill="none"
                  stroke={C.cinnabarSoft}
                  strokeWidth={3}
                />
              </g>
            );
          })}
        </g>
      </svg>
      <Scrim tone="dark" />
    </AbsoluteFill>
  );
};
