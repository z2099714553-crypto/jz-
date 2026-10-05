// Count the real lines of code behind this video and pick code snippets for the "code rain".
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const files = [];
const walk = (dir) => {
  for (const f of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.(tsx?|py|mjs)$/.test(f.name)) files.push(p);
  }
};
walk(path.join(root, 'src'));
walk(path.join(root, 'scripts'));
files.push(path.join(root, 'remotion.config.ts'));

let lines = 0;
const snippets = [];
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8').split('\n');
  const code = src.filter((l) => l.trim().length > 0);
  lines += code.length;
  for (const l of code) {
    const t = l.trim();
    if (t.length > 12 && t.length < 46 && !/[一-鿿]/.test(t)) snippets.push(t);
  }
}
const pick = snippets.filter((_, i) => i % 3 === 0).slice(0, 160);
fs.writeFileSync(
  path.join(root, 'src/stats.json'),
  JSON.stringify({lines, files: files.length, snippets: pick}, null, 1),
);
console.log(`stats: ${lines} non-empty lines in ${files.length} files`);
