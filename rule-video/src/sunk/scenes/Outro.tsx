import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop, ramp} from '../parts/anim';
import {Coin} from '../parts/Coin';
import {StickFigure} from '../parts/StickFigure';
import {GoldTitle, Pill} from '../parts/Text';
import {gold} from '../theme';
import {cue, type SunkScene} from '../timeline';

/** 结尾：人背对沉下去的金币，走上一条发光的路。 */
export const Outro: React.FC<{scene: SunkScene; cta?: string}> = ({scene, cta}) => {
	const frame = useCurrentFrame();
	const tSecond = cue(scene, '是不让过去', 0.45);
	const walk = interpolate(frame, [0, scene.duration], [0, 1], clamp);
	return (
		<AbsoluteFill>
			{/* 发光的路 */}
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				<defs>
					<linearGradient id="road" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor={gold.gold} stopOpacity={0} />
						<stop offset="1" stopColor={gold.goldLight} stopOpacity={0.9} />
					</linearGradient>
				</defs>
				<path d="M300,800 C800,790 1300,700 1820,560" fill="none" stroke="url(#road)" strokeWidth={6} strokeDasharray={1600} strokeDashoffset={1600 * (1 - ramp(frame, 0, 40))} />
			</svg>
			{/* 身后沉下去的币 */}
			{[0, 1, 2].map((i) => (
				<Coin key={i} size={70} variant="dim" label={['¥', '时', '情'][i]} style={{position: 'absolute', left: 180 + i * 70, top: 760 + i * 12, opacity: 1 - walk * 0.8}} />
			))}
			<div style={{position: 'absolute', left: 500 + walk * 700, top: 560 - walk * 70}}>
				<StickFigure height={240} color={gold.goldLight} walk={frame} glow />
			</div>
			<div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
				<GoldTitle size={110} reveal={ramp(frame, 0, 20)}>
					放下，不是认输
				</GoldTitle>
				<div style={{fontFamily: gold.sans, fontSize: 50, color: gold.text, letterSpacing: 4, opacity: ramp(frame, tSecond, 16)}}>
					是不让过去，再拿走你的<span style={{color: gold.gold}}>未来</span>
				</div>
				{cta && (
					<div style={{marginTop: 20, transform: `scale(${pop(frame, tSecond + 30)})`}}>
						<Pill color={gold.gold} size={32} style={{backgroundColor: 'rgba(233,180,76,0.15)'}}>
							{cta}
						</Pill>
					</div>
				)}
			</div>
		</AbsoluteFill>
	);
};
