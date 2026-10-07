#!/usr/bin/env python3
"""noise_ratio.py — 时间尺度与噪声：不同查看频率下"看到赚钱"的概率与噪声/信号比。

来源：《随机漫步的傻瓜》第三章"退休牙医"例（μ=15%/年超额报酬，σ=10%/年）。

重要说明（提炼者约定，非原文）：
  * 公式为提炼者按原文数值反推的约定，原文未写公式（表3-1 在中译本 EPUB 中缺失）。
  * 按正态假设，忽略肥尾；真实收益分布有跳空与厚尾，短尺度结论只作直觉参考。
  * P(赚钱)   = Φ((μ/σ)·√Δt)
  * 噪声/信号 = σ·√Δt / (μ·Δt) = σ / (μ·√Δt)
  * Δt 以"年"为单位。默认尺度按原文口径：一年 252 个交易日、每天观察 8 小时
    （原文"假设一天观察8个小时"；252 天为约定，与原文"1小时 30、1秒 1796"吻合）。
  * 原文数值（用于自测）：年 93%、月 67%、秒 50.02%；噪声比 年 0.7、月 2.32、时 30、秒 1796。

用法：
  python3 noise_ratio.py MU SIGMA [--scales 名称=分母 ...]
    MU, SIGMA：年化期望收益与年化波动，小数形式（15% 写 0.15）
    --scales：自定义尺度，形如 年=1 月=12 分钟=120960，表示 Δt = 1/分母 年
  python3 noise_ratio.py --selftest

依赖：仅 Python 3.10+ 标准库。输出为纯文本表格；参数错误时退出码 2。
"""
from __future__ import annotations

import argparse
import math
import sys

TRADING_DAYS = 252  # 约定，非原文
HOURS_PER_DAY = 8   # 原文："假设一天观察8个小时"

DEFAULT_SCALES: list[tuple[str, float]] = [
    ("年", 1.0),
    ("季", 4.0),
    ("月", 12.0),
    ("周", 52.0),
    ("日", float(TRADING_DAYS)),
    ("小时", float(TRADING_DAYS * HOURS_PER_DAY)),
    ("秒", float(TRADING_DAYS * HOURS_PER_DAY * 3600)),
]


def phi(x: float) -> float:
    """标准正态累积分布函数。"""
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def compute(mu: float, sigma: float, per_year: float) -> tuple[float, float]:
    """返回 (P(赚钱), 噪声/信号比)，per_year 为一年内该尺度的个数（Δt = 1/per_year）。"""
    if mu <= 0:
        raise ValueError(f"mu 必须 > 0（当前 {mu}）：期望收益不为正时没有'信号'，噪声/信号比无定义；"
                         "请先用期望值或防炸毁的方法评估该策略本身。")
    if sigma <= 0:
        raise ValueError(f"sigma 必须 > 0（当前 {sigma}）：零波动时不存在噪声，本工具不适用。")
    if per_year <= 0:
        raise ValueError(f"尺度分母必须 > 0（当前 {per_year}）。")
    sqrt_dt = math.sqrt(1.0 / per_year)
    p = phi((mu / sigma) * sqrt_dt)
    ratio = sigma / (mu * sqrt_dt)
    return p, ratio


def parse_scales(items: list[str]) -> list[tuple[str, float]]:
    out = []
    for it in items:
        if "=" not in it:
            raise ValueError(f"尺度格式应为 名称=分母（如 月=12），收到 {it!r}")
        name, val = it.split("=", 1)
        try:
            n = float(val)
        except ValueError:
            raise ValueError(f"尺度分母不是数字：{it!r}") from None
        if n <= 0:
            raise ValueError(f"尺度分母必须 > 0：{it!r}")
        out.append((name.strip(), n))
    return out


def table(mu: float, sigma: float, scales: list[tuple[str, float]]) -> str:
    lines = [f"mu={mu:.4g}/年  sigma={sigma:.4g}/年  （正态假设，忽略肥尾；公式为提炼者约定）",
             f"{'尺度':<6}{'Δt(年)':>14}{'P(赚钱)':>10}{'噪声/信号':>12}"]
    for name, n in scales:
        p, r = compute(mu, sigma, n)
        lines.append(f"{name:<6}{1.0 / n:>14.3e}{p * 100:>9.2f}%{r:>12.2f}")
    return "\n".join(lines)


def selftest() -> int:
    mu, sigma = 0.15, 0.10
    checks = [
        # (名称, 分母, 原文 P, P 容差, 原文噪声比, 噪声比容差)
        ("年", 1, 0.93, 0.005, 0.7, 0.05),       # 计算 93.32% / 0.667
        ("月", 12, 0.67, 0.005, 2.32, 0.02),     # 计算 66.75% / 2.309
        ("小时", 252 * 8, None, None, 30, 0.5),   # 计算 29.93
        ("秒", 252 * 8 * 3600, 0.5002, 0.00005, 1796, 5),  # 计算 50.022% / 1796
    ]
    ok = True
    for name, n, p_book, p_tol, r_book, r_tol in checks:
        p, r = compute(mu, sigma, n)
        good = abs(r - r_book) <= r_tol and (p_book is None or abs(p - p_book) <= p_tol)
        ok &= good
        pb = "—" if p_book is None else f"{p_book * 100:.2f}%"
        print(f"[{'PASS' if good else 'FAIL'}] {name}: P={p * 100:.2f}% (原文 {pb}), "
              f"噪声比={r:.2f} (原文 {r_book})")
    # 原文：每分钟看、一天 8 小时 → 241 分钟愉快 / 239 分钟不愉快
    p_min, _ = compute(mu, sigma, 252 * 8 * 60)
    up = round(480 * p_min)
    good = up == 241
    ok &= good
    print(f"[{'PASS' if good else 'FAIL'}] 分钟: 一天 480 分钟中愉快 {up} 分钟 (原文 241)")
    # 错误输入必须报错
    for bad in [(0.0, 0.1), (-0.05, 0.1), (0.15, 0.0), (0.15, -0.1)]:
        try:
            compute(*bad, 12)
        except ValueError:
            print(f"[PASS] 非法输入 mu={bad[0]}, sigma={bad[1]} 被拒绝")
        else:
            ok = False
            print(f"[FAIL] 非法输入 mu={bad[0]}, sigma={bad[1]} 未报错")
    print("SELFTEST", "OK" if ok else "FAILED")
    return 0 if ok else 1


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="不同查看频率下的赚钱概率与噪声/信号比（正态假设）")
    ap.add_argument("mu", nargs="?", type=float, help="年化期望收益，小数（0.15 = 15%%）")
    ap.add_argument("sigma", nargs="?", type=float, help="年化波动，小数（0.10 = 10%%）")
    ap.add_argument("--scales", nargs="+", metavar="名称=分母",
                    help="自定义尺度，Δt = 1/分母 年，如 月=12 分钟=120960")
    ap.add_argument("--selftest", action="store_true", help="用原书数值自测")
    a = ap.parse_args(argv)
    if a.selftest:
        return selftest()
    if a.mu is None or a.sigma is None:
        ap.error("需要 mu 和 sigma 两个参数（小数形式），或使用 --selftest")
    try:
        scales = parse_scales(a.scales) if a.scales else DEFAULT_SCALES
        print(table(a.mu, a.sigma, scales))
    except ValueError as e:
        print(f"错误：{e}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
