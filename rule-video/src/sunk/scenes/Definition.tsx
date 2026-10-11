import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop, ramp} from '../parts/anim';
import {Coin} from '../parts/Coin';
import {GoldTitle, Pill} from '../parts/Text';
import {useStage} from '../parts/stage';
import {gold} from '../theme';
import {cue, type SunkScene} from '../timeline';

const ITEMS = [
	{label: '¥', name: '钱', dx: -1},
	{label: '时', name: '时间', dx: 0},
	{label: '情', name: '感情', dx: 1},
];

/** 定义：三枚币（钱 / 时间 / 感情）沉到水面以下，变暗，冒气泡。 */
export const Definition: React.FC<{scene: SunkScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const {v, cx, h} = useStage();
	const WATER_Y = v ? 980 : 560;
	const coinY = v ? 760 : 380;
	const sinkBy = v ? 300 : 290;
	const pillY = v ? 1180 : 760;
	const gap = v ? 280 : 300;
	const tIn = cue(scene, '已经花出去', 0.2);
	const tSink = cue(scene, '拿不回来', 0.45);
	const tNames = cue(scene, '钱、时间', 0.75);
	const sink = interpolate(frame, [tSink, tSink + 30], [0, 1], clamp);

	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: v ? 360 : 110, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
				<GoldTitle size={v ? 120 : 96} reveal={ramp(frame, 0, 20)}>
					沉没成本
				</GoldTitle>
				<div style={{fontFamily: gold.sans, fontSize: 34, color: gold.muted, letterSpacing: 6, opacity: ramp(frame, tIn, 15)}}>
					Sunk Cost
				</div>
			</div>
			{/* 水面以下 */}
			<div
				style={{
					position: 'absolute',
					top: WATER_Y,
					left: 0,
					right: 0,
					height: h - WATER_Y,
					background: 'linear-gradient(180deg, rgba(40,60,90,0.35), rgba(10,12,20,0.9))',
					opacity: ramp(frame, tIn, 20),
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: WATER_Y,
					left: 0,
					right: 0,
					height: 2,
					background: `linear-gradient(90deg, transparent, ${gold.goldLight}, transparent)`,
					opacity: ramp(frame, tIn, 20) * (0.6 + 0.4 * Math.sin(frame / 6)),
				}}
			/>
			<div style={{position: 'absolute', top: WATER_Y - 46, right: v ? 170 : 120, opacity: ramp(frame, tSink, 15)}}>
				<Pill color={gold.gold}>水面以下 = 拿不回来</Pill>
			</div>
			{ITEMS.map((it, i) => {
				const p = pop(frame, tIn + i * 6);
				const x = cx + it.dx * gap;
				const y = coinY + sink * sinkBy + Math.sin((frame + i * 20) / 12) * 6 * sink;
				const size = 130;
				return (
					<div key={it.name}>
						<div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `scale(${p})`}}>
							<Coin size={size} label={it.label} />
							<div style={{position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: `rgba(10,14,24,${sink * 0.6})`}} />
						</div>
						{/* 气泡 */}
						{sink > 0.2 &&
							[0, 1, 2].map((b) => {
								const t = ((frame - tSink + b * 13 + i * 7) % 40) / 40;
								return (
									<div
										key={b}
										style={{
											position: 'absolute',
											left: x - 30 + b * 25,
											top: y - 80 - t * 120,
											width: 10 + b * 3,
											height: 10 + b * 3,
											borderRadius: '50%',
											border: '1.5px solid rgba(200,220,255,0.5)',
											opacity: (1 - t) * Math.min(1, sink),
										}}
									/>
								);
							})}
						<div
							style={{
								position: 'absolute',
								left: x - 80,
								width: 160,
								top: pillY,
								display: 'flex',
								justifyContent: 'center',
								opacity: ramp(frame, tNames + i * 7, 10),
							}}
						>
							<Pill color={gold.goldLight} size={30}>
								{it.name}
							</Pill>
						</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};
