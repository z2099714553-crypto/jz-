import {Composition, type CalculateMetadataFunction} from 'remotion';
import {RuleVideo} from './RuleVideo';
import {LAYOUTS} from './lib/layout';
import {buildTimeline, FPS, type RuleScript} from './lib/timeline';
import example from '../episodes/ep01-kanyidao.json';

// 换一期：Studio 右侧改 props，或渲染时 --props=episodes/xxx.json
const defaultProps = example as RuleScript;

const calculateMetadata: CalculateMetadataFunction<RuleScript> = ({props}) => ({
	durationInFrames: Math.max(1, buildTimeline(props).totalFrames),
});

export const RemotionRoot: React.FC = () => (
	<>
		{(['vertical', 'horizontal'] as const).map((key) => (
			<Composition
				key={key}
				id={key === 'vertical' ? 'RuleVertical' : 'RuleHorizontal'}
				component={RuleVideo}
				width={LAYOUTS[key].width}
				height={LAYOUTS[key].height}
				fps={FPS}
				durationInFrames={FPS * 60}
				defaultProps={defaultProps}
				calculateMetadata={calculateMetadata}
			/>
		))}
	</>
);
