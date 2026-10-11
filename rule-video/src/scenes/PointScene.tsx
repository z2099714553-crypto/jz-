import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ChartBlock} from '../components/ChartBlock';
import {Emphasis} from '../components/Emphasis';
import {contentBox, type Layout} from '../lib/layout';
import {theme} from '../lib/theme';
import type {Point} from '../lib/timeline';

/** 一个要点：序号 + 标题；有图表时竖版上下排、横版左右排。 */
export const PointScene: React.FC<{point: Point; index: number; count: number; layout: Layout; accent: string}> = ({
	point,
	index,
	count,
	layout,
	accent,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const box = contentBox(layout);
	const enter = spring({frame, fps, config: {damping: 200}, durationInFrames: 18});
	const fade = interpolate(frame, [0, 6], [0, 1], {extrapolateRight: 'clamp'});

	const {chart} = point;
	const sideBySide = chart && !layout.vertical;
	const headingSize = chart ? (layout.vertical ? 76 : 72) : layout.vertical ? 104 : 100;
	const headingWidth = sideBySide ? box.width * 0.38 : box.width;
	const headingHeight = chart && layout.vertical ? 300 : box.height;

	const heading = (
		<div style={{width: headingWidth, transform: `translateY(${(1 - enter) * 40}px)`}}>
			<div
				style={{
					fontFamily: theme.numFont,
					fontSize: headingSize * 0.42,
					fontWeight: 700,
					color: accent,
					marginBottom: headingSize * 0.25,
				}}
			>
				{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
			</div>
			<div style={{fontSize: headingSize, fontWeight: 800, lineHeight: 1.22}}>
				<Emphasis text={point.text} accent={accent} />
			</div>
		</div>
	);

	return (
		<AbsoluteFill style={{opacity: fade}}>
			<div
				style={{
					position: 'absolute',
					top: box.top,
					left: box.left,
					width: box.width,
					height: box.height,
					display: 'flex',
					flexDirection: sideBySide ? 'row' : 'column',
					justifyContent: chart ? 'space-between' : 'center',
					alignItems: sideBySide ? 'center' : 'stretch',
				}}
			>
				<div style={{height: sideBySide ? 'auto' : chart ? headingHeight : 'auto', display: 'flex', alignItems: 'flex-end'}}>
					{heading}
				</div>
				{chart && (
					<ChartBlock
						chart={chart}
						width={sideBySide ? box.width * 0.56 : box.width}
						height={sideBySide ? box.height * 0.9 : box.height - headingHeight - 50}
						accent={accent}
						delay={12}
					/>
				)}
			</div>
		</AbsoluteFill>
	);
};
