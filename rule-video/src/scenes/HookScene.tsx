import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Emphasis} from '../components/Emphasis';
import {VisualBlock} from '../components/visuals';
import {contentBox, type Layout} from '../lib/layout';
import {balanced} from '../lib/theme';
import {plainText, type RuleScript} from '../lib/timeline';

/** 开头结论：第 0 帧就是满屏大字，不做淡入，前 2 秒必须能看清。有配图时放在大字下面。 */
export const HookScene: React.FC<{script: RuleScript; layout: Layout; accent: string}> = ({script, layout, accent}) => {
	const frame = useCurrentFrame();
	const box = contentBox(layout);
	const {visual} = script.hook;
	const n = [...plainText(script.hook.text)].length;
	const fontSize = layout.vertical ? (n <= 8 ? 150 : n <= 12 ? 124 : 104) : n <= 10 ? 140 : n <= 16 ? 112 : 92;
	const scale = interpolate(frame, [0, 10], [1.06, 1], {extrapolateRight: 'clamp'});
	const visualHeight = visual ? box.height * (layout.vertical ? 0.45 : 0.5) : 0;
	const visualIn = interpolate(frame, [4, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					top: box.top,
					left: box.left,
					width: box.width,
					height: box.height,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: visual ? 'space-evenly' : 'center',
					alignItems: layout.vertical ? 'flex-start' : 'center',
				}}
			>
				<div
					style={{
						...balanced,
						fontSize,
						fontWeight: 900,
						lineHeight: 1.18,
						letterSpacing: -2,
						textAlign: layout.vertical ? 'left' : 'center',
						transform: `scale(${scale})`,
						transformOrigin: layout.vertical ? 'left center' : 'center',
					}}
				>
					<Emphasis text={script.hook.text} accent={accent} />
				</div>
				{visual && (
					<div style={{opacity: visualIn}}>
						<VisualBlock
							visual={visual}
							width={layout.vertical ? box.width : box.width * 0.6}
							height={visualHeight}
							accent={accent}
							delay={4}
						/>
					</div>
				)}
			</div>
		</AbsoluteFill>
	);
};
