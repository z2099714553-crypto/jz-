import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../../lib/theme';

/** 砍价式进度条：前 95% 一下子冲上去，剩下的一点一点挪，最后卡在 value。 */
export const Progress: React.FC<{
	value: number;
	label?: string;
	note?: string;
	width: number;
	height: number;
	accent: string;
	delay: number;
}> = ({value, label, note, width, height, accent, delay}) => {
	const frame = useCurrentFrame() - delay;
	const fast = interpolate(frame, [0, 24], [0, value * 0.95], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	const slow = interpolate(frame, [24, 110], [0, value * 0.05], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.quad),
	});
	const pct = fast + slow;
	const barH = Math.min(72, height * 0.2);
	const size = Math.min(56, width / 14);
	// 进度条尾部的光点一闪一闪，表示"还在砍"
	const pulse = 0.5 + 0.5 * Math.sin(frame / 4);

	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: size * 0.6}}>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
				<div style={{fontSize: size * 0.7, color: theme.muted, fontWeight: 600}}>{label ?? '进度'}</div>
				<div style={{fontFamily: theme.numFont, fontSize: size * 1.6, fontWeight: 800, color: accent}}>
					{pct.toFixed(1)}%
				</div>
			</div>
			<div style={{height: barH, borderRadius: barH / 2, backgroundColor: theme.track, overflow: 'hidden'}}>
				<div
					style={{
						width: `${pct}%`,
						height: '100%',
						borderRadius: barH / 2,
						background: `linear-gradient(90deg, ${accent}AA, ${accent})`,
						boxShadow: `0 0 ${20 + pulse * 30}px ${accent}`,
					}}
				/>
			</div>
			{note && (
				<div style={{fontSize: size * 0.7, color: theme.text, fontWeight: 600, opacity: frame > 30 ? 1 : 0}}>
					{note}
				</div>
			)}
		</div>
	);
};
