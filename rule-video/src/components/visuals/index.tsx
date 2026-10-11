import type {Visual} from '../../lib/timeline';
import {BigNumber} from './BigNumber';
import {ImageVisual} from './ImageVisual';
import {Network} from './Network';
import {People} from './People';
import {Progress} from './Progress';

export const VisualBlock: React.FC<{visual: Visual; width: number; height: number; accent: string; delay: number}> = ({
	visual,
	...box
}) => {
	switch (visual.type) {
		case 'progress':
			return <Progress {...visual} {...box} />;
		case 'people':
			return <People {...visual} {...box} />;
		case 'network':
			return <Network {...visual} {...box} />;
		case 'number':
			return <BigNumber {...visual} {...box} />;
		case 'image':
			return <ImageVisual src={visual.src} caption={visual.caption} width={box.width} height={box.height} />;
	}
};
