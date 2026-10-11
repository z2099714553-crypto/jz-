import {useCurrentFrame} from 'remotion';
import {captionsFor} from '../../lib/timeline';
import {gold} from '../theme';
import type {SunkScene} from '../timeline';
import {useStage} from './stage';
import {Highlight} from './Text';

/** 底部居中一行字幕，关键词金色。参考视频的字幕风格。 */
export const Caption: React.FC<{scene: SunkScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const {v} = useStage();
	const current = captionsFor({...scene, kind: 'point', index: 0}, v ? 12 : 20).find(
		(c) => frame >= c.from && frame < c.from + c.duration,
	);
	if (!current) return null;
	return (
		<div style={{position: 'absolute', left: v ? 60 : 0, right: v ? 160 : 0, bottom: v ? 430 : 70, display: 'flex', justifyContent: 'center'}}>
			<div
				style={{
					fontFamily: gold.sans,
					fontSize: v ? 56 : 46,
					textAlign: 'center',
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
export const Chapter: React.FC<{text?: string}> = ({text}) => {
	const {v} = useStage();
	return text ? (
		<div
			style={{
				position: 'absolute',
				top: v ? 210 : 48,
				left: v ? 60 : 64,
				fontFamily: gold.sans,
				fontSize: v ? 30 : 24,
				letterSpacing: 4,
				color: gold.muted,
			}}
		>
			{text}
		</div>
	) : null;
};
