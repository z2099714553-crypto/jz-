import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {gold, H, W} from '../theme';

// 固定的"随机"光线，保证每次渲染一样
const STREAKS = Array.from({length: 18}, (_, i) => ({
	y: ((i * 397) % 1000) / 1000,
	len: 0.25 + ((i * 131) % 100) / 200,
	speed: 0.4 + ((i * 53) % 10) / 10,
	alpha: 0.05 + ((i * 29) % 10) / 100,
}));

/** 暖黑底 + 缓慢漂移的水平光线 + 透视地板线 + 中心金色辉光。 */
export const Background: React.FC<{glow?: number}> = ({glow = 1}) => {
	const frame = useCurrentFrame();
	const horizon = H * 0.62;
	return (
		<AbsoluteFill style={{backgroundColor: gold.bg, overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `radial-gradient(ellipse 55% 45% at 50% 55%, rgba(233,180,76,${0.13 * glow}), transparent 70%)`,
				}}
			/>
			{STREAKS.map((s, i) => {
				const x = ((frame * s.speed * 1.5 + i * 300) % (W * 1.6)) - W * 0.3;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							top: s.y * H,
							left: x,
							width: s.len * W,
							height: 1,
							background: `linear-gradient(90deg, transparent, rgba(233,180,76,${s.alpha}), transparent)`,
						}}
					/>
				);
			})}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				{Array.from({length: 9}, (_, i) => {
					// 越靠下间距越大，形成透视
					const t = (i + 1) / 9;
					const y = horizon + (H - horizon) * t * t;
					return <line key={i} x1={0} x2={W} y1={y} y2={y} stroke="#E9B44C" strokeOpacity={0.05 + t * 0.06} strokeWidth={1} />;
				})}
			</svg>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.65) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};
