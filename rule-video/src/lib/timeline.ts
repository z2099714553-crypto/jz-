// 脚本格式、时长估算、字幕切分、校验。
// 这个文件不依赖任何 npm 包：Remotion 渲染时用它，scripts/check.ts 也直接用 Node 跑它。

export type ChartItem = {label: string; value: number};

export type Chart = {
	type: 'bar' | 'line';
	title?: string;
	unit?: string;
	items: ChartItem[];
	/** 高亮第几项（从 0 开始），默认最后一项 */
	highlight?: number;
	source?: string;
};

/** 配图：用代码画的示意图，或 public/ 下你自己的图片 */
export type Visual =
	| {type: 'progress'; value: number; label?: string; note?: string}
	| {type: 'people'; count: number; highlight?: number; label?: string}
	| {type: 'network'; count: number; center?: string; label?: string}
	| {type: 'number'; value: number; unit?: string; label?: string}
	| {type: 'image'; src: string; caption?: string};

export const VISUAL_TYPES = ['progress', 'people', 'network', 'number', 'image'] as const;

export type Segment = {
	/** 屏幕上的大字 */
	text: string;
	visual?: Visual;
	/** 口播 / 字幕。时长按它的字数估算 */
	narration: string;
	/** 录好配音后，用实际秒数覆盖估算 */
	seconds?: number;
};

export type Point = Segment & {chart?: Chart};

export type RuleScript = {
	/** 本期标题，显示在顶部 */
	title: string;
	/** 开头结论。用 **关键词** 标出要高亮的部分 */
	hook: Segment;
	/** 3 到 5 个要点 */
	points: Point[];
	outro: Segment & {cta?: string};
	/** public/ 下的配音文件名，可选 */
	voiceover?: string;
	accent?: string;
	/** 语速，默认每秒 4.5 字 */
	charsPerSecond?: number;
};

export const FPS = 30;
export const TARGET_SECONDS = {min: 55, max: 65} as const;

const DEFAULT_CPS = 4.5;
const TAIL_PAD = 0.35;
const MIN_SECONDS = {hook: 2.2, point: 2.5, chart: 4.5, outro: 3};

const CJK = /[㐀-鿿豈-﫿]/;
const DIGIT = /[0-9]/;
const PAUSE = /[，。！？；：,!?;:…]/;

/** 估算一段话的"音节数"：汉字和数字各算 1，英文单词算 1.5，% 读作"百分之"算 3，标点算停顿。 */
export function speechUnits(text: string): number {
	let units = (text.match(/[A-Za-z]+/g) ?? []).length * 1.5;
	const chars = [...text];
	chars.forEach((ch, i) => {
		if (CJK.test(ch) || DIGIT.test(ch)) units += 1;
		else if (ch === '%') units += 3;
		else if (ch === '.' && DIGIT.test(chars[i - 1] ?? '') && DIGIT.test(chars[i + 1] ?? '')) units += 1;
		else if (PAUSE.test(ch)) units += 0.6;
	});
	return units;
}

const len = (s: string) => [...s].length;

function pack(tokens: string[], size: number): string[] {
	const out: string[] = [];
	let current = '';
	for (const token of tokens) {
		if (current && len(current) + len(token) > size) {
			out.push(current);
			current = '';
		}
		current += token;
	}
	if (current) out.push(current);
	return out;
}

