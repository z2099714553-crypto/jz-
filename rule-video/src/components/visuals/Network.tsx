import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../../lib/theme';
import {PersonIcon} from './People';

const MAX_NODES = 24;

/** 社交关系网：中心是"你"，连线一条条射出去，外圈的人依次亮起。 */
export const Network: React.FC<{
	count: number;
	center?: string;
	label?: string;
	width: number;
	height: number;
	accent: string;
	delay: number;
}> = ({count, center = '你', label, width, height, accent, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const n = Math.min(count, MAX_NODES);
	const labelSize = Math.min(48, width / 18);
	const h = height - (label ? labelSize * 2 : 0);
	const cx = width / 2;
	const cy = h / 2;
	const R = Math.min(width, h) / 2 - 40;
	const inner = n > 10 ? Math.ceil(n * 0.4) : n;
	const nodes = Array.from({length: n}, (_, i) => {
		const ring = i < inner ? 0 : 1;
		const k = ring === 0 ? i : i - inner;
		const total = ring === 0 ? inner : n - inner;
		const angle = (k / total) * Math.PI * 2 - Math.PI / 2 + ring * (Math.PI / total);
		const r = ring === 0 ? (n > 10 ? R * 0.55 : R) : R;
		return {x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, start: delay + 8 + i * (40 / n)};
	});
	const node = Math.min(70, R * 0.28);
	const hub = spring({frame: frame - delay, fps, config: {damping: 14}});

	return (
		<div style={{width, height, position: 'relative'}}>
			<svg width={width} height={h} style={{position: 'absolute'}}>
				{nodes.map((p, i) => {
					const t = interpolate(frame, [p.start, p.start + 10], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					return (
						<line
							key={i}
							x1={cx}
							y1={cy}
							x2={cx + (p.x - cx) * t}
							y2={cy + (p.y - cy) * t}
							stroke={accent}
							strokeOpacity={0.45}
							strokeWidth={3}
						/>
					);
				})}
			</svg>
			{nodes.map((p, i) => {
				const s = spring({frame: frame - p.start - 8, fps, config: {damping: 12, mass: 0.5}});
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: p.x - node / 2,
							top: p.y - node / 2,
							width: node,
							height: node,
							borderRadius: node / 2,
							backgroundColor: theme.panel,
							border: `3px solid ${theme.dim}`,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							transform: `scale(${s})`,
						}}
					>
						<PersonIcon size={node * 0.6} color={theme.muted} />
					</div>
				);
			})}
			<div
				style={{
					position: 'absolute',
					left: cx - node,
					top: cy - node,
					width: node * 2,
					height: node * 2,
					borderRadius: node,
					backgroundColor: accent,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: node * 0.7,
					fontWeight: 800,
					transform: `scale(${hub})`,
					boxShadow: `0 0 40px ${accent}88`,
				}}
			>
				{center}
			</div>
			{label && (
				<div style={{position: 'absolute', top: h, width, textAlign: 'center', fontSize: labelSize, fontWeight: 700}}>
					{label}
				</div>
			)}
		</div>
	);
};
