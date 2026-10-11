import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../lib/theme';
import type {Chart} from '../lib/timeline';
import {decimalsOf, formatValue} from './format';

/** 折线图：线从左往右画出来，经过的点依次亮起，高亮点标出数值。 */
export const LineChart: React.FC<{chart: Chart; width: number; height: number; accent: string; delay: number}> = ({
	chart,
	width,
	height,
	accent,
	delay,
}) => {
	const frame = useCurrentFrame();
	const {items} = chart;
	const highlight = chart.highlight ?? items.length - 1;
	const max = Math.max(...items.map((i) => i.value)) || 1;
	const decimals = decimalsOf(items.map((i) => i.value));

	const fontSize = Math.min(40, width / 26);
	const pad = {top: fontSize * 2.4, right: fontSize * 1.5, bottom: fontSize * 2, left: fontSize * 1.5};
	const plotW = width - pad.left - pad.right;
	const plotH = height - pad.top - pad.bottom;
	const pts = items.map((item, i) => ({
		x: pad.left + (items.length === 1 ? plotW / 2 : (i / (items.length - 1)) * plotW),
		y: pad.top + plotH - (item.value / max) * plotH,
	}));

	const segments = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
	const length = segments.reduce((a, b) => a + b, 0);
	const progress = interpolate(frame - delay, [0, 50], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	// 第 i 个点在线条画到它的累计长度时亮起
	const reachedAt = pts.map((_, i) => segments.slice(0, i).reduce((a, b) => a + b, 0) / (length || 1));
	const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');

	return (
		<svg width={width} height={height} style={{overflow: 'visible'}}>
			<line
				x1={pad.left}
				x2={pad.left + plotW}
				y1={pad.top + plotH}
				y2={pad.top + plotH}
				stroke={theme.track}
				strokeWidth={3}
			/>
			<path
				d={d}
				fill="none"
				stroke={accent}
				strokeWidth={8}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeDasharray={length}
				strokeDashoffset={length * (1 - progress)}
			/>
			{pts.map((p, i) => {
				const visible = progress >= reachedAt[i] - 0.001 && progress > 0;
				const on = i === highlight;
				return (
					<g key={i}>
						<circle
							cx={p.x}
							cy={p.y}
							r={on ? 16 : 10}
							fill={on ? accent : theme.bg}
							stroke={accent}
							strokeWidth={5}
							opacity={visible ? 1 : 0}
						/>
						{on && visible && (
							<text
								x={p.x}
								y={p.y - fontSize * 0.9}
								textAnchor={i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}
								fill={accent}
								fontSize={fontSize * 1.3}
								fontWeight={700}
								fontFamily={theme.numFont}
							>
								{formatValue(items[i].value, decimals)}
								{chart.unit}
							</text>
						)}
						<text
							x={p.x}
							y={pad.top + plotH + fontSize * 1.4}
							textAnchor={i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}
							fill={on ? theme.text : theme.muted}
							fontSize={fontSize * 0.8}
							fontFamily={theme.font}
						>
							{items[i].label}
						</text>
					</g>
				);
			})}
		</svg>
	);
};
