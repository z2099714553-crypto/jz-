import {useCurrentFrame} from 'remotion';
import type {Layout} from '../lib/layout';
import {theme} from '../lib/theme';
import {captionsFor, type Scene} from '../lib/timeline';

export const Captions: React.FC<{scene: Scene; layout: Layout}> = ({scene, layout}) => {
	const frame = useCurrentFrame();
	const current = captionsFor(scene, layout.captionMaxChars).find(
		(c) => frame >= c.from && frame < c.from + c.duration,
	);
	if (!current) return null;

	return (
		<div
			style={{
				position: 'absolute',
				left: layout.safe.left,
				right: layout.safe.right,
				bottom: layout.captionBottom,
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					fontSize: layout.captionSize,
					fontWeight: 700,
					lineHeight: 1.3,
					textAlign: 'center',
					color: theme.text,
					padding: '10px 28px',
					borderRadius: 14,
					backgroundColor: 'rgba(0, 0, 0, 0.55)',
					textShadow: '0 2px 6px rgba(0, 0, 0, 0.6)',
				}}
			>
				{current.text}
			</div>
		</div>
	);
};