/** 把口播切成一屏一句的字幕。按标点断句，过长的句子均分，数字和英文不拆开。 */
export function splitCaptions(text: string, maxChars: number): string[] {
	const sentences = text
		.split(/(?<=[，。！？；：、,!?;:…])/)
		.map((s) => s.trim().replace(/[，。；：、,;:…]+$/, ''))
		.filter(Boolean);

	const chunks: string[] = [];
	for (const sentence of sentences) {
		if (len(sentence) <= maxChars) {
			chunks.push(sentence);
			continue;
		}
		// 尽量均分：从平均长度开始往上试，直到切出的段数不超过理论最少段数
		const tokens = sentence.match(/[A-Za-z0-9.%]+|./gu) ?? [];
		const target = Math.ceil(len(sentence) / maxChars);
		let best: string[] = [];
		for (let size = Math.ceil(len(sentence) / target); size <= maxChars; size++) {
			best = pack(tokens, size);
			if (best.length <= target) break;
		}
		chunks.push(...best);
	}

	// 太碎的短句和相邻句合并，免得字幕闪一下就没了
	const merged: string[] = [];
	for (const chunk of chunks) {
		const last = merged[merged.length - 1];
		if (last && (len(last) < 5 || len(chunk) < 4) && len(last) + len(chunk) + 1 <= maxChars) {
			merged[merged.length - 1] = `${last} ${chunk}`;
		} else {
			merged.push(chunk);
		}
	}
	return merged;
}

export type SceneKind = 'hook' | 'point' | 'outro';

export type Scene = {
	kind: SceneKind;
	/** 要点序号；hook 和 outro 为 0 */
	index: number;
	from: number;
	duration: number;
	narration: string;
	/** 配音时长占场景的比例，剩下的是换气 */
	speechRatio: number;
};

export type Timeline = {scenes: Scene[]; totalFrames: number; totalSeconds: number};

export function buildTimeline(script: RuleScript): Timeline {
	const cps = script.charsPerSecond ?? DEFAULT_CPS;
	const segments: {kind: SceneKind; index: number; seg: Segment; min: number}[] = [
		{kind: 'hook', index: 0, seg: script.hook, min: MIN_SECONDS.hook},
		...script.points.map((p, i) => ({
			kind: 'point' as const,
			index: i,
			seg: p,
			min: p.chart || p.visual ? MIN_SECONDS.chart : MIN_SECONDS.point,
		})),
		{kind: 'outro', index: 0, seg: script.outro, min: MIN_SECONDS.outro},
	];

	let from = 0;
	const scenes = segments.map(({kind, index, seg, min}) => {
		const speech = speechUnits(seg.narration) / cps;
		const seconds = seg.seconds ?? Math.max(min, speech + TAIL_PAD);
		const duration = Math.round(seconds * FPS);
		const speechRatio = seg.seconds ? 0.95 : Math.min(1, speech / seconds);
		const scene: Scene = {kind, index, from, duration, narration: seg.narration, speechRatio};
		from += duration;
		return scene;
	});
	return {scenes, totalFrames: from, totalSeconds: from / FPS};
}

export type Caption = {text: string; from: number; duration: number};

/** 场景内的字幕时间轴（帧，相对场景开头），按每句的音节数分配时长。 */
export function captionsFor(scene: Scene, maxChars: number): Caption[] {
	const chunks = splitCaptions(scene.narration, maxChars);
	const weights = chunks.map((c) => Math.max(1, speechUnits(c)));
	const total = weights.reduce((a, b) => a + b, 0);
	const speechFrames = scene.duration * scene.speechRatio;
	let cursor = 0;
	return chunks.map((text, i) => {
		const from = Math.round(cursor);
		cursor += (weights[i] / total) * speechFrames;
		// 最后一句一直留到场景结束
		const end = i === chunks.length - 1 ? scene.duration : Math.round(cursor);
		return {text, from, duration: Math.max(1, end - from)};
	});
}

/** 把 "砍到 **99%** 只要几刀" 拆成 [{text, strong}]。 */
export function parseEmphasis(text: string): {text: string; strong: boolean}[] {
	return text
		.split(/\*\*(.+?)\*\*/)
		.map((part, i) => ({text: part, strong: i % 2 === 1}))
		.filter((p) => p.text);
}

export const plainText = (text: string) => text.replace(/\*\*/g, '');

export type Report = {errors: string[]; warnings: string[]; timeline?: Timeline};

