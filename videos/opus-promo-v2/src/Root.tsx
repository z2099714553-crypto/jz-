import {Composition} from 'remotion';
import {OpusPromo} from './Video';
import timeline from './timeline.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="OpusPromo"
    component={OpusPromo}
    durationInFrames={timeline.totalFrames}
    fps={timeline.fps}
    width={1080}
    height={1920}
  />
);
