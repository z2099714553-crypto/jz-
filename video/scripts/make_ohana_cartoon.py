"""把家人和念念的照片转成卡通版，输出到 public/ohana/cartoon/（在 .gitignore 里，不进仓库）。

模型：AnimeGANv2 的 celeba_distill 生成器（bryandlee/animegan2-pytorch，MIT）。
它给人物画出干净的线稿和平涂的肤色，长相保留得比其他风格模型都好；四个角色用同一个模型，画风统一。
第一次运行会把权重（8 MB）下载到 video/.cache/animegan2/。

流程（每张照片）：
    1. 背景换成主体边缘颜色的外推，轮廓不会吸进天空或树叶的颜色
    2. 人物先把大块阴影提亮一点，脸上不会出现很重的阴影块（猫不提亮，否则鼻子会画成黑色）
    3. 生成器转换，原尺寸推理，和原图逐像素对齐
    4. 配色往暖处拉：肤色和阴影去掉发紫的灰，念念偏金色
    5. 用原来抠图的 alpha 切出单人和合照，沿合照的外轮廓描一道细的暖棕线
第四章相框里的两张照片（S19）用整张转换，连背景一起画。

输出和 public/ohana/cutouts/ 同名同尺寸，场景里只换目录。之后再运行
    python scripts/prepare_ohana_layers.py public/ohana/cartoon
生成拍肩和全家合影用的分层图。

运行（需要 torch、numpy、opencv-python-headless、pillow）：
    python scripts/make_ohana_cartoon.py
"""

import sys
import urllib.request
from pathlib import Path

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torch import nn

ROOT = Path(__file__).resolve().parent.parent
PHOTOS = ROOT / "public" / "photos"
CUTS = ROOT / "public" / "ohana" / "cutouts"
OUT = ROOT / "public" / "ohana" / "cartoon"
CACHE = ROOT / ".cache" / "animegan2"
WEIGHTS = "https://raw.githubusercontent.com/bryandlee/animegan2-pytorch/main/weights/celeba_distill.pt"

# photo 照片；pair 定出主体范围的合照抠图；pieces 从同一张照片切出来的抠图
# cheeks 每个人脸颊上的一点（原图像素），用来认出整片皮肤；念念没有
# cool 海边那张被天空映得发蓝：头发和白 T 恤的蓝色要压掉
# soften 脸上阴影纹提亮的程度；ink 五官线条加深的程度（爸爸笑眯了眼，线要深一点才看得见）
JOBS = [
    dict(photo="mom", pair="mom_pair", pieces=["mom_pair", "mom", "me_a"], cheeks=[(382, 598), (553, 750)], cool=True, soften=1.0),
    dict(photo="dad", pair="dad_pair", pieces=["dad_pair", "dad", "me_b"], cheeks=[(955, 505), (738, 525)], soften=0.3, ink=0.45),
    dict(photo="niannian_window", pair="niannian_window", pieces=["niannian_window"]),
    dict(photo="niannian_sofa", pair="niannian_sofa", pieces=["niannian_sofa"]),
    dict(photo="niannian_table", pair="niannian_table", pieces=["niannian_table"]),
]
PRINTS = ["mom", "dad"]
LINE = np.array([74, 48, 34], np.float32)  # 外轮廓的暖深棕


# ---------- AnimeGANv2 生成器（与 bryandlee/animegan2-pytorch 的 model.py 相同） ----------
class ConvNormLReLU(nn.Sequential):
    def __init__(self, in_ch, out_ch, kernel_size=3, stride=1, padding=1, groups=1, bias=False):
        super().__init__(
            nn.ReflectionPad2d(padding),
            nn.Conv2d(in_ch, out_ch, kernel_size=kernel_size, stride=stride, padding=0, groups=groups, bias=bias),
            nn.GroupNorm(num_groups=1, num_channels=out_ch, affine=True),
            nn.LeakyReLU(0.2, inplace=True),
        )


class InvertedResBlock(nn.Module):
    def __init__(self, in_ch, out_ch, expansion_ratio=2):
        super().__init__()
        self.use_res_connect = in_ch == out_ch
        bottleneck = int(round(in_ch * expansion_ratio))
        layers = []
        if expansion_ratio != 1:
            layers.append(ConvNormLReLU(in_ch, bottleneck, kernel_size=1, padding=0))
        layers.append(ConvNormLReLU(bottleneck, bottleneck, groups=bottleneck, bias=True))
        layers.append(nn.Conv2d(bottleneck, out_ch, kernel_size=1, padding=0, bias=False))
        layers.append(nn.GroupNorm(num_groups=1, num_channels=out_ch, affine=True))
        self.layers = nn.Sequential(*layers)

    def forward(self, x):
        out = self.layers(x)
        return x + out if self.use_res_connect else out


