import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, ramp} from '../parts/anim';
import {StickFigure} from '../parts/StickFigure';
import {GoldTitle} from '../parts/Text';
import {useStage} from '../parts/stage';
import {gold} from '../theme';
import type {SunkScene} from '../timeline';

/** 两个陌生人从两边走近，上方是那个问题。 */
export const LoveQuestion: React.FC<{scene: SunkScene}> = () => {
	const frame = useCurrentFrame();
	const {v, cx, w} = useStage();
	const figY = v ? 900 : 520;
	const meet = v ? 160 : 200; // 走到中心两侧多远停下
	const walk = interpolate(frame, [0, 60], [0, 1], {...clamp, easing: (t) => 1 - (1 - t) ** 2});
	const walking = walk < 1 ? frame : undefined;
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: v ? 420 : 170, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<GoldTitle size={v ? 84 : 92} reveal={ramp(frame, 4, 22)}>
					{'如果今天才认识 TA\n你还会选吗？'}
				</GoldTitle>
			</div>
			<div style={{position: 'absolute', top: figY, left: 40 + walk * (cx - meet - 65 - 40)}}>
				<StickFigure height={260} color={gold.silver} walk={walking} />
			</div>
			<div style={{position: 'absolute', top: figY, left: w - 170 - walk * (w - 170 - (cx + meet - 65))}}>
				<StickFigure height={260} color={gold.goldLight} walk={walking} facing={-1} glow />
			</div>
			<div
				style={{
					position: 'absolute',
					top: figY + 80,
					left: cx - 6,
					width: 12,
					height: 12,
					borderRadius: 6,
					backgroundColor: gold.gold,
					boxShadow: `0 0 ${30 + 20 * Math.sin(frame / 5)}px ${gold.gold}`,
					opacity: ramp(frame, 55, 12),
				}}
			/>
		</AbsoluteFill>
	);
};
