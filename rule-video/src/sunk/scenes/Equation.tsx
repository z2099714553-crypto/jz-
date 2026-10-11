import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop, ramp, rise} from '../parts/anim';
import {Coin} from '../parts/Coin';
import {Pill} from '../parts/Text';
import {gold} from '../theme';
import {cue, type SunkScene} from '../timeline';

const ROWS = [
	{name: '继续', future: '未来 A', y: 330},
	{name: '放弃', future: '未来 B', y: 610},
];

/** 继续 = 过去 + 未来A；放弃 = 过去 + 未来B。划掉两边都有的"过去"，只比未来。 */
export const Equation: React.FC<{scene: SunkScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const tStrike = cue(scene, '直接划掉', 0.35);
	const tFuture = cue(scene, '只比较未来', 0.55);
	const tBrain = cue(scene, '偏偏做不到', 0.85);
	const strike = interpolate(frame, [tStrike, tStrike + 14], [0, 1], clamp);
	const focus = pop(frame, tFuture, 30, 14);
	// 大脑做不到：被划掉的"过去"又亮起来，红色脉动
	const relapse = ramp(frame, tBrain, 12);
	const pulse = relapse * (0.5 + 0.5 * Math.sin(frame / 3));

	return (
		<AbsoluteFill>
			{ROWS.map((r, i) => {
				const p = ramp(frame, 4 + i * 10, 16);
				return (
					<div key={r.name} style={{position: 'absolute', top: r.y - 80, left: 300, height: 160, display: 'flex', alignItems: 'center', gap: 56, ...rise(p)}}>
						<div style={{fontFamily: gold.serif, fontWeight: 900, fontSize: 76, color: gold.text, width: 170}}>{r.name}</div>
						<div style={{fontFamily: gold.sans, fontSize: 64, color: gold.muted}}>=</div>
						<div style={{position: 'relative', opacity: 1 - strike * 0.65 + relapse * 0.65}}>
							<Coin size={130} label="过去" variant={relapse > 0 ? 'gold' : 'silver'} style={{fontSize: 34, boxShadow: `0 0 ${60 * pulse}px ${gold.loss}`}} />
							<div
								style={{
									position: 'absolute',
									left: -30,
									top: 62,
									width: 190 * strike,
									height: 6,
									borderRadius: 3,
									backgroundColor: gold.loss,
									transform: 'rotate(-18deg)',
									transformOrigin: 'left center',
									boxShadow: `0 0 12px ${gold.loss}`,
								}}
							/>
						</div>
						<div style={{fontFamily: gold.sans, fontSize: 64, color: gold.muted}}>+</div>
						<div style={{transform: `scale(${1 + focus * 0.18})`, transformOrigin: 'left center'}}>
							<Pill color={gold.gold} size={52} style={{boxShadow: `0 0 ${40 * focus}px rgba(233,180,76,0.5)`, backgroundColor: `rgba(233,180,76,${0.12 * focus})`}}>
								{r.future}
							</Pill>
						</div>
					</div>
				);
			})}
			{/* 两个未来之间的比较 */}
			<div
				style={{
					position: 'absolute',
					left: 1390,
					top: 330,
					height: 280,
					width: 4,
					background: `linear-gradient(180deg, ${gold.gold}, transparent 45%, transparent 55%, ${gold.gold})`,
					opacity: focus,
				}}
			/>
			<div style={{position: 'absolute', left: 1430, top: 440, fontFamily: gold.serif, fontWeight: 900, fontSize: 64, color: gold.gold, opacity: focus}}>
				比这个
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center', opacity: relapse}}>
				<Pill color={gold.loss} size={34}>
					大脑：可是我已经花了……
				</Pill>
			</div>
		</AbsoluteFill>
	);
};
