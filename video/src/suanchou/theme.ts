import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const C = {
  ink: "#2A2521",
  inkSoft: "#5B524A",
  paper: "#EEE6D6",
  paperDeep: "#E2D5BE",
  night: "#0B0908",
  cinnabar: "#B8452F", // 朱砂红
  cinnabarSoft: "#D8795C",
  bamboo: "#CDA66C",
  bambooLight: "#E6C990",
  bambooDark: "#8C6534",
  bronze: "#B37A43",
  bronzeLight: "#E0AE6E",
  bronzeDark: "#6A4420",
  candle: "#F5B85C",
  moon: "#EFE7D8",
};

export const FONT_ZH = "'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif";
export const FONT_EN = "'EB Garamond', 'Garamond', 'Times New Roman', serif";

const fonts: Parameters<typeof loadFont>[0][] = [
  { family: "Noto Serif SC", url: staticFile("suanchou/fonts/NotoSerifSC-400.woff2"), weight: "400" },
  { family: "Noto Serif SC", url: staticFile("suanchou/fonts/NotoSerifSC-600.woff2"), weight: "600" },
  { family: "EB Garamond", url: staticFile("suanchou/fonts/EBGaramond-400.woff2"), weight: "400 600" },
  {
    family: "EB Garamond",
    url: staticFile("suanchou/fonts/EBGaramond-400-italic.woff2"),
    weight: "400",
    style: "italic",
  },
];

let loaded = false;
export const ensureFonts = () => {
  if (loaded) return;
  loaded = true;
  for (const f of fonts) loadFont(f);
};
