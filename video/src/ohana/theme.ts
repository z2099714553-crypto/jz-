import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/** 夏威夷章节：深蓝海色 */
export const SEA = {
  abyss: "#040B14",
  night: "#071526",
  deep: "#0B2239",
  sea: "#103452",
  teal: "#1E5C74",
  haze: "#5E8FA3",
  foam: "#D7E8EC",
  moon: "#EEF4F4",
  lamp: "#F2B866",
  lampDeep: "#D9822B",
};

/** 家庭章节：暖米白 */
export const HOME = {
  paper: "#F3ECDF",
  beige: "#E8DCC6",
  sand: "#D9C7A7",
  ink: "#2B2622",
  inkSoft: "#5E554C",
};

/** 贯穿全片的小红点 */
export const RED = "#C4493A";
export const CORAL = "#E7A08A";

export const FONT_ZH = "'Noto Serif SC', 'EB Garamond', 'Songti SC', 'STSong', serif";
export const FONT_EN = "'EB Garamond', 'Garamond', 'Times New Roman', serif";

const fonts: Parameters<typeof loadFont>[0][] = [
  { family: "Noto Serif SC", url: staticFile("ohana/fonts/NotoSerifSC-400.woff2"), weight: "400" },
  { family: "Noto Serif SC", url: staticFile("ohana/fonts/NotoSerifSC-600.woff2"), weight: "600" },
  { family: "EB Garamond", url: staticFile("ohana/fonts/EBGaramond-400.woff2"), weight: "400 600" },
  { family: "EB Garamond", url: staticFile("ohana/fonts/EBGaramond-400-italic.woff2"), weight: "400", style: "italic" },
];

let loaded = false;
export const ensureFonts = () => {
  if (loaded) return;
  loaded = true;
  for (const f of fonts) loadFont(f);
};
