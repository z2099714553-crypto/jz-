import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop, ramp, rise} from '../parts/anim';
import {Pill} from '../parts/Text';
import {gold} from '../theme';
import {cue, type SunkScene} from '../timeline';

const BAR = {x: 700, y: 470, w: 380};
const FORK = {x: BAR.x + BAR.w, y: BAR.y};
const UP = {x: 1360, y: 300};
const DOWN = {x: 1360, y: 650};

const Ticket: React.FC<{p: number}> = ({p}) => (
	<div
		style={{
			position: 'absolute',
			left: 180,
			top: 330,
			width: 380,
			height: 280,
			borderRadius: 24,
			background: `linear-gradient(135deg, ${gold.goldLight}, ${gold.gold} 50%, ${gold.goldDeep})`,
			boxShadow: '0 0 60px rgba(233,180,76,0.35)',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			color: '#3D2606',
			transform: `rotate(${-6 + (1 - p) * -20}deg) scale(${p})`,
		}}
	>
		<div style={{fontFamily: gold.sans, fontSize: 34, fontWeight: 700, letterSpacing: 8}}>电影票</div>
		<div style={{fontFamily: gold.serif, fontSize: 120, fontWeight: 900, lineHeight: 1.1}}>¥50</div>
		{/* 票根缺口 */}
		{[-1, 1].map((s) => (
			<div key={s} style={{position: 'absolute', top: 120, [s < 0 ? 'left' : 'right']: -22, width: 44, height: 44, borderRadius: 22, backgroundColor: gold.bg}} />
		))}
	</div>
);

const Branch: React.FC<{to: {x: number; y: number}; p: number; color: string}> = ({to, p, color}) => {
	const d = `M${FORK.x},${FORK.y} C${FORK.x + 140},${FORK.y} ${to.x - 160},${to.y} ${to.x},${to.y}`;
	const len = 420;
	return <path d={d} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />;
};

/** 日常：50 块电影票 → 看了 20 分钟 → 分叉：走掉 / 看完。 */
export const Movie: React.FC<{scene: SunkScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const tBar = cue(scene, '开场20分钟', 0.25);
	const tLeave = cue(scene, '走掉', 0.5);
	const tStay = cue(scene, '看完', 0.7);
	const tExtra = cue(scene, '再搭上', 0.85);
	const watched = interpolate(frame, [tBar, tBar + 25], [0, 20], clamp);
	const leave = ramp(frame, tLeave, 18);
	const stay = ramp(frame, tStay, 18);
	const extra = pop(frame, tExtra, 30, 10);

	return (
		<AbsoluteFill>
			<Ticket p={pop(frame, 2, 30, 13)} />
			{/* 片长进度条 */}
			<div style={{position: 'absolute', left: BAR.x, top: BAR.y - 4, width: BAR.w, height: 8, borderRadius: 4, backgroundColor: gold.dim, opacity: ramp(frame, tBar - 6, 10)}}>
				<div style={{width: `${(watched / 20) * 100}%`, height: '100%', borderRadius: 4, backgroundColor: gold.silver}} />
			</div>
			<div style={{position: 'absolute', left: BAR.x, top: BAR.y - 70, fontFamily: gold.sans, fontSize: 34, color: gold.text, opacity: ramp(frame, tBar, 10)}}>
				看了 <span style={{color: gold.gold, fontWeight: 700}}>{Math.round(watched)}</span> 分钟：很烂
			</div>
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				<Branch to={UP} p={leave} color={gold.gold} />
				<Branch to={DOWN} p={stay} color={gold.silver} />
			</svg>
			<div style={{position: 'absolute', left: UP.x + 30, top: UP.y - 70, ...rise(ramp(frame, tLeave + 10, 14))}}>
				<div style={{fontFamily: gold.serif, fontSize: 64, fontWeight: 900, color: gold.gold}}>走掉</div>
				<Pill color={gold.text} size={32}>亏 ¥50</Pill>
			</div>
			<div style={{position: 'absolute', left: DOWN.x + 30, top: DOWN.y - 70, ...rise(ramp(frame, tStay + 10, 14))}}>
				<div style={{fontFamily: gold.serif, fontSize: 64, fontWeight: 900, color: gold.silver}}>看完</div>
				<div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
					<Pill color={gold.text} size={32}>亏 ¥50</Pill>
					<div style={{transform: `scale(${extra})`}}>
						<Pill color={gold.loss} size={32} style={{backgroundColor: 'rgba(216,87,75,0.15)', boxShadow: `0 0 30px rgba(216,87,75,${0.5 * extra})`}}>
							+ 100 分钟
						</Pill>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
