// 算筹记数：纵式与横式。
// 纵式：1–5 为竖筹并排；6–9 上面一根横筹代表 5，下面竖筹补足。
// 横式：1–5 为横筹叠放；6–9 上面一根竖筹代表 5，下面横筹补足。
// 多位数个位用纵式，十位用横式，依次纵横相间。

export type RodSeg = { x: number; y: number; length: number; angle: number };

/** 以格子中心 (0,0) 为原点，返回一个数字的算筹摆法。size 是格子高度。 */
export const rodDigit = (d: number, form: "zong" | "heng", size = 140): RodSeg[] => {
  const segs: RodSeg[] = [];
  const long = size * 0.8;
  const gap = size * 0.14;
  if (d <= 0) return segs;
  if (form === "zong") {
    if (d <= 5) {
      for (let i = 0; i < d; i++) segs.push({ x: (i - (d - 1) / 2) * gap, y: 0, length: long, angle: 90 });
    } else {
      const n = d - 5;
      const w = Math.max(gap * (n - 1) + gap * 1.6, size * 0.42);
      segs.push({ x: 0, y: -size * 0.34, length: w, angle: 0 });
      for (let i = 0; i < n; i++)
        segs.push({ x: (i - (n - 1) / 2) * gap, y: size * 0.07, length: size * 0.62, angle: 90 });
    }
  } else {
    if (d <= 5) {
      for (let i = 0; i < d; i++) segs.push({ x: 0, y: (i - (d - 1) / 2) * gap, length: long * 0.78, angle: 0 });
    } else {
      const n = d - 5;
      segs.push({ x: 0, y: -size * 0.26, length: size * 0.4, angle: 90 });
      for (let i = 0; i < n; i++)
        segs.push({ x: 0, y: size * 0.04 + i * size * 0.13, length: long * 0.72, angle: 0 });
    }
  }
  return segs;
};
