// 从 Google Fonts 下载字体到 public/suanchou/fonts/，渲染时不再需要联网。
// 中文字体（思源宋体 Noto Serif SC）只下载台词里实际用到的字，文件很小。
// 改了 src/suanchou/script.ts 里的台词后运行：npm run fonts
// 需要能访问 fonts.googleapis.com。

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "suanchou", "fonts");
mkdirSync(outDir, { recursive: true });

// 现代浏览器 UA，Google 才会返回 woff2
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const source = readFileSync(join(root, "src", "suanchou", "script.ts"), "utf8");
const glyphs = new Set();
for (const ch of source) {
  if (ch.codePointAt(0) > 0x7f) glyphs.add(ch);
}
for (let c = 0x20; c < 0x7f; c++) glyphs.add(String.fromCharCode(c));
for (const ch of "，。、：；！？“”‘’（）《》——·…π²−×÷→") glyphs.add(ch);
const text = [...glyphs].join("");
console.log(`中文子集共 ${glyphs.size} 个字符`);

async function css(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function download(url, file) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(outDir, file), buf);
  console.log(`  ${file}  ${(buf.length / 1024).toFixed(0)} KB`);
}

// 1. 思源宋体：按字子集，每个字重一个文件
for (const weight of [400, 600]) {
  const sheet = await css(
    `https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@${weight}&text=${encodeURIComponent(text)}`,
  );
  const url = sheet.match(/url\((https:[^)]+)\)/)?.[1];
  if (!url) throw new Error("没有在 CSS 里找到 Noto Serif SC 的字体地址");
  await download(url, `NotoSerifSC-${weight}.woff2`);
}

// 2. EB Garamond：英文字幕与片尾标题，只取 latin 子集
const garamond = await css(
  "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;1,400",
);
const blocks = garamond.split("/* ").filter((b) => b.startsWith("latin */"));
for (const block of blocks) {
  const style = block.match(/font-style:\s*(\w+)/)[1];
  const weight = block.match(/font-weight:\s*(\d+)/)[1];
  const url = block.match(/url\((https:[^)]+)\)/)[1];
  await download(url, `EBGaramond-${weight}${style === "italic" ? "-italic" : ""}.woff2`);
}
console.log("字体已更新。");
