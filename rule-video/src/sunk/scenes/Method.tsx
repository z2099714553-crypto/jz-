import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop, ramp, rise} from '../parts/anim';
import {Coin} from '../parts/Coin';
import {Pill} from '../parts/Text';
import {gold} from '../theme';
import {cue, type SunkScene} from '../timeline';

/** 怎么办：三步卡片，每张都有自己的小动画。 */
export const Method: React.FC<{scene: SunkScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const t = [cue(scene, '划掉', 0.3), cue(scene, '只比较未来', 0.45), cue(scene, '如果从零开始', 0.65)];
	const tAsk = cue(scene, '我还会选它吗', 0.85);
	const strike = interpolate(frame, [t[0] + 10, t[0] + 24], [0, 1], clamp);
	const swing = Math.sin(frame / 8) * 8 * ramp(frame, t[1], 10);
	const loop = interpolate(frame, [t[2] + 6, t[2] + 36], [0, 1], clamp);
	const ask = ramp(frame, tAsk, 14);

	const illos = [
		<div key="a" style={{position: 'relative'}}>
			<Coin size={130} label="已花" variant="dim" style={{fontSize: 36}} />
			<div style={{position: 'absolute', left: -20, top: 62, width: 170 * strike, height: 7, borderRadius: 4, backgroundColor: gold.loss, transform: 'rotate(-20deg)', transformOrigin: 'left center'}} />
		</div>,
		<div key="b" style={{display: 'flex', alignItems: 'center', gap: 20, transform: `rotate(${swing}deg)`}}>
			<Pill color={gold.gold} size={36}>A</Pill>
			<div style={{fontFamily: gold.serif, fontSize: 44, color: gold.text}}>vs</div>
			<Pill color={gold.gold} size={36}>B</Pill>
		</div>,
		<svg key="c" width={150} height={150} viewBox="0 0 100 100">
			<circle cx={50} cy={50} r={38} fill="none" stroke={gold.dim} strokeWidth={6} />
			<circle cx={50} cy={50} r={38} fill="none" stroke={gold.gold} strokeWidth={6} strokeLinecap="round" strokeDasharray={239} strokeDashoffset={239 * (1 - loop)} transform="rotate(-90 50 50)" />
			<text x={50} y={64} textAnchor="middle" fontSize={40} fontWeight={900} fill={gold.goldLight} fontFamily={gold.serif}>0</text>
		</svg>,
	];
	const titles = ['划掉已经花掉的', '只比较未来', '从零开始，还会选吗？'];

	return (
		<AbsoluteFill>
			{titles.map((title, i) => {
				const p = pop(frame, t[i], 30, 14);
				const glow = i === 2 ? ask : 0;
				return (
					<div
						key={title}
						style={{
							position: 'absolute',
							left: 230 + i * 500,
							top: 230,
							width: 460,
							height: 500,
							borderRadius: 28,
							border: `2px solid ${gold.gold}${i === 2 && ask > 0 ? 'CC' : '55'}`,
							background: 'linear-gradient(180deg, rgba(36,30,20,0.9), rgba(14,14,18,0.9))',
							boxShadow: `0 0 ${70 * glow}px rgba(233,180,76,0.45)`,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'space-evenly',
							...rise(p, 60),
						}}
					>
						<div style={{fontFamily: gold.serif, fontWeight: 900, fontSize: 80, color: gold.gold}}>{i + 1}</div>
						<div style={{height: 160, display: 'flex', alignItems: 'center'}}>{illos[i]}</div>
						<div style={{fontFamily: gold.sans, fontWeight: 700, fontSize: 38, color: gold.text}}>{title}</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};
