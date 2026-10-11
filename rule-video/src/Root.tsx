import {Composition, type CalculateMetadataFunction} from 'remotion';
import {RuleVideo} from './RuleVideo';
import {LAYOUTS} from './lib/layout';
import {buildTimeline, FPS, type RuleScript} from './lib/timeline';
import example from '../episodes/ep01-kanyidao.json';
import sunkExample from '../episodes/ep02-sunk-cost.json';
import {SunkCost, type SunkProps} from './sunk/SunkCost';
import {buildSunkTimeline} from './sunk/timeline';

// 换一期：Studio 右侧改 props，或渲染时 --props=episodes/xxx.json
const defaultProps = example as RuleScript;

const calculateMetadata: CalculateMetadataFunction<RuleScript> = ({props}) => ({
	durationInFrames: Math.max(1, buildTimeline(props).totalFrames),
});

const sunkMetadata: CalculateMetadataFunction<SunkProps> = ({props}) => ({
	durationInFrames: Math.max(1, buildSunkTimeline(props).totalFrames),
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
		{/* 单期定制：沉没成本（仿知识动画风格），横版 + 竖版 */}
		{([['SunkCost', 1920, 1080], ['SunkCostVertical', 1080, 1920]] as const).map(([id, width, height]) => (
			<Composition
				key={id}
				id={id}
				component={SunkCost}
				width={width}
				height={height}
				fps={FPS}
				durationInFrames={FPS * 100}
				defaultProps={sunkExample as SunkProps}
				calculateMetadata={sunkMetadata}
			/>
		))}
	</>
);
