from pathlib import Path
import cv2
import numpy as np

root = Path(__file__).resolve().parents[1] / "src" / "assets"
source_path = root / "product-hoodie.jpg"
output_path = root / "product-hoodie-cutout.png"
image = cv2.imread(str(source_path), cv2.IMREAD_COLOR)
h, w = image.shape[:2]
mask = np.zeros((h, w), np.uint8)
# Contour follows the original 800x1000 hoodie photo.
outer = np.array([
    [290, 80], [410, 80], [500, 120], [555, 185], [610, 255],
    [690, 365], [650, 500], [635, 650], [615, 760], [585, 835],
    [520, 855], [280, 855], [215, 835], [185, 760], [165, 650],
    [150, 500], [110, 365], [190, 255], [245, 185],
], np.int32)
cv2.fillPoly(mask, [outer], 255)
# Remove the hood opening/interior; this is background/lining rather than the body.
opening = np.array([
    [300, 135], [350, 112], [430, 112], [490, 145], [525, 205],
    [500, 270], [450, 305], [350, 305], [300, 270], [275, 205],
], np.int32)
cv2.fillPoly(mask, [opening], 0)
mask = cv2.GaussianBlur(mask, (0, 0), 1.5)
rgba = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
rgba[:, :, 3] = mask
cv2.imwrite(str(output_path), rgba)
print(f"wrote {output_path} alpha={int((mask > 0).sum())}/{w*h}")
