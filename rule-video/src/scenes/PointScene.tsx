import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ChartBlock} from '../components/ChartBlock';
import {Emphasis} from '../components/Emphasis';
import {VisualBlock} from '../components/visuals';
import {contentBox, type Layout} from '../lib/layout';
import {balanced, theme} from '../lib/theme';
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

	const {chart, visual} = point;
	const media = Boolean(chart || visual);
	const sideBySide = media && !layout.vertical;
	const headingSize = media ? (layout.vertical ? 76 : 72) : layout.vertical ? 104 : 100;
	const headingWidth = sideBySide ? box.width * 0.38 : box.width;
	const headingHeight = media && layout.vertical ? 300 : box.height;

	const mediaBox = {
		width: sideBySide ? box.width * 0.56 : box.width,
		height: sideBySide ? box.height * 0.9 : box.height - headingHeight - 50,
	};

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
			<div style={{...balanced, fontSize: headingSize, fontWeight: 800, lineHeight: 1.22}}>
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
					justifyContent: media ? 'space-between' : 'center',
					alignItems: sideBySide ? 'center' : 'stretch',
				}}
			>
				<div style={{height: sideBySide ? 'auto' : media ? headingHeight : 'auto', display: 'flex', alignItems: 'flex-end'}}>
					{heading}
				</div>
				{chart ? (
					<ChartBlock chart={chart} {...mediaBox} accent={accent} delay={12} />
				) : visual ? (
					<VisualBlock visual={visual} {...mediaBox} accent={accent} delay={12} />
				) : null}
			</div>
		</AbsoluteFill>
	);
};
