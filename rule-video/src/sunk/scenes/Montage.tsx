import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop, ramp} from '../parts/anim';
import {Coin} from '../parts/Coin';
import {GoldTitle} from '../parts/Text';
import {useStage} from '../parts/stage';
import {gold} from '../theme';
import {cue, type SunkScene} from '../timeline';

const CARDS = [
	{key: '自助餐', glyph: '餐', title: '自助餐吃到撑', sub: '"不吃回本就亏了"'},
	{key: '烂剧', glyph: '剧', title: '烂剧追到完', sub: '"都看了 20 集了"'},
	{key: '年卡', glyph: '卡', title: '年卡逼自己去', sub: '"卡都办了"'},
];

/** 日常连拍：三张卡片翻进来，最后一起滑进同一个坑。 */
export const Montage: React.FC<{scene: SunkScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const {v, cx} = useStage();
	const pitY = v ? 1260 : 800;
	const tPit = cue(scene, '同一个坑', 0.8);
	const fall = interpolate(frame, [tPit, tPit + 22], [0, 1], {...clamp, easing: (t) => t * t});
	return (
		<AbsoluteFill>
			{/* 坑 */}
			<div
				style={{
					position: 'absolute',
					left: cx - (v ? 450 : 560),
					top: pitY,
					width: v ? 900 : 1120,
					height: 120,
					borderRadius: '50%',
					background: 'radial-gradient(ellipse at center, #000 45%, rgba(233,180,76,0.25) 72%, transparent 78%)',
					opacity: ramp(frame, tPit - 10, 12),
				}}
			/>
			{CARDS.map((c, i) => {
				const t = cue(scene, c.key, 0.15 + i * 0.2);
				const flip = pop(frame, t, 30, 14);
				// 横版三张并排；竖版三张竖排，卡片改成横条
				const box = v
					? {left: 80, top: 330 + i * 290, width: 840, height: 250}
					: {left: 360 + i * 400, top: 220, width: 360, height: 420};
				return (
					<div
						key={c.key}
						style={{
							position: 'absolute',
							left: box.left,
							top: box.top + fall * (pitY - box.top - 40),
							width: box.width,
							height: box.height,
							borderRadius: 28,
							border: `1.5px solid ${gold.gold}66`,
							background: 'linear-gradient(180deg, rgba(40,34,22,0.9), rgba(18,18,22,0.9))',
							display: 'flex',
							flexDirection: v ? 'row' : 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: v ? 40 : 26,
							transform: `perspective(900px) rotateY(${(1 - flip) * 90}deg) rotate(${fall * (i - 1) * 25}deg) scale(${1 - fall * 0.5})`,
							opacity: Math.min(1, flip * 2) * (1 - fall * 0.9),
						}}
					>
						<Coin size={120} label={c.glyph} />
						<div style={{display: 'flex', flexDirection: 'column', alignItems: v ? 'flex-start' : 'center', gap: v ? 14 : 26}}>
							<div style={{fontFamily: gold.sans, fontSize: v ? 46 : 40, fontWeight: 700, color: gold.text}}>{c.title}</div>
							<div style={{fontFamily: gold.sans, fontSize: v ? 32 : 28, color: gold.muted}}>{c.sub}</div>
						</div>
					</div>
				);
			})}
			<div style={{position: 'absolute', top: v ? 640 : 360, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<GoldTitle size={120} reveal={ramp(frame, tPit + 8, 18)}>
					同一个坑
				</GoldTitle>
			</div>
		</AbsoluteFill>
	);
};
