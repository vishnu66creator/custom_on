from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / 'public' / 'assets' / 'size_catalog'
PRODUCTS = ('regular-tee', 'oversized-tee', 'polo-tee', 'full-sleeve-tee', 'pullover-hoodie', 'zip-up-hoodie')
SIZES = ('s', 'm', 'l')
SIDES = ('front', 'back')


def largest_component(mask: np.ndarray) -> np.ndarray:
    count, labels, stats, _ = cv2.connectedComponentsWithStats((mask > 0).astype(np.uint8), 8)
    if count <= 1:
        return (mask > 0).astype(np.uint8) * 255
    label = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return np.where(labels == label, 255, 0).astype(np.uint8)


def rough_foreground(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    band = max(4, int(min(h, w) * 0.05))
    border = np.concatenate([
        gray[:band, :].ravel(), gray[-band:, :].ravel(),
        gray[:, :band].ravel(), gray[:, -band:].ravel(),
    ])
    background = float(np.median(border))
    seed = (gray > background + 7).astype(np.uint8) * 255
    seed = cv2.morphologyEx(seed, cv2.MORPH_CLOSE, np.ones((17, 17), np.uint8))
    seed = cv2.morphologyEx(seed, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    return largest_component(seed)


def garment_mask(image: np.ndarray) -> np.ndarray:
    h, w = image.shape[:2]
    rough = rough_foreground(image)
    trimap = np.full((h, w), cv2.GC_PR_BGD, dtype=np.uint8)
    trimap[rough > 0] = cv2.GC_PR_FGD

    # Keep the image frame and detached floor/background definite background.
    border_x = max(20, int(w * 0.06))
    border_top = max(20, int(h * 0.06))
    border_bottom = max(20, int(h * 0.04))
    trimap[:border_top, :] = cv2.GC_BGD
    trimap[-border_bottom:, :] = cv2.GC_BGD
    trimap[:, :border_x] = cv2.GC_BGD
    trimap[:, -border_x:] = cv2.GC_BGD

    # A central cloth core makes GrabCut bridge pale, shadowed folds and side
    # seams instead of converting those areas into holes.
    core_y0, core_y1 = int(h * 0.30), int(h * 0.76)
    core_x0, core_x1 = int(w * 0.28), int(w * 0.72)
    trimap[core_y0:core_y1, core_x0:core_x1] = cv2.GC_FGD

    # Let the neutral opening above the body remain background. This preserves
    # crew-neck, polo, and hoodie openings while the central core remains cloth.
    opening = trimap[int(h * 0.07):int(h * 0.28), int(w * 0.40):int(w * 0.60)]
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    opening_gray = gray[int(h * 0.07):int(h * 0.28), int(w * 0.40):int(w * 0.60)]
    opening_background = opening_gray < np.percentile(opening_gray, 45) + 3
    opening[opening_background & (opening != cv2.GC_FGD)] = cv2.GC_PR_BGD
    trimap[int(h * 0.07):int(h * 0.28), int(w * 0.40):int(w * 0.60)] = opening

    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(image, trimap, None, bgd_model, fgd_model, 8, cv2.GC_INIT_WITH_MASK)
    foreground = np.where(
        (trimap == cv2.GC_FGD) | (trimap == cv2.GC_PR_FGD), 255, 0
    ).astype(np.uint8)
    foreground = largest_component(foreground)
    foreground = cv2.morphologyEx(foreground, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    return cv2.GaussianBlur(foreground, (0, 0), 1.2)


expected = [
    CATALOG / product / f'{size}-{side}.png'
    for product in PRODUCTS
    for size in SIZES
    for side in SIDES
]
missing = [path for path in expected if not path.exists()]
if missing:
    raise SystemExit('Missing garment images:\n' + '\n'.join(str(path) for path in missing))

for image_path in expected:
    product = image_path.parent.name
    size, side = image_path.stem.rsplit('-', 1)
    image = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
    if image is None:
        raise SystemExit(f'Unable to read {image_path}')
    alpha = garment_mask(image)
    mask = np.zeros((image.shape[0], image.shape[1], 4), dtype=np.uint8)
    mask[:, :, 3] = alpha
    output = image_path.with_name(f'{size}-{side}-mask.png')
    if not cv2.imwrite(str(output), mask):
        raise SystemExit(f'Unable to write {output}')
    ys, xs = np.where(alpha > 32)
    print(f'{product}/{size}-{side}: coverage={(alpha > 32).mean():.4f} bbox={(xs.min(), ys.min(), xs.max(), ys.max())}')