class Generator(nn.Module):
    def __init__(self):
        super().__init__()
        self.block_a = nn.Sequential(ConvNormLReLU(3, 32, kernel_size=7, padding=3), ConvNormLReLU(32, 64, stride=2, padding=(0, 1, 0, 1)), ConvNormLReLU(64, 64))
        self.block_b = nn.Sequential(ConvNormLReLU(64, 128, stride=2, padding=(0, 1, 0, 1)), ConvNormLReLU(128, 128))
        self.block_c = nn.Sequential(
            ConvNormLReLU(128, 128),
            InvertedResBlock(128, 256, 2),
            InvertedResBlock(256, 256, 2),
            InvertedResBlock(256, 256, 2),
            InvertedResBlock(256, 256, 2),
            ConvNormLReLU(256, 128),
        )
        self.block_d = nn.Sequential(ConvNormLReLU(128, 128), ConvNormLReLU(128, 128))
        self.block_e = nn.Sequential(ConvNormLReLU(128, 64), ConvNormLReLU(64, 64), ConvNormLReLU(64, 32, kernel_size=7, padding=3))
        self.out_layer = nn.Sequential(nn.Conv2d(32, 3, kernel_size=1, stride=1, padding=0, bias=False), nn.Tanh())

    def forward(self, x):
        out = self.block_a(x)
        half = out.size()[-2:]
        out = self.block_c(self.block_b(out))
        out = self.block_d(F.interpolate(out, half, mode="bilinear", align_corners=True))
        out = self.block_e(F.interpolate(out, x.size()[-2:], mode="bilinear", align_corners=True))
        return self.out_layer(out)


def load_generator() -> Generator:
    path = CACHE / "celeba_distill.pt"
    if not path.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        print("下载权重", WEIGHTS)
        urllib.request.urlretrieve(WEIGHTS, path)
    g = Generator().eval()
    g.load_state_dict(torch.load(path, map_location="cpu"))
    return g


