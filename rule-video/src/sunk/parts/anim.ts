import {Easing, interpolate, spring} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 从 start 帧开始，用 len 帧从 0 过渡到 1（缓出）。 */
export const ramp = (frame: number, start: number, len = 15) =>
	interpolate(frame, [start, start + len], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

/** 从 start 帧开始的弹簧，0 → 1，带一点回弹。 */
export const pop = (frame: number, start: number, fps = 30, damping = 12) =>
	spring({frame: frame - start, fps, config: {damping, mass: 0.6}});

/** 淡入 + 上浮的样式。 */
export const rise = (p: number, dist = 30) => ({opacity: p, transform: `translateY(${(1 - p) * dist}px)`});

export {clamp};
