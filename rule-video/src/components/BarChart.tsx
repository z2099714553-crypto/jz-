import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../lib/theme';
import type {Chart} from '../lib/timeline';
import {decimalsOf, formatValue} from './format';

/** 横向条形图：一条接一条长出来，数字跟着往上跳，高亮项用强调色。 */
export const BarChart: React.FC<{chart: Chart; width: number; height: number; accent: string; delay: number}> = ({
	chart,
	width,
	height,
	accent,
	delay,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {items} = chart;
	const highlight = chart.highlight ?? items.length - 1;
	const max = Math.max(...items.map((i) => i.value)) || 1;
	const decimals = decimalsOf(items.map((i) => i.value));

	const rowHeight = Math.min(130, height / items.length);
	const barHeight = rowHeight * 0.52;
	const labelWidth = width * 0.24;
	const valueWidth = width * 0.2;
	const trackWidth = width - labelWidth - valueWidth;
	const fontSize = Math.min(48, rowHeight * 0.4);

	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
			{items.map((item, i) => {
				const p = spring({frame: frame - delay - i * 6, fps, config: {damping: 200}, durationInFrames: 36});
				const on = i === highlight;
				return (
					<div key={i} style={{height: rowHeight, display: 'flex', alignItems: 'center'}}>
						<div
							style={{
								width: labelWidth,
								paddingRight: 20,
								textAlign: 'right',
								fontSize,
								fontWeight: on ? 700 : 500,
								color: on ? theme.text : theme.muted,
							}}
						>
							{item.label}
						</div>
						<div
							style={{
								width: Math.max(barHeight * 0.3, (item.value / max) * trackWidth * p),
								height: barHeight,
								borderRadius: barHeight / 4,
								backgroundColor: on ? accent : theme.dim,
								opacity: p > 0.01 ? 1 : 0,
							}}
						/>
						<div
							style={{
								paddingLeft: 18,
								fontFamily: theme.numFont,
								fontSize: fontSize * 1.1,
								fontWeight: 700,
								color: on ? accent : theme.text,
								opacity: p > 0.01 ? 1 : 0,
								whiteSpace: 'nowrap',
							}}
						>
							{formatValue(item.value * p, decimals)}
							{chart.unit && <span style={{fontSize: fontSize * 0.6, marginLeft: 4}}>{chart.unit}</span>}
						</div>
					</div>
				);
			})}
		</div>
	);
};
