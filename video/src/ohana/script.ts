// 《零极限 · 家》分场台词与时间轴，对应 script.md。
// 改台词只改这里（并同步 script.md）；出现新汉字后运行 `npm run fonts:ohana`。

export const FPS = 30;

/** 竖屏画布 */
export const CANVAS_W = 1080;
export const CANVAS_H = 1920;

/** 中间的横向画面框。场景都在 1920×1080 的坐标里画，再整体缩放进框 */
export const STAGE_W = 1920;
export const STAGE_H = 1080;
export const STAGE_SCALE = CANVAS_W / STAGE_W;
export const STAGE_TOP = Math.round((CANVAS_H - STAGE_H * STAGE_SCALE) / 2);

export type Tone = "dark" | "light";

export type Cue = {
  id: string;
  from: number;
  to: number;
  /** 场景底色明暗，决定字幕颜色 */
  tone: Tone;
  label?: string;
  zh: string;
  en: string;
  /** 字幕位置：底部（默认）或画面正中 */
  place?: "bottom" | "center";
  /** 字幕从场景开始后多少秒出现 */
  textDelay?: number;
  /** 逐字出现的间隔（帧），默认 2 */
  stagger?: number;
  /** 硬切进场 */
  cut?: boolean;
  /** 分句依次出现（第 10、20、28 场），每句独占一段时间 */
  steps?: boolean;
  /** 大字（纯色底上只有这一句时） */
  big?: boolean;
};

export type Chapter = { id: string; no: string; title: string; from: number; to: number };

export const CHAPTERS: Chapter[] = [
  { id: "ch1", no: "第一章", title: "海的中央", from: 0, to: 36 },
  { id: "ch2", no: "第二章", title: "四句话", from: 36, to: 61 },
  { id: "ch3", no: "第三章", title: "八千公里", from: 61, to: 84 },
  { id: "ch4", no: "第四章", title: "家", from: 84, to: 120 },
  { id: "ch5", no: "第五章", title: "念念", from: 120, to: 178 },
];

