from pathlib import Path
import cv2
import numpy as np

root = Path(__file__).resolve().parents[1] / "src" / "assets"
polygons = {
    "product-oversized.jpg": [
        (0.36, 0.15), (0.64, 0.15), (0.76, 0.22), (0.90, 0.38),
        (0.78, 0.50), (0.69, 0.45), (0.72, 0.88), (0.28, 0.88),
        (0.31, 0.45), (0.22, 0.50), (0.10, 0.38), (0.24, 0.22),
    ],
    "product-polo.jpg": [
        (0.38, 0.15), (0.62, 0.15), (0.75, 0.22), (0.88, 0.39),
        (0.77, 0.50), (0.68, 0.45), (0.70, 0.88), (0.30, 0.88),
        (0.32, 0.45), (0.23, 0.50), (0.12, 0.39), (0.25, 0.22),
    ],
    "product-hoodie.jpg": [
        (0.36, 0.13), (0.64, 0.13), (0.76, 0.21), (0.91, 0.39),
        (0.80, 0.51), (0.70, 0.45), (0.73, 0.88), (0.27, 0.88),
        (0.30, 0.45), (0.20, 0.51), (0.09, 0.39), (0.24, 0.21),
    ],
}

for source_name, points in polygons.items():
    source = root / source_name
    image = cv2.imread(str(source), cv2.IMREAD_COLOR)
    if image is None:
        raise RuntimeError(f"Missing source: {source}")
    h, w = image.shape[:2]
    coords = np.array([(round(x * w), round(y * h)) for x, y in points], np.int32)
    alpha = np.zeros((h, w), np.uint8)
    cv2.fillPoly(alpha, [coords], 255)
    alpha = cv2.GaussianBlur(alpha, (0, 0), 1.25)
    rgba = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = alpha
    output = root / source_name.rsplit('.', 1)[0]
    output = output.with_name(output.name + "-cutout.png")
    cv2.imwrite(str(output), rgba)
    print(f"wrote {output.name} {w}x{h}")
