import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../../lib/theme';

const MAX_ICONS = 100;

export const PersonIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<circle cx="12" cy="7" r="4.5" fill={color} />
		<path d="M3 23c0-5.2 4-9 9-9s9 3.8 9 9z" fill={color} />
	</svg>
);

/** 小人方阵：一个个蹦出来，计数往上跳；最后 highlight 个用强调色。 */
export const People: React.FC<{
	count: number;
	highlight?: number;
	label?: string;
	width: number;
	height: number;
	accent: string;
	delay: number;
}> = ({count, highlight = 0, label, width, height, accent, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const shown = Math.min(count, MAX_ICONS);
	const labelSize = Math.min(52, width / 16);
	const gridH = height - labelSize * 2.2;
	const cols = Math.max(1, Math.ceil(Math.sqrt((shown * width) / gridH)));
	const rows = Math.ceil(shown / cols);
	const cell = Math.min(width / cols, gridH / rows);
	const spread = 45; // 全部蹦完用的帧数
	const appeared = Math.min(shown, Math.max(0, Math.floor(((frame - delay) / spread) * shown) + 1));
	const counter = Math.round((appeared / shown) * count);

	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: labelSize * 0.6}}>
			<div style={{width: cols * cell, display: 'flex', flexWrap: 'wrap'}}>
				{Array.from({length: shown}, (_, i) => {
					const s = spring({frame: frame - delay - (i / shown) * spread, fps, config: {damping: 12, mass: 0.5}});
					const on = i >= shown - Math.min(highlight, shown);
					return (
						<div key={i} style={{width: cell, height: cell, display: 'flex', justifyContent: 'center', transform: `scale(${s})`}}>
							<PersonIcon size={cell * 0.82} color={on ? accent : theme.dim} />
						</div>
					);
				})}
			</div>
			<div style={{fontSize: labelSize, fontWeight: 700}}>
				<span style={{fontFamily: theme.numFont, color: accent, fontSize: labelSize * 1.3}}>{counter}</span>
				<span style={{marginLeft: 8}}>{label ?? '人'}</span>
			</div>
		</div>
	);
};
