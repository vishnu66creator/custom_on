from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/home/ubuntu/upload/ChatGPTImageAug28,2026,10_09_13PM.png")
OUT = ROOT / "public" / "assets" / "size_catalog"
OUT.mkdir(parents=True, exist_ok=True)

image = cv2.imread(str(SOURCE), cv2.IMREAD_COLOR)
if image is None:
    raise SystemExit(f"Could not read {SOURCE}")
h, w = image.shape[:2]
if (w, h) != (1536, 1024):
    raise SystemExit(f"Expected 1536x1024, got {w}x{h}")

products = [
    ("regular-tee", 0),
    ("oversized-tee", 1),
    ("polo-tee", 2),
    ("full-sleeve-tee", 3),
    ("pullover-hoodie", 4),
    ("zip-up-hoodie", 5),
]
sizes = ["S", "M", "L"]
# The uploaded chart has a 112px product-label column, then 10 equal image columns.
x_edges = [112, 234, 356, 478, 600, 723, 845, 967, 1089, 1211, 1334]
y_edges = [35, 182, 330, 477, 623, 758, 903]


def clean_mask(crop: np.ndarray, product_id: str, side: str) -> np.ndarray:
    # The uploaded chart uses near-white backgrounds, so GrabCut tends to
    # classify pale sleeves as background. Use the background brightness at the
    # crop border and a small connected-component cleanup instead.
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    border = max(2, int(min(gray.shape) * 0.06))
    background = float(np.median(np.concatenate([
        gray[:border, :].ravel(), gray[-border:, :].ravel(),
        gray[:, :border].ravel(), gray[:, -border:].ravel(),
    ])))
    threshold = max(210.0, background - 5.0)
    fg = np.where(gray < threshold, 255, 0).astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    count, labels, stats, _ = cv2.connectedComponentsWithStats(fg, 8)
    if count > 1:
        largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        fg = np.where(labels == largest, 255, 0).astype(np.uint8)
    return cv2.GaussianBlur(fg, (0, 0), 0.7)

manifest = {}
for product_id, row in products:
    manifest[product_id] = {}
    for size_index, size in enumerate(sizes):
        manifest[product_id][size] = {}
        for side_index, side in enumerate(("front", "back")):
            column = size_index * 2 + side_index
            x0, x1 = x_edges[column] + 4, x_edges[column + 1] - 4
            y0, y1 = y_edges[row] + 4, y_edges[row + 1] - 4
            crop = image[y0:y1, x0:x1].copy()
            # Upscale the uploaded source for crisp editor rendering and keep the fixed-color photo intact.
            crop = cv2.resize(crop, (1600, 2000), interpolation=cv2.INTER_LANCZOS4)
            alpha_small = clean_mask(image[y0:y1, x0:x1].copy(), product_id, side)
            alpha = cv2.resize(alpha_small, (1600, 2000), interpolation=cv2.INTER_CUBIC)
            rgba = cv2.cvtColor(crop, cv2.COLOR_BGR2BGRA)
            rgba[:, :, 3] = 255
            mask_rgba = np.zeros_like(rgba)
            mask_rgba[:, :, 3] = alpha
            product_dir = OUT / product_id
            product_dir.mkdir(parents=True, exist_ok=True)
            visible_name = f"{size.lower()}-{side}.png"
            mask_name = f"{size.lower()}-{side}-mask.png"
            cv2.imwrite(str(product_dir / visible_name), rgba)
            cv2.imwrite(str(product_dir / mask_name), mask_rgba)
            manifest[product_id][size][side] = {
                "image": f"/assets/size_catalog/{product_id}/{visible_name}",
                "mask": f"/assets/size_catalog/{product_id}/{mask_name}",
            }
            print(f"wrote {product_id} {size} {side}")

import json
(ROOT / "src" / "lib" / "size-media-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
