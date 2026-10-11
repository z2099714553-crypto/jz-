// 用法：npm run check -- episodes/xxx.json
// 打印时间轴和字幕切分；时长不在 55–65 秒或脚本有错误时退出码为 1。
import {readFileSync} from 'node:fs';
import {captionsFor, validate, type RuleScript} from '../src/lib/timeline.ts';
import {LAYOUTS} from '../src/lib/layout.ts';

const file = process.argv[2];
if (!file) {
	console.error('用法：npm run check -- episodes/xxx.json');
	process.exit(2);
}

const script = JSON.parse(readFileSync(file, 'utf8')) as RuleScript;
const {errors, warnings, timeline} = validate(script);

if (timeline) {
	const sec = (f: number) => (f / 30).toFixed(1).padStart(5);
	console.log(`《${script.title}》 总时长 ${timeline.totalSeconds.toFixed(1)} 秒\n`);
	for (const scene of timeline.scenes) {
		const label = scene.kind === 'point' ? `要点${scene.index + 1}` : scene.kind;
		console.log(`${sec(scene.from)}s  ${label.padEnd(6)} ${(scene.duration / 30).toFixed(1)}s`);
		for (const c of captionsFor(scene, LAYOUTS.vertical.captionMaxChars)) {
			console.log(`         ${sec(scene.from + c.from)}s  ${c.text}`);
		}
	}
	console.log();
}
for (const w of warnings) console.log(`⚠ ${w}`);
for (const e of errors) console.log(`✗ ${e}`);
if (!errors.length) console.log('✓ 可以渲染');
process.exit(errors.length ? 1 : 0);
