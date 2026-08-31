from pathlib import Path
import cv2
import numpy as np

root = Path(__file__).resolve().parents[1] / "src" / "assets"
items = {
    "regular-tee-front.png": "regular-tee-front-cutout.png",
    "regular-tee-back.png": "regular-tee-back-cutout.png",
    "oversized-tee-back.png": "oversized-tee-back-cutout.png",
    "polo-tee-back.png": "polo-tee-back-cutout.png",
    "full-sleeve-tee-front.png": "full-sleeve-tee-front-cutout.png",
    "product-hoodie.jpg": "product-hoodie-cutout.png",
    "product-oversized.jpg": "product-oversized-cutout.png",
    "product-polo.jpg": "product-polo-cutout.png",
}

for source_name, output_name in items.items():
    source = root / source_name
    if not source.exists():
        continue
    image = cv2.imread(str(source), cv2.IMREAD_COLOR)
    h, w = image.shape[:2]
    mask = np.full((h, w), cv2.GC_BGD, np.uint8)
    margin_x, margin_y = max(3, int(w * 0.04)), max(3, int(h * 0.04))
    rect = (margin_x, margin_y, w - 2 * margin_x, h - 2 * margin_y)
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(image, mask, rect, bgd, fgd, 8, cv2.GC_INIT_WITH_RECT)
    foreground = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    kernel = np.ones((7, 7), np.uint8)
    foreground = cv2.morphologyEx(foreground, cv2.MORPH_CLOSE, kernel)
    foreground = cv2.morphologyEx(foreground, cv2.MORPH_OPEN, kernel)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(foreground, 8)
    if count > 1:
        largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        foreground = np.where(labels == largest, 255, 0).astype(np.uint8)
    alpha = cv2.GaussianBlur(foreground, (0, 0), 1.2)
    rgba = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = alpha
    cv2.imwrite(str(root / output_name), rgba)
    print(f"wrote {output_name} foreground={int((foreground > 0).sum())}/{w*h}")
