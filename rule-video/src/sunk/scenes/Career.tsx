import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop, ramp} from '../parts/anim';
import {Pill} from '../parts/Text';
import {gold} from '../theme';
import {cue, type SunkScene} from '../timeline';

type Row = {label: string; value: number; text: string};
const CARDS: {title: string; color: string; x: number; rows: Row[]}[] = [
	{
		title: '继续这个专业',
		color: gold.silver,
		x: 230,
		rows: [
			{label: '已经投入', value: 1, text: '4 年'},
			{label: '往后的转换成本', value: 0.15, text: '低'},
			{label: '往后的喜欢程度', value: 0.2, text: '低'},
		],
	},
	{
		title: '换一个方向',
		color: gold.gold,
		x: 1010,
		rows: [
			{label: '已经投入', value: 1, text: '4 年'},
			{label: '往后的转换成本', value: 0.7, text: '高'},
			{label: '往后的喜欢程度', value: 0.85, text: '高'},
		],
	},
];
const CARD_W = 680;
const ROW_Y = [150, 290, 400];

/** 职业：仿参考视频的"成本账"卡片。已投入两边一样 → 划掉；只比往后两行。 */
export const Career: React.FC<{scene: SunkScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const tSpent = cue(scene, '白学了', 0.3);
	const tSame = cue(scene, '一样多', 0.5);
	const tFuture = cue(scene, '往后每一年', 0.7);
	const tWorth = cue(scene, '哪条路更值得', 0.88);
	const strike = interpolate(frame, [tSame, tSame + 14], [0, 1], clamp);
	const worth = ramp(frame, tWorth, 15);

	return (
		<AbsoluteFill>
			{CARDS.map((c, ci) => {
				const enter = pop(frame, ci * 6, 30, 16);
				return (
					<div
						key={c.title}
						style={{
							position: 'absolute',
							left: c.x,
							top: 200,
							width: CARD_W,
							height: 520,
							borderRadius: 28,
							border: `2px solid ${c.color}88`,
							background: 'linear-gradient(180deg, rgba(30,30,38,0.92), rgba(14,14,18,0.92))',
							boxShadow: ci === 1 ? `0 0 ${50 * worth}px rgba(233,180,76,0.35)` : undefined,
							transform: `translateX(${(1 - enter) * (ci === 0 ? -200 : 200)}px)`,
							opacity: enter,
						}}
					>
						<div style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', fontFamily: gold.serif, fontWeight: 900, fontSize: 52, color: c.color}}>
							{c.title}
						</div>
						{c.rows.map((r, ri) => {
							const start = ri === 0 ? tSpent : tFuture + (ri - 1) * 8;
							const fill = interpolate(frame, [start, start + 24], [0, r.value], clamp);
							const struck = ri === 0;
							return (
								<div key={r.label} style={{position: 'absolute', top: ROW_Y[ri] + 40, left: 48, right: 48, opacity: struck ? 1 - strike * 0.6 : 1}}>
									<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: gold.sans, fontSize: 30, color: gold.muted, marginBottom: 14}}>
										<span>{r.label}</span>
										<span style={{color: struck ? gold.loss : c.color, fontWeight: 700, opacity: fill > 0 ? 1 : 0}}>{r.text}</span>
									</div>
									<div style={{height: 18, borderRadius: 9, backgroundColor: gold.dim}}>
										<div style={{width: `${fill * 100}%`, height: '100%', borderRadius: 9, backgroundColor: struck ? gold.loss : c.color}} />
									</div>
									{struck && (
										<div style={{position: 'absolute', left: -14, top: 34, width: `${strike * 106}%`, height: 5, backgroundColor: gold.text, borderRadius: 3}} />
									)}
								</div>
							);
						})}
					</div>
				);
			})}
			{/* 中间的等号：已投入两边一样 */}
			<div style={{position: 'absolute', left: 960 - 50, top: 360, width: 100, textAlign: 'center', fontFamily: gold.sans, fontWeight: 700, fontSize: 80, color: gold.text, transform: `scale(${pop(frame, tSame)})`}}>
				=
			</div>
			<div style={{position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${pop(frame, tSpent)})`}}>
				<Pill color={gold.loss} size={34}>"前面都白学了？"</Pill>
			</div>
			<div style={{position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: ramp(frame, tFuture + 10, 14)}}>
				<Pill color={gold.gold} size={34} style={{backgroundColor: 'rgba(233,180,76,0.12)'}}>
					只比下面两行，第一行两边一样
				</Pill>
			</div>
		</AbsoluteFill>
	);
};
