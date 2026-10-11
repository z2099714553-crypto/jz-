import {useCurrentFrame} from 'remotion';
import type {Layout} from '../lib/layout';
import {theme} from '../lib/theme';
import type {Scene} from '../lib/timeline';

/** 顶部分段进度条：一个场景一格，告诉观众还剩几段，拉完播率。 */
export const ProgressBar: React.FC<{
	scenes: Scene[];
	layout: Layout;
	accent: string;
	title: string;
}> = ({scenes, layout, accent, title}) => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				position: 'absolute',
				top: layout.safe.top,
				left: layout.safe.left,
				right: layout.safe.right,
			}}
		>
			<div style={{display: 'flex', gap: 8}}>
				{scenes.map((s) => {
					const p = Math.min(1, Math.max(0, (frame - s.from) / s.duration));
					return (
						<div key={s.from} style={{flex: s.duration, height: 6, borderRadius: 3, backgroundColor: theme.track}}>
							<div style={{width: `${p * 100}%`, height: '100%', borderRadius: 3, backgroundColor: accent}} />
						</div>
					);
				})}
			</div>
			<div
				style={{
					marginTop: 18,
					fontSize: layout.vertical ? 34 : 28,
					fontWeight: 600,
					color: theme.muted,
					letterSpacing: 2,
				}}
			>
				{title}
			</div>
		</div>
	);
};
