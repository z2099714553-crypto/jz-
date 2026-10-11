export const theme = {
	bg: '#0E0F13',
	panel: '#1A1C23',
	track: '#262933',
	text: '#F5F5F2',
	muted: '#8B8F9C',
	dim: '#4A4E5A',
	accent: '#FF5A36',
	font: '"PingFang SC", "Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "WenQuanYi Zen Hei", sans-serif',
	numFont: '"DIN Alternate", "Roboto Mono", "SF Mono", "PingFang SC", sans-serif',
};

/** 多行标题均衡换行，避免最后一行只剩一个字（"一小部 / 分"）。 */
export const balanced = {textWrap: 'balance'} as React.CSSProperties;
