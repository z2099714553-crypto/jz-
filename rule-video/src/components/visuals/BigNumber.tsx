import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {balanced, theme} from '../../lib/theme';
import {decimalsOf, formatValue} from '../format';

/** 一个大数字从 0 跳到 value，下面一行说明。 */
export const BigNumber: React.FC<{
	value: number;
	unit?: string;
	label?: string;
	width: number;
	height: number;
	accent: string;
	delay: number;
}> = ({value, unit, label, width, height, accent, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: frame - delay, fps, config: {damping: 200}, durationInFrames: 40});
	const size = Math.min(height * 0.55, width / (String(value).length * 0.62 + 1));
	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
			<div style={{fontFamily: theme.numFont, fontSize: size, fontWeight: 900, color: accent, lineHeight: 1}}>
				{formatValue(value * p, decimalsOf([value]))}
				{unit && <span style={{fontSize: size * 0.35, marginLeft: 12, color: theme.text}}>{unit}</span>}
			</div>
			{label && (
				<div style={{...balanced, fontSize: Math.min(52, width / 16), fontWeight: 600, color: theme.muted, marginTop: 24, textAlign: 'center'}}>
					{label}
				</div>
			)}
		</div>
	);
};
