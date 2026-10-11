import {speechUnits, FPS} from '../lib/timeline';

export const SCENE_IDS = [
	'hook',
	'definition',
	'equation',
	'movie',
	'montage',
	'love',
	'loveQuestion',
	'career',
	'brain',
	'method',
	'outro',
] as const;
export type SceneId = (typeof SCENE_IDS)[number];

export type SunkSceneInput = {
	id: SceneId;
	/** 左上角的章节名 */
	chapter?: string;
	narration: string;
	/** 字幕里标成金色的词 */
	highlight?: string[];
	/** 录好配音后用实际秒数覆盖 */
	seconds?: number;
};

export type SunkScript = {
	title: string;
	scenes: SunkSceneInput[];
	voiceover?: string;
	charsPerSecond?: number;
};

export type SunkScene = SunkSceneInput & {from: number; duration: number; speechRatio: number};

// 每个场景至少留够动画时间
const MIN_SECONDS: Partial<Record<SceneId, number>> = {hook: 6, equation: 8, movie: 10, love: 10, career: 10, brain: 9, method: 9, outro: 6};
const TAIL = 0.6;

export function buildSunkTimeline(script: SunkScript) {
	const cps = script.charsPerSecond ?? 4.5;
	let from = 0;
	const scenes: SunkScene[] = script.scenes.map((s) => {
		const speech = speechUnits(s.narration) / cps;
		const seconds = s.seconds ?? Math.max(MIN_SECONDS[s.id] ?? 4, speech + TAIL);
		const duration = Math.round(seconds * FPS);
		const scene = {...s, from, duration, speechRatio: s.seconds ? 0.95 : Math.min(1, speech / seconds)};
		from += duration;
		return scene;
	});
	return {scenes, totalFrames: from};
}

/** 口播念到 phrase 的那一帧（相对场景开头）。动画按这个对齐，换了配音也能跟上。 */
export function cue(scene: SunkScene, phrase: string, fallback = 0.5): number {
	const i = scene.narration.indexOf(phrase);
	if (i < 0) return Math.round(scene.duration * fallback);
	const total = speechUnits(scene.narration) || 1;
	return Math.round((speechUnits(scene.narration.slice(0, i)) / total) * scene.duration * scene.speechRatio);
}
