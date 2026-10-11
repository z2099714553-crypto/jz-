import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {pop, ramp} from '../parts/anim';
import {Coin} from '../parts/Coin';
import {GoldTitle, Pill} from '../parts/Text';
import {gold} from '../theme';
import {cue, type SunkScene} from '../timeline';

const PIVOT = {x: 960, y: 250};
const ARM = 400;

const Pan: React.FC<{angle: number; side: -1 | 1; children: React.ReactNode; label: string; color: string}> = ({angle, side, children, label, color}) => {
	const rad = (angle * Math.PI) / 180;
	const x = PIVOT.x + Math.cos(rad) * ARM * side;
	const y = PIVOT.y + Math.sin(rad) * ARM * side;
	return (
		<>
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				<line x1={x} y1={y} x2={x - 110} y2={y + 220} stroke={gold.muted} strokeWidth={2} />
				<line x1={x} y1={y} x2={x + 110} y2={y + 220} stroke={gold.muted} strokeWidth={2} />
				<path d={`M${x - 140},${y + 220} Q${x},${y + 290} ${x + 140},${y + 220} Z`} fill="rgba(233,180,76,0.15)" stroke={color} strokeWidth={3} />
			</svg>
			<div style={{position: 'absolute', left: x - 150, top: y + 90, width: 300, height: 130, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8}}>
				{children}
			</div>
			<div style={{position: 'absolute', left: x - 150, top: y + 300, width: 300, textAlign: 'center', fontFamily: gold.sans, fontSize: 36, fontWeight: 700, color}}>
				{label}
			</div>
		</>
	);
};

/** 为什么：损失厌恶的天平。失去 100 比得到 100 重，右边要放到 200 才平。 */
export const Brain: React.FC<{scene: SunkScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tLoss = cue(scene, '失去100块', 0.3);
	const tGain = cue(scene, '200块', 0.5);
	const tTitle = cue(scene, '抵消', 0.6);
	const tAvoid = cue(scene, '放弃', 0.75);
	// 正角度 = 右边下沉。失去的一边先压下去，加到 200 才回平。
	const tilt = spring({frame: frame - tLoss, fps, config: {damping: 8, mass: 0.8}}) * -14;
	const back = spring({frame: frame - tGain, fps, config: {damping: 8, mass: 0.8}}) * 14;
	const angle = tilt + back;
	const lossPulse = ramp(frame, tAvoid, 10) * (0.5 + 0.5 * Math.sin(frame / 3));

	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				<line x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x} y2={760} stroke={gold.gold} strokeWidth={6} />
				<path d={`M${PIVOT.x - 90},760 L${PIVOT.x + 90},760`} stroke={gold.gold} strokeWidth={8} strokeLinecap="round" />
				<line
					x1={PIVOT.x - Math.cos((angle * Math.PI) / 180) * ARM}
					y1={PIVOT.y - Math.sin((angle * Math.PI) / 180) * ARM}
					x2={PIVOT.x + Math.cos((angle * Math.PI) / 180) * ARM}
					y2={PIVOT.y + Math.sin((angle * Math.PI) / 180) * ARM}
					stroke={gold.goldLight}
					strokeWidth={8}
					strokeLinecap="round"
				/>
				<circle cx={PIVOT.x} cy={PIVOT.y} r={14} fill={gold.goldLight} />
			</svg>
			<Pan angle={angle} side={-1} label="失去" color={gold.loss}>
				<div style={{transform: `scale(${pop(frame, tLoss)})`, borderRadius: '50%', boxShadow: `0 0 ${60 * lossPulse}px ${gold.loss}`}}>
					<Coin size={110} label="100" variant="silver" style={{fontSize: 34}} />
				</div>
			</Pan>
			<Pan angle={angle} side={1} label="得到" color={gold.gold}>
				<div style={{transform: `scale(${pop(frame, 6)})`}}>
					<Coin size={110} label="100" style={{fontSize: 34}} />
				</div>
				<div style={{transform: `scale(${pop(frame, tGain)})`}}>
					<Coin size={110} label="100" style={{fontSize: 34}} />
				</div>
			</Pan>
			<div style={{position: 'absolute', top: 820, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<GoldTitle size={64} reveal={ramp(frame, tTitle, 18)}>
					损失的痛 ≈ 收获快乐的 2 倍
				</GoldTitle>
			</div>
			<div style={{position: 'absolute', top: 120, left: 140, transform: `scale(${pop(frame, tAvoid)})`}}>
				<Pill color={gold.loss} size={32}>放弃 = 承认损失</Pill>
			</div>
			<div style={{position: 'absolute', top: 60, right: 80, fontFamily: gold.sans, fontSize: 22, color: gold.muted, opacity: ramp(frame, 0, 20)}}>
				{'损失厌恶 · Kahneman & Tversky'}
			</div>
		</AbsoluteFill>
	);
};
