import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop, ramp} from '../parts/anim';
import {StickFigure} from '../parts/StickFigure';
import {Pill} from '../parts/Text';
import {useStage} from '../parts/stage';
import {gold} from '../theme';
import {cue, type SunkScene} from '../timeline';
import {Heart} from './Heart';


/** 恋爱：两个人 + 一颗慢慢变灰的心；下面是年份轴，前五年已过去，后五年才是要决定的。 */
export const Love: React.FC<{scene: SunkScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const {v, cx, w, h} = useStage();
	const LINE_Y = v ? 1000 : 720;
	const STEP = v ? 92 : 132;
	const X0 = cx - STEP * 5;
	const TODAY = cx;
	const top = v ? 330 : 170; // 两个人的位置
	const tYears = cue(scene, '在一起五年', 0.15);
	const tMismatch = cue(scene, '不合适', 0.3);
	const tFive = cue(scene, '都五年了', 0.4);
	const tPast = cue(scene, '已经过去了', 0.6);
	const tNext = cue(scene, '接下来的五年', 0.8);
	const fade = interpolate(frame, [tMismatch, tMismatch + 40], [0, 0.75], clamp);
	const crack = ramp(frame, tMismatch + 10, 10);
	const past = ramp(frame, tPast, 18);
	const next = ramp(frame, tNext, 18);

	return (
		<AbsoluteFill>
			{/* 两个人和中间的心 */}
			<div style={{position: 'absolute', left: cx - 230, top, opacity: ramp(frame, 0, 12)}}>
				<StickFigure height={250} color={gold.silver} />
			</div>
			<div style={{position: 'absolute', left: cx + 105, top, opacity: ramp(frame, 0, 12)}}>
				<StickFigure height={250} color={gold.silver} facing={-1} />
			</div>
			<div style={{position: 'absolute', left: cx - 65, top: top + 40, transform: `scale(${pop(frame, 4) * (1 + Math.sin(frame / 7) * 0.04 * (1 - fade))})`}}>
				<Heart size={130} fade={fade} />
				{/* 裂痕 */}
				<svg width={130} height={130} style={{position: 'absolute', inset: 0}}>
					<path d="M66 8 L56 40 L72 58 L58 92" fill="none" stroke={gold.bg} strokeWidth={5} strokeDasharray={110} strokeDashoffset={110 * (1 - crack)} />
				</svg>
			</div>
			<div style={{position: 'absolute', left: cx - 160, top: top + 300, width: 320, display: 'flex', justifyContent: 'center', transform: `scale(${pop(frame, tFive)})`}}>
				<Pill color={gold.gold} size={36} style={{backgroundColor: 'rgba(233,180,76,0.12)'}}>
					"都五年了"
				</Pill>
			</div>

			{/* 年份轴 */}
			<svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
				<line x1={X0} x2={X0 + STEP * 10} y1={LINE_Y} y2={LINE_Y} stroke={gold.dim} strokeWidth={3} />
				<line x1={TODAY} x2={TODAY} y1={LINE_Y - 90} y2={LINE_Y + 50} stroke={gold.goldLight} strokeWidth={3} strokeDasharray="8 8" opacity={past} />
			</svg>
			{Array.from({length: 10}, (_, i) => {
				const isPast = i < 5;
				const p = isPast ? pop(frame, tYears + i * 6) : next;
				const x = X0 + STEP * (i + 0.5);
				return (
					<div key={i} style={{position: 'absolute', left: x - 40, top: LINE_Y - 80, width: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
						<div style={{transform: `scale(${p})`, opacity: isPast ? 1 - past * 0.55 : 1}}>
							{isPast ? (
								<Heart size={v ? 40 : 44} fade={Math.min(1, fade * (i / 4) * 1.3)} glow={0.5} />
							) : (
								<div style={{width: v ? 38 : 44, height: v ? 34 : 40, border: `2px dashed ${gold.gold}`, borderRadius: 10, boxShadow: '0 0 18px rgba(233,180,76,0.4)'}} />
							)}
						</div>
						<div style={{width: 16, height: 16, borderRadius: 8, backgroundColor: isPast ? gold.silver : gold.gold, transform: `scale(${p})`}} />
						<div style={{fontFamily: gold.sans, fontSize: v ? 22 : 24, color: gold.muted, opacity: p, whiteSpace: 'nowrap'}}>{v ? i + 1 : `第${i + 1}年`}</div>
					</div>
				);
			})}
			<div style={{position: 'absolute', left: X0, top: LINE_Y + 80, width: STEP * 5, textAlign: 'center', fontFamily: gold.sans, fontSize: v ? 30 : 32, color: gold.muted, opacity: past}}>
				已经过去，拿不回来
			</div>
			<div style={{position: 'absolute', left: TODAY - 60, top: LINE_Y - 140, width: 120, textAlign: 'center', fontFamily: gold.sans, fontSize: 30, color: gold.goldLight, opacity: past}}>
				今天
			</div>
			<div style={{position: 'absolute', left: TODAY, top: LINE_Y + 80, width: STEP * 5, textAlign: 'center', fontFamily: gold.serif, fontWeight: 900, fontSize: v ? 34 : 40, color: gold.gold, opacity: next}}>
				这才是你要决定的
			</div>
		</AbsoluteFill>
	);
};
