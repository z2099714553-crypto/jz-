import {theme} from '../lib/theme';
import type {Chart} from '../lib/timeline';
import {BarChart} from './BarChart';
import {LineChart} from './LineChart';

/** 图表标题 + 图 + 数据来源。 */
export const ChartBlock: React.FC<{chart: Chart; width: number; height: number; accent: string; delay: number}> = ({
	chart,
	width,
	height,
	accent,
	delay,
}) => {
	const titleSize = Math.min(40, width / 22);
	const sourceSize = titleSize * 0.62;
	const plotHeight = height - titleSize * 1.8 - (chart.source ? sourceSize * 2.2 : 0);
	const Plot = chart.type === 'line' ? LineChart : BarChart;
	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column'}}>
			{chart.title && (
				<div style={{fontSize: titleSize, fontWeight: 600, color: theme.muted, marginBottom: titleSize * 0.6}}>
					{chart.title}
				</div>
			)}
			<Plot chart={chart} width={width} height={plotHeight} accent={accent} delay={delay} />
			{chart.source && (
				<div style={{fontSize: sourceSize, color: theme.dim, marginTop: sourceSize}}>来源：{chart.source}</div>
			)}
		</div>
	);
};