@torch.no_grad()
def stylize(g: Generator, rgb: np.ndarray) -> np.ndarray:
    h, w = rgb.shape[:2]
    W, H = w // 32 * 32, h // 32 * 32
    x = cv2.resize(rgb, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 127.5 - 1
    y = g(torch.from_numpy(x).permute(2, 0, 1)[None]).clamp(-1, 1)[0].permute(1, 2, 0).numpy()
    y = ((y + 1) * 127.5).astype(np.uint8)
    return cv2.resize(y, (w, h), interpolation=cv2.INTER_CUBIC)


# ---------- 前后处理 ----------
def lab(rgb: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(rgb.astype(np.float32) / 255, cv2.COLOR_RGB2LAB)


def rgb(lab_img: np.ndarray) -> np.ndarray:
    return (np.clip(cv2.cvtColor(lab_img.astype(np.float32), cv2.COLOR_LAB2RGB), 0, 1) * 255 + 0.5).astype(np.uint8)


def fill_bg(img: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    """背景换成主体边缘颜色的外推（在 1/4 尺寸上修补再放大、模糊）"""
    small = cv2.resize(img, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA)
    hole = cv2.resize(((alpha < 0.5) * 255).astype(np.uint8), None, fx=0.25, fy=0.25, interpolation=cv2.INTER_NEAREST)
    bg = cv2.inpaint(small, hole, 6, cv2.INPAINT_TELEA)
    bg = cv2.GaussianBlur(cv2.resize(bg, img.shape[1::-1], interpolation=cv2.INTER_LINEAR), (0, 0), 6)
    k = alpha[..., None]
    return (img * k + bg * (1 - k)).astype(np.uint8)


def lift(img: np.ndarray, amount: float) -> np.ndarray:
    """只提亮低频的光照（大块阴影），细节不动"""
    L = lab(img)
    lum = L[..., 0] / 100
    base = cv2.GaussianBlur(lum, (0, 0), 25)
    target = base + np.clip(0.62 - base, 0, None) * amount
    L[..., 0] = np.clip(lum - base + target, 0, 1) * 100
    return rgb(L)


def skin_mask(toon: np.ndarray, alpha: np.ndarray, cheeks: list[tuple[int, int]], r: int = 12) -> np.ndarray:
    """和脸颊取样颜色接近的像素算皮肤。
    在生成器的输出上取样，不在原图上：海边那张是逆光，原图里脸是灰蓝的，和白 T 恤分不开；
    转换后肤色已经偏暖，和衣服分得清。先去掉线条再比 Lab 距离，亮度的权重低，阴影里的皮肤也算"""
    sm = lab(cv2.bilateralFilter(cv2.medianBlur(toon, 7), 9, 30, 9))
    m = np.zeros(alpha.shape, np.float32)
    for x, y in cheeks:
        ref = np.median(sm[y - r : y + r, x - r : x + r].reshape(-1, 3), axis=0)
        d = np.sqrt(((sm[..., 0] - ref[0]) * 0.3) ** 2 + (sm[..., 1] - ref[1]) ** 2 + (sm[..., 2] - ref[2]) ** 2)
        m = np.maximum(m, np.clip((13 - d) / 6, 0, 1))
    m = cv2.morphologyEx(m * (alpha > 0.5), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
    return cv2.GaussianBlur(m, (0, 0), 2)


def regrade(img: np.ndarray, skin: np.ndarray | None = None, cool: bool = False, soften: float = 1.0, ink: float = 0.0) -> np.ndarray:
    L = lab(img)
    l, a, b = L[..., 0], L[..., 1], L[..., 2]
    if skin is None:  # 念念：整体偏金
        L[..., 1] = a * 1.05 + 3.0
        L[..., 2] = b * 1.05 + 11.0
        return rgb(L)
    # 皮肤涂成暖桃色：亮处浅，暗处更红一点
    t = np.clip((86 - l) / 30, 0, 1)
    w = skin * 0.8
    a[:] = a * (1 - w) + (7 + 6 * t) * w
    b[:] = b * (1 - w) + (15 + 6 * t) * w
    # 脸上浅的阴影纹（法令纹、鼻翼、下颌的灰块）提亮；眼睛、眉毛、嘴这些更深的线不动
    top = cv2.GaussianBlur(cv2.dilate(l, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))), (0, 0), 3)
    diff = top - l
    l += (np.interp(diff, [3, 12, 22, 34], [0, 7, 5, 0]) + diff * 0.2) * skin * soften  # 五官的线也淡一点，偏棕不偏黑
    l -= np.clip(diff - 8, 0, 24) * ink * skin
    if cool:
        rest = 1 - skin
        dark = np.clip((48 - l) / 18, 0, 1) * (b < 0) * rest
        bright = np.clip((l - 58) / 14, 0, 1) * (b < -3) * rest
        k = 1 - 0.65 * dark - 0.7 * bright
        a *= k
        b *= k
        # 逆光把妈妈的橙色上衣压成了灰粉，暖色的衣服拉回橙色
        orange = np.clip((a - 4) / 6, 0, 1) * np.clip((b + 2) / 6, 0, 1) * rest
        a += orange * 3
        b += orange * 16
    # 其余颜色整体偏暖一点
    L[..., 1] = a * 1.04 + 1.5
    L[..., 2] = b * 1.04 + 4.0
    return rgb(L)


def outline(alpha: np.ndarray, width: float = 1.8) -> np.ndarray:
    inside = (alpha > 0.5).astype(np.uint8)
    dist = cv2.distanceTransform(inside, cv2.DIST_L2, 3)
    return np.clip(width - dist + 0.5, 0, 1) * 0.7


def load_alpha(name: str) -> np.ndarray:
    return np.asarray(Image.open(CUTS / f"{name}.png").convert("RGBA"))[..., 3].astype(np.float32) / 255


def cached_stylize(g: Generator, img: np.ndarray, key: str) -> np.ndarray:
    """生成器的原始输出缓存在 .cache 里，只调配色时不用重跑（换了照片或抠图要删掉缓存）"""
    path = CACHE / f"raw_{key}.png"
    if path.exists():
        return np.asarray(Image.open(path).convert("RGB"))
    out = stylize(g, img)
    Image.fromarray(out).save(path)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    g = load_generator()
    for job in JOBS:
        photo, cheeks = job["photo"], job.get("cheeks")
        src = np.asarray(Image.open(PHOTOS / f"{photo}.jpg").convert("RGB"))
        silhouette = load_alpha(job["pair"])
        img = fill_bg(src, silhouette)
        if cheeks:
            img = lift(img, 0.35)
        raw = cached_stylize(g, img, photo)
        skin = skin_mask(raw, silhouette, cheeks) if cheeks else None
        toon = regrade(raw, skin, job.get("cool", False), job.get("soften", 1.0), job.get("ink", 0.0)).astype(np.float32)
        line = outline(silhouette)[..., None]
        toon = toon * (1 - line) + LINE * line
        for piece in job["pieces"]:
            a = load_alpha(piece)
            out = np.dstack([toon.clip(0, 255).astype(np.uint8), (a * 255 + 0.5).astype(np.uint8)])
            Image.fromarray(out).save(OUT / f"{piece}.png")
            print("写入", f"cartoon/{piece}.png")
        if photo in PRINTS:
            # 相框里的整张：背景在半尺寸上转换，笔触更大更干净；人物直接用上面的结果
            h, w = src.shape[:2]
            half = cv2.resize(lift(src, 0.35), (w // 2, h // 2), interpolation=cv2.INTER_AREA)
            bg = cv2.resize(cached_stylize(g, half, f"{photo}_bg"), (w, h), interpolation=cv2.INTER_CUBIC)
            bg = cv2.edgePreservingFilter(bg, flags=cv2.RECURS_FILTER, sigma_s=20, sigma_r=0.2)  # 树叶的碎笔触抹平一些
            bg = regrade(bg, np.zeros((h, w), np.float32)).astype(np.float32)
            k = silhouette[..., None]
            full = (toon * k + bg * (1 - k)).clip(0, 255).astype(np.uint8)
            Image.fromarray(full).save(OUT / f"{photo}.jpg", quality=92)
            print("写入", f"cartoon/{photo}.jpg")


if __name__ == "__main__":
    sys.exit(main())