export const CUES: Cue[] = [
  // ── 第一章 · 海的中央 ────────────────────────────────
  {
    id: "s01",
    from: 0,
    to: 5,
    tone: "dark",
    label: "太平洋 · 夏威夷群岛",
    zh: "在太平洋的正中央，有一群岛屿。",
    en: "In the middle of the Pacific, there is a chain of islands.",
    textDelay: 1.5,
    cut: true,
  },
  {
    id: "s02",
    from: 5,
    to: 11,
    tone: "dark",
    zh: "那里的人相信，心里解不开的结，会让人生病。",
    en: "The people there believed a knot in the heart could make a person ill.",
    textDelay: 0.8,
  },
  {
    id: "s03",
    from: 11,
    to: 17,
    tone: "dark",
    label: "古夏威夷 · ʻohana · 家",
    zh: "于是，家里的长者会把所有人叫到一起。",
    en: "So the elder of the family would call everyone together.",
  },
  {
    id: "s04",
    from: 17,
    to: 24,
    tone: "dark",
    zh: "说出心结，静默，认错，原谅。然后彼此 kala——松开。",
    en: "Speak the knot. Sit in silence. Confess. Forgive. Then kala — let go.",
  },
  {
    id: "s05",
    from: 24,
    to: 30,
    tone: "dark",
    zh: "最后，一家人坐下来，吃一顿饭，吃一种叫 kala 的海藻。",
    en: "At the end, they shared a meal of limu kala — the seaweed of release.",
  },
  {
    id: "s06",
    from: 30,
    to: 36,
    tone: "dark",
    zh: "他们把这件事叫做 Hoʻoponopono：让一切，回到对的位置。",
    en: "They called it Hoʻoponopono: to set things right again.",
    textDelay: 1.2,
  },

  // ── 第二章 · 四句话 ──────────────────────────────────
  {
    id: "s07",
    from: 36,
    to: 42,
    tone: "light",
    label: "1983 年 · 檀香山 · 莫娜·西蒙那",
    zh: "后来，一位夏威夷疗愈师，把全家围坐的仪式，变成了一个人也能做的清理。",
    en: "A Hawaiian healer turned the family circle into a cleaning anyone could do alone.",
  },
  {
    id: "s08",
    from: 42,
    to: 48,
    tone: "dark",
    label: "夏威夷州立医院 · 修·蓝",
    zh: "据说，她的学生从不见病人，只是一遍一遍，清理自己。",
    en: "Her student, it is said, never saw the patients. He only cleaned himself, again and again.",
  },
  {
    id: "s09",
    from: 48,
    to: 53,
    tone: "dark",
    label: "2007 年 · 《零极限》",
    zh: "后来，这个故事被写成一本书，漂洋过海。",
    en: "Then the story became a book, and crossed the ocean.",
  },
  {
    id: "s10",
    from: 53,
    to: 61,
    tone: "light",
    zh: "对不起。请原谅我。谢谢你。我爱你。",
    en: "I'm sorry. Please forgive me. Thank you. I love you.",
    place: "center",
    steps: true,
    big: true,
  },

  // ── 第三章 · 八千公里 ────────────────────────────────
  {
    id: "s11",
    from: 61,
    to: 67,
    tone: "dark",
    label: "檀香山 → 宁波北仑 · 约 8000 公里",
    zh: "从檀香山到北仑，隔着八千公里的海。",
    en: "Eight thousand kilometers of ocean between Honolulu and Beilun.",
  },
  {
    id: "s12",
    from: 67,
    to: 72,
    tone: "dark",
    zh: "檀香山的傍晚六点，是北仑第二天的正午。",
    en: "Six in the evening in Honolulu is noon the next day in Beilun.",
  },
  {
    id: "s13",
    from: 72,
    to: 77,
    tone: "dark",
    label: "浙江 · 宁波 · 北仑",
    zh: "可东海的浪，本就是太平洋的浪。",
    en: "But the waves of the East China Sea are Pacific waves too.",
  },
  {
    id: "s14",
    from: 77,
    to: 84,
    tone: "dark",
    zh: "后来我去了夏威夷。站在那片海边才知道，妈妈念了很多年的四句话，是从这里出发的。",
    en: "Years later I stood on that shore, and realized where my mother's four sentences had come from.",
  },

  // ── 第四章 · 家 ──────────────────────────────────────
  {
    id: "s15",
    from: 84,
    to: 91,
    tone: "light",
    label: "北仑 · 妈妈",
    zh: "妈妈是家里最早开始“清理”的人。遇到烦心事，她不争，也不怨。",
    en: "Mom was the first of us to start “cleaning.” When things went wrong, she didn't argue or blame.",
  },
  {
    id: "s16",
    from: 91,
    to: 96,
    tone: "light",
    zh: "只是在心里，轻轻念那四句话。先把自己心里的灰擦干净，家，就亮了。",
    en: "She only whispered the four sentences. Wipe the dust from your own heart, and the home grows bright.",
  },
  {
    id: "s17",
    from: 96,
    to: 102,
    tone: "light",
    label: "北仑 · 爸爸",
    zh: "爸爸话不多，笑起来却最响。以前，家里难免有脾气撞上脾气。",
    en: "Dad doesn't say much, but his laugh is the loudest. Once, tempers sometimes collided.",
  },
  {
    id: "s18",
    from: 102,
    to: 107,
    tone: "light",
    zh: "后来，先说“对不起”的人，越来越多。",
    en: "Then, more and more, someone said “I'm sorry” first.",
  },
  {
    id: "s19",
    from: 107,
    to: 113,
    tone: "light",
    zh: "我在远方读书，隔着一片海。电话里最常说的一句，变成了“谢谢你”。",
    en: "I study far away, across another sea. On the phone, the words I say most became “thank you.”",
  },
  {
    id: "s20",
    from: 113,
    to: 120,
    tone: "light",
    zh: "对不起，是放下。请原谅，是和解。谢谢你，是看见。我爱你，是回家。",
    en: "Sorry is letting go. Forgive is making peace. Thank you is seeing. I love you is coming home.",
    place: "center",
    steps: true,
  },

  // ── 第五章 · 念念 ────────────────────────────────────
  {
    id: "s21",
    from: 120,
    to: 125,
    tone: "light",
    zh: "零极限说，要清理每一个念头，回到“零”。",
    en: "Zero Limits says: clean every thought, and return to zero.",
  },
  {
    id: "s22",
    from: 125,
    to: 129,
    tone: "light",
    zh: "可我们家，有一个念，谁也不想放下。",
    en: "But in our home, there is one thought none of us wants to let go.",
    textDelay: 0.4,
  },
  {
    id: "s23",
    from: 129,
    to: 134,
    tone: "dark",
    label: "金渐层 · 念念",
    zh: "她叫念念。",
    en: "Her name is Niannian.",
    stagger: 4,
  },
  {
    id: "s24",
    from: 134,
    to: 140,
    tone: "light",
    zh: "她不懂什么是清理，却天生就活在“零”里：不记仇，不担心明天。",
    en: "She knows nothing about cleaning, yet she lives at zero: no grudges, no worry about tomorrow.",
  },
  {
    id: "s25",
    from: 140,
    to: 146,
    tone: "light",
    zh: "她趴在茶几上睡着的样子，比任何一句话，都更像平静。",
    en: "The way she sleeps, stretched across the table, looks more like peace than any words.",
  },
  {
    id: "s26",
    from: 146,
    to: 152,
    tone: "light",
    zh: "ʻohana 的意思是家人。家人，从来不只是有血缘的人。",
    en: "ʻOhana means family. And family was never only about blood.",
  },
  {
    id: "s27",
    from: 152,
    to: 158,
    tone: "light",
    zh: "三个人，一只猫。从夏威夷的海，到北仑的家。",
    en: "Three people and a cat. From the sea of Hawaiʻi to a home in Beilun.",
  },
  {
    id: "s28",
    from: 158,
    to: 166,
    tone: "light",
    zh: "对不起，让你们等我长大。请原谅，那些没说出口的话。谢谢你们，一直都在。我爱你们——",
    en: "Sorry for making you wait while I grew up. Forgive the words I never said. Thank you for always being here. I love you—",
    place: "center",
    steps: true,
  },
  {
    id: "s29",
    from: 166,
    to: 170,
    tone: "light",
    zh: "还有你，念念。",
    en: "And you too, Niannian.",
    stagger: 4,
  },
  {
    id: "end",
    from: 170,
    to: 178,
    tone: "light",
    zh: "",
    en: "",
  },
];

export const TOTAL_SECONDS = CUES[CUES.length - 1].to;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;

export const END_CARD = {
  title: "零极限 · 家",
  titleEn: "Zero Limits · ʻOhana",
  dedication: "献给妈妈、爸爸，和念念",
  credit: "本视频由 Claude Opus 5.5 制作",
};

/** 画面里出现的其他文字（插画标注），也要进字体子集 */
export const EXTRA_GLYPHS = "次日檀香山北仑宁波太平洋东海夏威夷时公里傍晚正午第二天病历零极限家对不起请原谅我谢谢你爱";
