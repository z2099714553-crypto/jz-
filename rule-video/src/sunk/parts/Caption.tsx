import {useCurrentFrame} from 'remotion';
import {captionsFor} from '../../lib/timeline';
import {gold} from '../theme';
import type {SunkScene} from '../timeline';
import {Highlight} from './Text';

/** 底部居中一行字幕，关键词金色。参考视频的字幕风格。 */
export const Caption: React.FC<{scene: SunkScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const current = captionsFor({...scene, kind: 'point', index: 0}, 20).find(
		(c) => frame >= c.from && frame < c.from + c.duration,
	);
	if (!current) return null;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center'}}>
			<div
				style={{
					fontFamily: gold.sans,
					fontSize: 46,
					fontWeight: 600,
					color: gold.text,
					letterSpacing: 2,
					textShadow: '0 2px 10px rgba(0,0,0,0.9)',
				}}
			>
				<Highlight text={current.text} words={scene.highlight} />
			</div>
		</div>
	);
};

/** 左上角章节名。 */
export const Chapter: React.FC<{text?: string}> = ({text}) =>
	text ? (
		<div
			style={{
				position: 'absolute',
				top: 48,
				left: 64,
				fontFamily: gold.sans,
				fontSize: 24,
				letterSpacing: 4,
				color: gold.muted,
			}}
		>
			{text}
		</div>
	) : null;
