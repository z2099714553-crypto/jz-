import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Captions} from './components/Captions';
import {ProgressBar} from './components/ProgressBar';
import {LAYOUTS} from './lib/layout';
import {theme} from './lib/theme';
import {buildTimeline, plainText, type RuleScript} from './lib/timeline';
import {HookScene} from './scenes/HookScene';
import {OutroScene} from './scenes/OutroScene';
import {PointScene} from './scenes/PointScene';

export const RuleVideo: React.FC<RuleScript> = (script) => {
	const {width, height} = useVideoConfig();
	const layout = height > width ? LAYOUTS.vertical : LAYOUTS.horizontal;
	const accent = script.accent ?? theme.accent;
	const {scenes} = buildTimeline(script);

	return (
		<AbsoluteFill style={{backgroundColor: theme.bg, color: theme.text, fontFamily: theme.font}}>
			{scenes.map((scene) => (
				<Sequence key={`${scene.kind}-${scene.index}`} from={scene.from} durationInFrames={scene.duration}>
					{scene.kind === 'hook' && <HookScene script={script} layout={layout} accent={accent} />}
					{scene.kind === 'point' && (
						<PointScene
							point={script.points[scene.index]}
							index={scene.index}
							count={script.points.length}
							layout={layout}
							accent={accent}
						/>
					)}
					{scene.kind === 'outro' && <OutroScene outro={script.outro} layout={layout} accent={accent} />}
					{/* 开头大字已经是结论本身时，不再重复上字幕 */}
					{!(scene.kind === 'hook' && plainText(script.hook.text) === scene.narration) && (
						<Captions scene={scene} layout={layout} />
					)}
				</Sequence>
			))}
			<ProgressBar scenes={scenes} layout={layout} accent={accent} title={script.title} />
			{script.voiceover && <Audio src={staticFile(script.voiceover)} />}
		</AbsoluteFill>
	);
};
