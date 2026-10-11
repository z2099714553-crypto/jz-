import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {theme} from '../../lib/theme';

/** public/ 下的图片或截图，带缓慢推近（Ken Burns）。 */
export const ImageVisual: React.FC<{src: string; caption?: string; width: number; height: number}> = ({
	src,
	caption,
	width,
	height,
}) => {
	const frame = useCurrentFrame();
	const zoom = interpolate(frame, [0, 300], [1, 1.08], {extrapolateRight: 'clamp'});
	const captionSize = Math.min(36, width / 24);
	const imgH = height - (caption ? captionSize * 2 : 0);
	return (
		<div style={{width, height}}>
			<div style={{width, height: imgH, borderRadius: 28, overflow: 'hidden', backgroundColor: theme.panel}}>
				<Img
					src={staticFile(src)}
					style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}}
				/>
			</div>
			{caption && <div style={{fontSize: captionSize, color: theme.muted, marginTop: captionSize * 0.6}}>{caption}</div>}
		</div>
	);
};
