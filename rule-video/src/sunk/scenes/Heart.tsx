import {gold} from '../theme';

/** 心形。fade 0 → 1：从金色变成灰色。 */
export const Heart: React.FC<{size: number; fade?: number; glow?: number; style?: React.CSSProperties}> = ({size, fade = 0, glow = 1, style}) => (
	<svg width={size} height={size} viewBox="0 0 100 92" style={{overflow: 'visible', ...style}}>
		<defs>
			<linearGradient id="heartGold" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={gold.goldLight} />
				<stop offset="1" stopColor={gold.goldDeep} />
			</linearGradient>
		</defs>
		<path
			d="M50 90 C20 66 0 48 0 26 C0 10 12 0 27 0 C38 0 46 6 50 15 C54 6 62 0 73 0 C88 0 100 10 100 26 C100 48 80 66 50 90 Z"
			fill="url(#heartGold)"
			style={{filter: `drop-shadow(0 0 ${14 * glow * (1 - fade)}px rgba(233,180,76,0.8))`}}
		/>
		<path
			d="M50 90 C20 66 0 48 0 26 C0 10 12 0 27 0 C38 0 46 6 50 15 C54 6 62 0 73 0 C88 0 100 10 100 26 C100 48 80 66 50 90 Z"
			fill={gold.dim}
			opacity={fade}
		/>
	</svg>
);
