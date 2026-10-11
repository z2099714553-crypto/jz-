import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {pop, ramp} from '../parts/anim';
import {Coin} from '../parts/Coin';
import {GoldTitle, Pill} from '../parts/Text';
import {useStage} from '../parts/stage';
import {gold} from '../theme';
import {cue, type SunkScene} from '../timeline';

type Geo = {px: number; py: number; arm: number; w: number; h: number};

const Pan: React.FC<{g: Geo; angle: number; side: -1 | 1; children: React.ReactNode; label: string; color: string}> = ({g, angle, side, children, label, color}) => {
	const PIVOT = {x: g.px, y: g.py};
	const ARM = g.arm;
	const rad = (angle * Math.PI) / 180;
	const x = PIVOT.x + Math.cos(rad) * ARM * side;
	const y = PIVOT.y + Math.sin(rad) * ARM * side;
	return (
		<>
			<svg width={g.w} height={g.h} style={{position: 'absolute', inset: 0}}>
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
	const {v, w, h, cx} = useStage();
	const g: Geo = v ? {px: cx - 40, py: 560, arm: 320, w, h} : {px: 960, py: 250, arm: 400, w, h};
	const PIVOT = {x: g.px, y: g.py};
	const ARM = g.arm;
	const baseY = g.py + 510;
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
			<svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
				<line x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x} y2={baseY} stroke={gold.gold} strokeWidth={6} />
				<path d={`M${PIVOT.x - 90},${baseY} L${PIVOT.x + 90},${baseY}`} stroke={gold.gold} strokeWidth={8} strokeLinecap="round" />
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
			<Pan g={g} angle={angle} side={-1} label="失去" color={gold.loss}>
				<div style={{transform: `scale(${pop(frame, tLoss)})`, borderRadius: '50%', boxShadow: `0 0 ${60 * lossPulse}px ${gold.loss}`}}>
					<Coin size={110} label="100" variant="silver" style={{fontSize: 34}} />
				</div>
			</Pan>
			<Pan g={g} angle={angle} side={1} label="得到" color={gold.gold}>
				<div style={{transform: `scale(${pop(frame, 6)})`}}>
					<Coin size={110} label="100" style={{fontSize: 34}} />
				</div>
				<div style={{transform: `scale(${pop(frame, tGain)})`}}>
					<Coin size={110} label="100" style={{fontSize: 34}} />
				</div>
			</Pan>
			<div style={{position: 'absolute', top: v ? 1110 : 820, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<GoldTitle size={v ? 70 : 64} reveal={ramp(frame, tTitle, 18)}>
					{v ? '损失的痛\n≈ 收获快乐的 2 倍' : '损失的痛 ≈ 收获快乐的 2 倍'}
				</GoldTitle>
			</div>
			<div style={{position: 'absolute', top: v ? 300 : 120, left: v ? 60 : 140, transform: `scale(${pop(frame, tAvoid)})`}}>
				<Pill color={gold.loss} size={32}>放弃 = 承认损失</Pill>
			</div>
			<div style={{position: 'absolute', top: v ? 1340 : 60, right: v ? undefined : 80, left: v ? 0 : undefined, width: v ? w - 100 : undefined, textAlign: 'center', fontFamily: gold.sans, fontSize: v ? 26 : 22, color: gold.muted, opacity: ramp(frame, 0, 20)}}>
				{'损失厌恶 · Kahneman & Tversky'}
			</div>
		</AbsoluteFill>
	);
};
