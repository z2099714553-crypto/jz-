"""把念念的三张照片转成卡通版，输出到 public/ohana/cartoon/（在 .gitignore 里，不进仓库）。

模型：AnimeGANv2 的 celeba_distill 生成器（bryandlee/animegan2-pytorch，MIT），线条干净、毛色平涂。
第一次运行会把权重（8 MB）下载到 video/.cache/animegan2/。

流程（每张照片）：
    1. 背景换成猫边缘颜色的外推，轮廓不会吸进窗外或沙发的颜色
    2. 生成器转换，原尺寸推理，和原图逐像素对齐（眨眼、耳朵的坐标不用改）
    3. 整体偏金
    4. 眼睛：生成器把瞳孔和虹膜涂成一整块黑，看着吓人。把原照片里的眼睛
       （深色瞳孔、浅金绿的虹膜、反光）柔化后贴回去，外面留着卡通的眼线
    5. 用原来抠图的 alpha 切出来，沿外轮廓描一道细的暖棕线

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

# 照片名 → 眼睛（原图像素的中心和半径，与 src/ohana/scenes/Ch5Niannian.tsx 里的 eyes 一致）
# 茶几那张在睡觉，眼睛是闭着的
JOBS = {
    "niannian_window": [(717, 350, 25, 23), (797, 345, 18, 20)],
    "niannian_sofa": [(237, 547, 31, 30), (356, 562, 27, 27)],
    "niannian_table": [],
}
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
def lab(img: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(img.astype(np.float32) / 255, cv2.COLOR_RGB2LAB)


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


def golden(img: np.ndarray) -> np.ndarray:
    L = lab(img)
    L[..., 1] = L[..., 1] * 1.05 + 3.0
    L[..., 2] = L[..., 2] * 1.05 + 11.0
    return rgb(L)


def paint_eyes(toon: np.ndarray, src: np.ndarray, eyes: list[tuple[int, int, int, int]]) -> np.ndarray:
    """把原照片的眼睛贴回卡通图：保边平滑去掉噪点，虹膜提亮偏金，反光保留；边缘羽化"""
    out = toon.astype(np.float32)
    h, w = src.shape[:2]
    for x, y, rx, ry in eyes:
        pad = int(max(rx, ry) * 1.8)
        x0, y0, x1, y1 = max(0, x - pad), max(0, y - pad), min(w, x + pad), min(h, y + pad)
        eye = src[y0:y1, x0:x1]
        for _ in range(2):
            eye = cv2.bilateralFilter(eye, 7, 26, 5)
        L = lab(eye)
        # 虹膜：比瞳孔亮、又不是反光的那一圈，提亮一点、偏金绿
        iris = np.clip((L[..., 0] - 22) / 14, 0, 1) * np.clip((88 - L[..., 0]) / 10, 0, 1)
        L[..., 0] += iris * 6
        L[..., 1] = L[..., 1] * (1 + 0.3 * iris) - 1.5 * iris
        L[..., 2] = L[..., 2] * (1 + 0.3 * iris) + 9 * iris
        eye = rgb(L).astype(np.float32)
        yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
        d = np.sqrt(((xx - x) / (rx * 1.1)) ** 2 + ((yy - y) / (ry * 1.1)) ** 2)
        m = np.clip((1 - d) * max(rx, ry) / 2.5, 0, 1)[..., None]
        out[y0:y1, x0:x1] = out[y0:y1, x0:x1] * (1 - m) + eye * m
    return out


def outline(alpha: np.ndarray, width: float = 1.8) -> np.ndarray:
    inside = (alpha > 0.5).astype(np.uint8)
    dist = cv2.distanceTransform(inside, cv2.DIST_L2, 3)
    return np.clip(width - dist + 0.5, 0, 1) * 0.7


def load_alpha(name: str) -> np.ndarray:
    return np.asarray(Image.open(CUTS / f"{name}.png").convert("RGBA"))[..., 3].astype(np.float32) / 255


def cached_stylize(g: Generator, img: np.ndarray, key: str) -> np.ndarray:
    """生成器的原始输出缓存在 .cache 里，只调配色和眼睛时不用重跑（换了照片或抠图要删掉缓存）"""
    path = CACHE / f"raw_{key}.png"
    if path.exists():
        return np.asarray(Image.open(path).convert("RGB"))
    out = stylize(g, img)
    Image.fromarray(out).save(path)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    g = load_generator()
    for photo, eyes in JOBS.items():
        src = np.asarray(Image.open(PHOTOS / f"{photo}.jpg").convert("RGB"))
        alpha = load_alpha(photo)
        toon = golden(cached_stylize(g, fill_bg(src, alpha), photo))
        toon = paint_eyes(toon, src, eyes)
        line = outline(alpha)[..., None]
        toon = toon * (1 - line) + LINE * line
        out = np.dstack([toon.clip(0, 255).astype(np.uint8), (alpha * 255 + 0.5).astype(np.uint8)])
        Image.fromarray(out).save(OUT / f"{photo}.png")
        print("写入", f"cartoon/{photo}.png")


if __name__ == "__main__":
    sys.exit(main())
