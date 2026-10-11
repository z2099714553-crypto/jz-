import {gold} from '../theme';

/** 金色渐变衬线大字，带辉光。reveal 0→1：字距收拢、模糊变清晰。 */
export const GoldTitle: React.FC<{children: React.ReactNode; size: number; reveal?: number; style?: React.CSSProperties}> = ({
	children,
	size,
	reveal = 1,
	style,
}) => (
	<div
		style={{
			fontFamily: gold.serif,
			fontWeight: 900,
			fontSize: size,
			letterSpacing: `${(1 - reveal) * 0.5 + 0.08}em`,
			opacity: reveal,
			filter: `blur(${(1 - reveal) * 12}px) drop-shadow(0 0 ${size * 0.25}px rgba(233,180,76,0.45))`,
			background: `linear-gradient(180deg, ${gold.goldLight}, ${gold.gold} 55%, ${gold.goldDeep})`,
			WebkitBackgroundClip: 'text',
			backgroundClip: 'text',
			color: 'transparent',
			whiteSpace: 'pre-line',
			textAlign: 'center',
			lineHeight: 1.2,
			...style,
		}}
	>
		{children}
	</div>
);

/** 小号胶囊标签。 */
export const Pill: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({
	children,
	color = gold.silver,
	size = 26,
	style,
}) => (
	<div
		style={{
			fontFamily: gold.sans,
			fontSize: size,
			color,
			border: `1.5px solid ${color}88`,
			borderRadius: 999,
			padding: `${size * 0.25}px ${size * 0.7}px`,
			whiteSpace: 'nowrap',
			...style,
		}}
	>
		{children}
	</div>
);

/** 把 text 里出现的 words 标成金色。 */
export const Highlight: React.FC<{text: string; words?: string[]; color?: string}> = ({text, words = [], color = gold.gold}) => {
	const list = words.filter(Boolean);
	if (!list.length) return <>{text}</>;
	const re = new RegExp(`(${list.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
	return (
		<>
			{text.split(re).map((part, i) =>
				list.includes(part) ? (
					<span key={i} style={{color}}>
						{part}
					</span>
				) : (
					<span key={i}>{part}</span>
				),
			)}
		</>
	);
};
