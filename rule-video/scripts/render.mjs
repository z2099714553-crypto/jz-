// 用法：npm run render -- episodes/xxx.json [--only=vertical|horizontal]
// 先跑脚本检查，过了再渲染竖版和横版到 out/。
import {spawnSync} from 'node:child_process';
import {basename} from 'node:path';

const file = process.argv[2];
const only = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1];
if (!file) {
	console.error('用法：npm run render -- episodes/xxx.json [--only=vertical|horizontal]');
	process.exit(2);
}

const shell = process.platform === 'win32';
const run = (cmd, args) => spawnSync(cmd, args, {stdio: 'inherit', shell}).status ?? 1;

if (run('node', ['--experimental-strip-types', '--no-warnings', 'scripts/check.ts', file]) !== 0) {
	console.error('\n脚本检查没通过，先改脚本。');
	process.exit(1);
}

const name = basename(file, '.json');
const targets = [
	['vertical', 'RuleVertical', `out/${name}-竖版.mp4`],
	['horizontal', 'RuleHorizontal', `out/${name}-横版.mp4`],
].filter(([key]) => !only || key === only);

for (const [, id, out] of targets) {
	if (run('npx', ['remotion', 'render', id, out, `--props=${file}`]) !== 0) process.exit(1);
}
