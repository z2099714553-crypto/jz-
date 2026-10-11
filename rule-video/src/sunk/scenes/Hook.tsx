import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, ramp} from '../parts/anim';
import {Coin} from '../parts/Coin';
import {GoldTitle} from '../parts/Text';
import {gold} from '../theme';
import type {SunkScene} from '../timeline';

const POOL_Y = 790;
const COINS = Array.from({length: 14}, (_, i) => ({
	x: 640 + ((i * 263) % 640),
	start: i * 6,
	size: 56 + ((i * 37) % 30),
	label: ['¥', '时', '情'][i % 3],
}));

/** 开头：金币一枚枚掉进深池里消失，标题"沉没成本"。第 0 帧就有标题。 */
export const Hook: React.FC<{scene: SunkScene}> = () => {
	const frame = useCurrentFrame();
	// 第 0 帧标题就要清楚，只留一点点收拢的动势
	const title = interpolate(frame, [0, 14], [0.9, 1], clamp);
	const question = interpolate(frame, [0, 12], [0.6, 1], clamp);
	return (
		<AbsoluteFill>
			{/* 深池 */}
			<div
				style={{
					position: 'absolute',
					left: 960 - 520,
					top: POOL_Y - 55,
					width: 1040,
					height: 110,
					borderRadius: '50%',
					background: 'radial-gradient(ellipse at center, #000 40%, rgba(233,180,76,0.18) 75%, transparent 80%)',
					boxShadow: '0 0 80px rgba(233,180,76,0.15)',
				}}
			/>
			{COINS.map((c, i) => {
				const t = frame - c.start;
				const fall = interpolate(t, [0, 26], [-120, POOL_Y - c.size / 2], {...clamp, easing: Easing.in(Easing.quad)});
				const sink = interpolate(t, [26, 40], [1, 0], clamp);
				const ripple = interpolate(t, [26, 56], [0, 1], clamp);
				return (
					<div key={i}>
						{t > 0 && sink > 0 && (
							<Coin
								size={c.size}
								label={c.label}
								style={{
									position: 'absolute',
									left: c.x - c.size / 2,
									top: fall + (1 - sink) * 40,
									opacity: sink,
									transform: `rotate(${t * 9}deg) scaleY(${0.6 + sink * 0.4})`,
								}}
							/>
						)}
						{ripple > 0 && ripple < 1 && (
							<div
								style={{
									position: 'absolute',
									left: c.x - 140 * ripple,
									top: POOL_Y - 20 * ripple,
									width: 280 * ripple,
									height: 40 * ripple,
									borderRadius: '50%',
									border: `2px solid rgba(233,180,76,${0.7 * (1 - ripple)})`,
								}}
							/>
						)}
					</div>
				);
			})}
			<div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36}}>
				<GoldTitle size={170} reveal={title}>
					沉没成本
				</GoldTitle>
				<div style={{fontFamily: gold.sans, fontSize: 52, color: gold.text, letterSpacing: 4, opacity: question, transform: `translateY(${(1 - question) * 20}px)`}}>
					为什么明知道亏，还是<span style={{color: gold.gold}}>停不下来</span>？
				</div>
			</div>
		</AbsoluteFill>
	);
};
