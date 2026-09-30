"""从抠图生成《零极限 · 家》第四、五章需要的分层图，输出到同一个目录。

输入（都在 .gitignore 里，不进仓库），目录默认 public/ohana/cutouts/，也可以指定卡通版的目录：
    dad_pair.png   图 2 爸爸和我的抠图
    dad.png        拆出来的爸爸（前臂是一个独立的块）
    me_b.png       拆出来的我

输出：
    dad_body.png       拆出来的爸爸去掉前臂，第五章全家合影用（断开的上臂藏在我身后）
    dad_forearm.png    爸爸搭在我肩上的前臂和手，单独一层，用来做「拍两下肩」
    dad_pat_base.png   合照去掉前臂；手底下被遮住的那块肩膀用 T 恤的颜色补齐，
                       前臂抬起时露出来的是衣服而不是透明的洞

运行（需要 numpy、scipy、opencv-python-headless、pillow）：
    python scripts/prepare_ohana_layers.py                      # 照片抠图
    python scripts/prepare_ohana_layers.py public/ohana/cartoon # 卡通版（片子里用的）
"""

import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
DIR = ROOT / sys.argv[1] if len(sys.argv) > 1 else ROOT / "public" / "ohana" / "cutouts"


def load(name: str) -> np.ndarray:
    return np.array(Image.open(DIR / f"{name}.png").convert("RGBA"))


def main() -> None:
    pair = load("dad_pair")
    dad = load("dad")
    me = load("me_b")

    # 爸爸的前臂：dad.png 里与身体分开、面积第二大的连通块
    solid = dad[:, :, 3] > 20
    lab, n = ndimage.label(solid)
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    arm_label = int(np.argsort(sizes)[::-1][1]) + 1
    arm = lab == arm_label

    # 前臂层：只取前臂本身，边缘轻微羽化；不带周围的脖子和衣服，抬手时不会拖出一圈轮廓
    soft = cv2.GaussianBlur(arm.astype(np.float32), (0, 0), 0.8)
    forearm = pair.copy()
    forearm[:, :, 3] = (pair[:, :, 3].astype(np.float32) * np.clip(soft * 1.6, 0, 1)).astype(np.uint8)
    arm = ndimage.binary_dilation(arm, iterations=2)
    Image.fromarray(forearm).save(DIR / "dad_forearm.png")

    # 底图：去掉前臂，再用周围 T 恤的颜色把我的肩膀补上
    me_mask = me[:, :, 3] > 20
    # 把我身体轮廓上被手臂挖出的缺口闭合起来，但不向外扩到背景里
    disk = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (61, 61))
    hull = cv2.morphologyEx(me_mask.astype(np.uint8), cv2.MORPH_CLOSE, disk) | me_mask.astype(np.uint8)
    shoulder = arm & (hull > 0) & ~me_mask

    base = pair.copy()
    rgb = cv2.cvtColor(base[:, :, :3], cv2.COLOR_RGB2BGR)
    fill = cv2.inpaint(rgb, (arm & (hull > 0)).astype(np.uint8) * 255, 9, cv2.INPAINT_TELEA)
    fill = cv2.cvtColor(fill, cv2.COLOR_BGR2RGB)
    region = arm & (hull > 0)
    base[region, :3] = fill[region]
    alpha = base[:, :, 3].astype(np.float32)
    alpha[arm & ~(hull > 0)] = 0
    alpha[shoulder] = 255
    alpha[region & me_mask] = 255
    base[:, :, 3] = alpha.astype(np.uint8)
    Image.fromarray(base).save(DIR / "dad_pat_base.png")

    # 全家合影用的爸爸：只留身体那一块
    body = dad.copy()
    body_mask = cv2.GaussianBlur((lab == int(np.argsort(sizes)[::-1][0]) + 1).astype(np.float32), (0, 0), 0.8)
    body[:, :, 3] = (dad[:, :, 3].astype(np.float32) * np.clip(body_mask * 1.6, 0, 1)).astype(np.uint8)
    Image.fromarray(body).save(DIR / "dad_body.png")

    ys, xs = np.nonzero(arm)
    print(f"前臂范围 x {xs.min()}–{xs.max()}  y {ys.min()}–{ys.max()}")
    print("已写入 dad_forearm.png、dad_pat_base.png、dad_body.png")


if __name__ == "__main__":
    main()
