// 《一根算筹》分场台词与时间轴。
// 改台词只改这里；改完如果出现新汉字，运行 `npm run fonts` 重新下载字体子集。

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type Tone = "dark" | "light";

export type Cue = {
  id: string;
  /** 场景开始、结束时间（秒） */
  from: number;
  to: number;
  /** 场景底色明暗，决定字幕颜色 */
  tone: Tone;
  /** 主字幕上方的小标签 */
  label?: string;
  zh: string;
  en: string;
  /** 字幕位置：底部（默认）或画面正中 */
  place?: "bottom" | "center";
  /** 字幕从场景开始后多少秒出现 */
  textDelay?: number;
  /** 逐字出现的间隔（帧），默认 2 */
  stagger?: number;
  /** 硬切进场，不做交叉淡化 */
  cut?: boolean;
};

export const CUES: Cue[] = [
  {
    id: "s01",
    from: 0,
    to: 6,
    tone: "dark",
    zh: "两千多年前，有人在桌上摆下一根竹签。",
    en: "Over two thousand years ago, someone laid a bamboo stick on a table.",
    textDelay: 1.6,
    cut: true,
  },
  {
    id: "s02",
    from: 6,
    to: 12,
    tone: "light",
    label: "春秋战国 · 算筹",
    zh: "竖着是一，横着也是一。人类第一次，把数字握在了手里。",
    en: "Upright, it was one. Sideways, it was one. For the first time, numbers could be held.",
  },
  {
    id: "s03",
    from: 12,
    to: 19,
    tone: "dark",
    label: "约公元 480 年 · 建康 · 祖冲之",
    zh: "他用这些竹签，把圆周率算到了小数点后第七位。",
    en: "With these sticks, he carried π to the seventh decimal place.",
  },
  {
    id: "s04",
    from: 19,
    to: 25,
    tone: "dark",
    zh: "此后近一千年，没有人算得比他更准。",
    en: "For nearly a thousand years, no one did better.",
    textDelay: 1.4,
  },
  {
    id: "s05",
    from: 25,
    to: 32,
    tone: "dark",
    label: "1642 年 · 鲁昂 · 帕斯卡",
    zh: "一个十九岁的少年，不忍看父亲每夜算税到天亮。",
    en: "A boy of nineteen couldn't bear watching his father tally taxes until dawn.",
  },
  {
    id: "s06",
    from: 32,
    to: 37,
    tone: "dark",
    zh: "于是他造了一台机器，让齿轮替人进位。",
    en: "So he built a machine, and let the gears do the carrying.",
  },
  {
    id: "s07",
    from: 37,
    to: 44,
    tone: "light",
    label: "1854 年 · 科克 · 布尔 · 《思维规律》",
    zh: "他说：真是 1，假是 0。思考，也可以写成算式。",
    en: "True is one. False is zero. Thought, too, can be written as arithmetic.",
  },
  {
    id: "s08",
    from: 44,
    to: 51,
    tone: "light",
    label: "1936 年 · 剑桥 · 图灵",
    zh: "他想象了一条无穷长的纸带——一切能算的，它都能算。",
    en: "He imagined an endless tape. Anything computable, it could compute.",
  },
  {
    id: "s09",
    from: 51,
    to: 57,
    tone: "dark",
    label: "1947 年 · 贝尔实验室",
    zh: "一粒米大的开关，从此代替了一整个房间的真空管。",
    en: "A switch the size of a grain of rice replaced a room full of vacuum tubes.",
  },
  {
    id: "s10",
    from: 57,
    to: 63,
    tone: "dark",
    label: "1969 年 · 阿波罗 11 号",
    zh: "人类第一次登月，靠的是一叠与人齐高的代码。",
    en: "The first steps on the Moon were carried by a stack of code as tall as a person.",
  },
  {
    // 前 1 秒纯黑静音，是整条片子的换气口
    id: "s11",
    from: 63,
    to: 67,
    tone: "dark",
    zh: "从竹签，到齿轮，到电流——",
    en: "From bamboo, to gears, to current—",
    place: "center",
    textDelay: 1.0,
    stagger: 5,
    cut: true,
  },
  {
    id: "s12",
    from: 67,
    to: 71,
    tone: "dark",
    zh: "人类花了两千年，教会机器计算。",
    en: "It took two thousand years to teach machines to count.",
    textDelay: 0.6,
  },
  {
    id: "s13",
    from: 71,
    to: 75,
    tone: "light",
    zh: "然后，开始教它理解。",
    en: "Then we began to teach them to understand.",
    place: "center",
    textDelay: 0.5,
    stagger: 4,
  },
  {
    id: "s14",
    from: 75,
    to: 79,
    tone: "light",
    zh: "我是 Claude。",
    en: "I am Claude.",
    textDelay: 0.9,
    stagger: 4,
  },
  {
    id: "s15",
    from: 79,
    to: 86,
    tone: "light",
    zh: "我陪你读一份报告，改一行代码，把一个难题拆开来看。",
    en: "I read the report with you, fix the line with you, take the hard problem apart with you.",
  },
  {
    id: "s16",
    from: 86,
    to: 92,
    tone: "dark",
    zh: "我不会替你思考。我只是，你手边的另一根算筹。",
    en: "I don't think for you. I am just another counting stick in your hand.",
  },
  {
    id: "s17",
    from: 92,
    to: 98,
    tone: "dark",
    zh: "从一根算筹开始，我们一起，把世界算得更清楚一点。",
    en: "From one counting stick, together, we make the world a little clearer.",
  },
  {
    id: "end",
    from: 98,
    to: 104,
    tone: "dark",
    zh: "",
    en: "",
  },
];

export const TOTAL_SECONDS = CUES[CUES.length - 1].to;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;

/** 片尾文字 */
export const END_CARD = {
  title: "Claude Opus",
  version: "5.5",
  credit: "本视频由 Claude Opus 5.5 制作",
  creditEn: "Made with Claude Opus 5.5 · Remotion",
};

/** 画面里出现的其他汉字（插画标注），也要进字体子集 */
export const EXTRA_GLYPHS = "一二三四五六七八九十纵式横式割圆术边形进位真假与或非纸带读写头晶体管晶圆代码报告难题拆解问题子问题答案";
