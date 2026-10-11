/** 按原始数据里最多的小数位显示，动画中途也不会出现 3.7812 这种数。 */
export function decimalsOf(values: number[]): number {
	return Math.max(0, ...values.map((v) => (String(v).split('.')[1] ?? '').length));
}

export const formatValue = (v: number, decimals: number) => v.toFixed(decimals);
