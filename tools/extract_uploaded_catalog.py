from pathlib import Path
import cv2
import numpy as np

root = Path(__file__).resolve().parents[1]
source_path = Path("/home/ubuntu/upload/ChatGPTImageAug28,2026,08_28_00PM.png")
out_dir = root / "src/assets/uploaded_catalog"
out_dir.mkdir(parents=True, exist_ok=True)
source = cv2.imread(str(source_path), cv2.IMREAD_COLOR)
if source is None:
    raise SystemExit(f"Could not read {source_path}")
h, w = source.shape[:2]
if (w, h) != (1536, 1024):
    raise SystemExit(f"Expected 1536x1024 uploaded reference, got {w}x{h}")

products = [
    ("regular-tee", 0, 0), ("regular-tee", 1, 0),
    ("oversized-tee", 2, 0), ("oversized-tee", 3, 0),
    ("polo-tee", 4, 0), ("polo-tee", 5, 0),
    ("full-sleeve-tee", 0, 1), ("full-sleeve-tee", 1, 1),
    ("pullover-hoodie", 2, 1), ("pullover-hoodie", 3, 1),
    ("zip-up-hoodie", 4, 1), ("zip-up-hoodie", 5, 1),
]

for product_id, col, row in products:
    x0 = col * 256 + 8
    x1 = (col + 1) * 256 - 8
    y0, y1 = ((8, 286) if row == 0 else (390, 675))
    crop = source[y0:y1, x0:x1].copy()
    crop = cv2.resize(crop, (800, 900), interpolation=cv2.INTER_CUBIC)
    ch, cw = crop.shape[:2]

    # Use GrabCut on the exact uploaded crop and force a clean background border.
    gc = np.full((ch, cw), cv2.GC_PR_BGD, np.uint8)
    border = max(8, int(min(ch, cw) * 0.06))
    gc[:border, :] = cv2.GC_BGD
    gc[-border:, :] = cv2.GC_BGD
    gc[:, :border] = cv2.GC_BGD
    gc[:, -border:] = cv2.GC_BGD
    rect = (border, border, cw - 2 * border, ch - 2 * border)
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(crop, gc, rect, bgd, fgd, 8, cv2.GC_INIT_WITH_RECT)
    fg = np.where((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    count, labels, stats, _ = cv2.connectedComponentsWithStats(fg, 8)
    if count > 1:
        largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        fg = np.where(labels == largest, 255, 0).astype(np.uint8)
    alpha = cv2.GaussianBlur(fg, (0, 0), 1.2)
    rgba = cv2.cvtColor(crop, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = alpha

    index = "front" if col % 2 == 0 else "back"
    visible_path = out_dir / f"{product_id}-{index}.png"
    mask_path = out_dir / f"{product_id}-{index}-mask.png"
    cv2.imwrite(str(visible_path), rgba)
    mask_rgba = np.zeros_like(rgba)
    mask_rgba[:, :, 3] = alpha
    cv2.imwrite(str(mask_path), mask_rgba)
    print(f"wrote {visible_path.name} and {mask_path.name}; alpha={int((alpha > 0).sum())}/{cw*ch}")
