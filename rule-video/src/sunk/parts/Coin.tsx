import {gold} from '../theme';

const PALETTE = {
	gold: {face: `radial-gradient(circle at 35% 30%, ${gold.goldLight}, ${gold.gold} 45%, ${gold.goldDeep})`, rim: gold.goldLight, ink: '#7A4E0E', glow: 'rgba(233,180,76,0.55)'},
	silver: {face: `radial-gradient(circle at 35% 30%, #E4E8F0, ${gold.silver} 45%, ${gold.silverDeep})`, rim: '#E4E8F0', ink: '#3E4553', glow: 'rgba(169,177,194,0.35)'},
	dim: {face: 'radial-gradient(circle at 35% 30%, #5A5C64, #34363C 60%, #222327)', rim: '#62646C', ink: '#8A8C94', glow: 'rgba(0,0,0,0)'},
};

/** 金币 / 银币 / 暗币，中间一个字。 */
export const Coin: React.FC<{size: number; label?: string; variant?: keyof typeof PALETTE; style?: React.CSSProperties}> = ({
	size,
	label,
	variant = 'gold',
	style,
}) => {
	const p = PALETTE[variant];
	return (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: '50%',
				background: p.face,
				boxShadow: `0 0 ${size * 0.4}px ${p.glow}, inset 0 0 0 ${Math.max(2, size * 0.05)}px ${p.rim}55`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: gold.serif,
				fontWeight: 900,
				fontSize: size * 0.42,
				color: p.ink,
				flexShrink: 0,
				...style,
			}}
		>
			<div
				style={{
					width: size * 0.78,
					height: size * 0.78,
					borderRadius: '50%',
					border: `${Math.max(1, size * 0.025)}px solid ${p.ink}55`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{label}
			</div>
		</div>
	);
};