export function validate(script: RuleScript): Report {
	const errors: string[] = [];
	const warnings: string[] = [];
	const need = (ok: unknown, msg: string) => ok || errors.push(msg);

	need(typeof script.title === 'string' && script.title, '缺少 title');
	for (const [name, seg] of [
		['hook', script.hook],
		['outro', script.outro],
	] as const) {
		need(seg && typeof seg.text === 'string' && seg.text, `${name}.text 不能为空`);
		need(seg && typeof seg.narration === 'string', `${name}.narration 必须是字符串`);
	}
	need(Array.isArray(script.points), 'points 必须是数组');
	if (errors.length) return {errors, warnings};

	if (script.points.length < 3 || script.points.length > 5) {
		errors.push(`要点要 3 到 5 个，现在是 ${script.points.length} 个`);
	}
	if (len(plainText(script.hook.text)) > 14) {
		warnings.push(`开头结论 ${len(plainText(script.hook.text))} 字，超过 14 字，2 秒内读不完`);
	}

	let charts = 0;
	script.points.forEach((p, i) => {
		const at = `points[${i}]`;
		need(typeof p.text === 'string' && p.text, `${at}.text 不能为空`);
		need(typeof p.narration === 'string', `${at}.narration 必须是字符串`);
		if (typeof p.text === 'string' && len(p.text) > 16) warnings.push(`${at}.text 超过 16 字，竖版会换成三行`);
		if (!p.chart) return;
		charts++;
		const c = p.chart;
		need(c.type === 'bar' || c.type === 'line', `${at}.chart.type 只能是 bar 或 line`);
		need(Array.isArray(c.items) && c.items.length >= 2, `${at}.chart.items 至少 2 项`);
		if (!Array.isArray(c.items)) return;
		if (c.items.length > 8) warnings.push(`${at}.chart.items 有 ${c.items.length} 项，竖版超过 8 项会挤`);
		c.items.forEach((item, j) =>
			need(Number.isFinite(item.value) && item.value >= 0, `${at}.chart.items[${j}].value 必须是非负数`),
		);
		if (c.highlight !== undefined && (c.highlight < 0 || c.highlight >= c.items.length)) {
			errors.push(`${at}.chart.highlight 超出范围`);
		}
		if (!c.source) warnings.push(`${at}.chart 没写 source，数据来源要交代`);
	});
	if (!charts) warnings.push('没有任何图表，至少给一个要点配 chart');

	const segments: [string, Segment][] = [
		['hook', script.hook],
		...script.points.map((p, i): [string, Segment] => [`points[${i}]`, p]),
		['outro', script.outro],
	];
	for (const [at, seg] of segments) {
		const v = seg.visual;
		if (!v) continue;
		if (!VISUAL_TYPES.includes(v.type)) {
			errors.push(`${at}.visual.type 只能是 ${VISUAL_TYPES.join(' / ')}`);
			continue;
		}
		if ('chart' in seg && seg.chart) warnings.push(`${at} 同时有 chart 和 visual，只显示 chart`);
		if (v.type === 'progress') need(v.value >= 0 && v.value <= 100, `${at}.visual.value 是百分比，要在 0 到 100 之间`);
		if (v.type === 'people' || v.type === 'network') need(Number.isInteger(v.count) && v.count > 0, `${at}.visual.count 必须是正整数`);
		if (v.type === 'number') need(Number.isFinite(v.value), `${at}.visual.value 必须是数字`);
		if (v.type === 'image') need(typeof v.src === 'string' && v.src, `${at}.visual.src 要写 public/ 下的文件名`);
	}
	if (errors.length) return {errors, warnings};

	const timeline = buildTimeline(script);
	const {min, max} = TARGET_SECONDS;
	const cps = script.charsPerSecond ?? DEFAULT_CPS;
	if (timeline.totalSeconds < min) {
		errors.push(`总时长 ${timeline.totalSeconds.toFixed(1)} 秒，短于 ${min} 秒，口播大约再加 ${Math.ceil((min - timeline.totalSeconds) * cps)} 字`);
	} else if (timeline.totalSeconds > max) {
		errors.push(`总时长 ${timeline.totalSeconds.toFixed(1)} 秒，长于 ${max} 秒，口播大约要删 ${Math.ceil((timeline.totalSeconds - max) * cps)} 字`);
	}
	return {errors, warnings, timeline};
}
