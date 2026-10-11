import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Background} from './parts/Background';
import {Caption, Chapter} from './parts/Caption';
import {Brain} from './scenes/Brain';
import {Career} from './scenes/Career';
import {Definition} from './scenes/Definition';
import {Equation} from './scenes/Equation';
import {Hook} from './scenes/Hook';
import {Love} from './scenes/Love';
import {LoveQuestion} from './scenes/LoveQuestion';
import {Method} from './scenes/Method';
import {Montage} from './scenes/Montage';
import {Movie} from './scenes/Movie';
import {Outro} from './scenes/Outro';
import {buildSunkTimeline, type SceneId, type SunkScene, type SunkScript} from './timeline';

const SCENES: Record<SceneId, React.FC<{scene: SunkScene; cta?: string}>> = {
	hook: Hook,
	definition: Definition,
	equation: Equation,
	movie: Movie,
	montage: Montage,
	love: Love,
	loveQuestion: LoveQuestion,
	career: Career,
	brain: Brain,
	method: Method,
	outro: Outro,
};

/** 每个场景开头淡入、结尾淡出 8 帧，场景之间不会硬切。 */
const Fade: React.FC<{duration: number; first: boolean; children: React.ReactNode}> = ({duration, first, children}) => {
	const frame = useCurrentFrame();
	const opacity = Math.min(
		first ? 1 : interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'}),
		interpolate(frame, [duration - 8, duration], [1, 0], {extrapolateLeft: 'clamp'}),
	);
	return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export type SunkProps = SunkScript & {cta?: string};

export const SunkCost: React.FC<SunkProps> = (script) => {
	const {scenes} = buildSunkTimeline(script);
	return (
		<AbsoluteFill>
			<Background />
			{scenes.map((scene, i) => {
				const Scene = SCENES[scene.id];
				if (!Scene) return null;
				return (
					<Sequence key={`${scene.id}-${i}`} from={scene.from} durationInFrames={scene.duration}>
						<Fade duration={scene.duration} first={i === 0}>
							<Scene scene={scene} cta={script.cta} />
						</Fade>
						<Chapter text={scene.chapter} />
						<Caption scene={scene} />
					</Sequence>
				);
			})}
			{script.voiceover && <Audio src={staticFile(script.voiceover)} />}
		</AbsoluteFill>
	);
};

export const __meta = (script: SunkScript) => ({durationInFrames: buildSunkTimeline(script).totalFrames});
