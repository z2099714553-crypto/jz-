import {useVideoConfig} from 'remotion';

/** 当前画幅。竖版按抖音安全区排：右侧留出按钮，底部留出文案区。 */
export function useStage() {
	const {width, height} = useVideoConfig();
	const v = height > width;
	return {v, w: width, h: height, cx: width / 2};
}
