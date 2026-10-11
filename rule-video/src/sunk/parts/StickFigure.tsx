import {gold} from '../theme';

/** 火柴人。walk 传当前帧时会迈步；facing=-1 朝左。 */
export const StickFigure: React.FC<{
	height: number;
	color?: string;
	walk?: number;
	facing?: 1 | -1;
	glow?: boolean;
	style?: React.CSSProperties;
}> = ({height, color = gold.silver, walk, facing = 1, glow, style}) => {
	const swing = walk === undefined ? 0 : Math.sin(walk / 4) * 22;
	const sw = Math.max(3, height / 40);
	return (
		<svg
			width={height * 0.5}
			height={height}
			viewBox="-25 0 50 100"
			style={{overflow: 'visible', transform: `scaleX(${facing})`, filter: glow ? `drop-shadow(0 0 12px ${color})` : undefined, ...style}}
		>
			<g stroke={color} strokeWidth={sw * (100 / height)} strokeLinecap="round" fill="none">
				<circle cx={0} cy={12} r={9} />
				<line x1={0} y1={21} x2={0} y2={58} />
				<line x1={0} y1={30} x2={-14} y2={48 - swing * 0.3} transform={`rotate(${swing} 0 30)`} />
				<line x1={0} y1={30} x2={14} y2={48 + swing * 0.3} transform={`rotate(${-swing} 0 30)`} />
				<line x1={0} y1={58} x2={-10} y2={98} transform={`rotate(${-swing} 0 58)`} />
				<line x1={0} y1={58} x2={10} y2={98} transform={`rotate(${swing} 0 58)`} />
			</g>
		</svg>
	);
};
