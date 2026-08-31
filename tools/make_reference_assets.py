from pathlib import Path
import cv2
import numpy as np

root = Path(__file__).resolve().parents[1]
assets = root / "src" / "assets"
refs = assets / "references"


def cutout(source: Path, target: Path, rect=None):
    image = cv2.imread(str(source), cv2.IMREAD_COLOR)
    if image is None:
        raise RuntimeError(f"Could not read {source}")
    h, w = image.shape[:2]
    max_dimension = max(h, w)
    if max_dimension > 1200:
        scale = 1200 / max_dimension
        image = cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        h, w = image.shape[:2]
    mask = np.full((h, w), cv2.GC_BGD, np.uint8)
    if rect is None:
        mx, my = max(2, int(w * 0.03)), max(2, int(h * 0.03))
        rect = (mx, my, w - 2 * mx, h - 2 * my)
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(image, mask, rect, bgd, fgd, 10, cv2.GC_INIT_WITH_RECT)
    fg = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    kernel = np.ones((5, 5), np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, kernel)
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, kernel)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(fg, 8)
    if count > 1:
        largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        fg = np.where(labels == largest, 255, 0).astype(np.uint8)
    alpha = cv2.GaussianBlur(fg, (0, 0), 1.0)
    rgba = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = alpha
    cv2.imwrite(str(target), rgba)
    print(f"wrote {target.name} {w}x{h} alpha={(alpha > 10).mean():.2f}")

# The source contains a matching zip-up hoodie pair: left = front, right = back.
pair = cv2.imread(str(refs / "zip-hoodie-front-back-reference.jpg"), cv2.IMREAD_COLOR)
if pair is None:
    raise RuntimeError("Missing zip hoodie pair reference")
h, w = pair.shape[:2]
left = pair[int(h * 0.05):int(h * 0.9), int(w * 0.02):int(w * 0.49)]
right = pair[int(h * 0.05):int(h * 0.9), int(w * 0.51):int(w * 0.98)]
left_path = refs / "zip-front-crop.jpg"
right_path = refs / "zip-back-crop.jpg"
cv2.imwrite(str(left_path), left)
cv2.imwrite(str(right_path), right)
cutout(left_path, assets / "zip-up-hoodie-front-cutout.png")
cutout(right_path, assets / "zip-up-hoodie-back-cutout.png")

# Isolated rear-view references for pullover hoodie and long-sleeve tee.
cutout(refs / "hoodie-back-blue-reference.jpg", assets / "pullover-hoodie-back-cutout.png")
cutout(refs / "long-sleeve-back-reference.jpg", assets / "full-sleeve-tee-back-cutout.png")
