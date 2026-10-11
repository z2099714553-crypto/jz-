// 两种画幅的安全区。竖版按抖音 / 视频号 / 小红书 / Reels 的界面遮挡取并集：
// 顶部状态栏和标签、底部文案和音乐条、右侧点赞评论按钮都避开。

export type Layout = {
	vertical: boolean;
	width: number;
	height: number;
	safe: {top: number; bottom: number; left: number; right: number};
	captionMaxChars: number;
	captionSize: number;
	/** 字幕区底边到画面底边的距离 */
	captionBottom: number;
};

export const LAYOUTS = {
	vertical: {
		vertical: true,
		width: 1080,
		height: 1920,
		safe: {top: 220, bottom: 460, left: 72, right: 160},
		captionMaxChars: 13,
		captionSize: 64,
		captionBottom: 470,
	},
	horizontal: {
		vertical: false,
		width: 1920,
		height: 1080,
		safe: {top: 72, bottom: 190, left: 120, right: 120},
		captionMaxChars: 22,
		captionSize: 54,
		captionBottom: 80,
	},
} satisfies Record<string, Layout>;

/** 正文区：顶部进度条 / 标题之下，字幕区之上。 */
export function contentBox(layout: Layout) {
	const header = layout.vertical ? 110 : 80;
	const captionBlock = layout.vertical ? 200 : 0;
	const top = layout.safe.top + header;
	const bottom = layout.vertical
		? layout.height - layout.captionBottom - captionBlock
		: layout.height - layout.safe.bottom;
	const left = layout.safe.left;
	const right = layout.width - layout.safe.right;
	return {top, bottom, left, right, width: right - left, height: bottom - top};
}
