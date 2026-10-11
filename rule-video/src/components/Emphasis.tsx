import {parseEmphasis} from '../lib/timeline';

/** 渲染带 **高亮** 标记的文字。 */
export const Emphasis: React.FC<{text: string; accent: string}> = ({text, accent}) => (
	<>
		{parseEmphasis(text).map((part, i) =>
			part.strong ? (
				<span key={i} style={{color: accent}}>
					{part.text}
				</span>
			) : (
				<span key={i}>{part.text}</span>
			),
		)}
	</>
);
