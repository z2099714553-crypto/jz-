import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Emphasis} from '../components/Emphasis';
import {contentBox, type Layout} from '../lib/layout';
import {balanced} from '../lib/theme';
import type {RuleScript} from '../lib/timeline';

/** 结尾：重申结论 + 关注引导。 */
export const OutroScene: React.FC<{outro: RuleScript['outro']; layout: Layout; accent: string}> = ({
	outro,
	layout,
	accent,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const box = contentBox(layout);
	const fade = interpolate(frame, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
	const cta = spring({frame: frame - 20, fps, config: {damping: 14}});

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
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: layout.vertical ? 'flex-start' : 'center',
					gap: 60,
				}}
			>
				<div
					style={{
						...balanced,
						fontSize: layout.vertical ? 104 : 96,
						fontWeight: 900,
						lineHeight: 1.2,
						textAlign: layout.vertical ? 'left' : 'center',
					}}
				>
					<Emphasis text={outro.text} accent={accent} />
				</div>
				{outro.cta && (
					<div
						style={{
							fontSize: layout.vertical ? 52 : 44,
							fontWeight: 700,
							padding: '18px 40px',
							borderRadius: 999,
							backgroundColor: accent,
							transform: `scale(${cta})`,
							transformOrigin: layout.vertical ? 'left center' : 'center',
						}}
					>
						{outro.cta}
					</div>
				)}
			</div>
		</AbsoluteFill>
	);
};
