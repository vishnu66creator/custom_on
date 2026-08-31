from pathlib import Path
from PIL import Image
import numpy as np

root = Path(__file__).resolve().parents[1] / "src" / "assets"
for path in sorted(root.iterdir()):
    if path.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
        continue
    img = Image.open(path).convert("RGB")
    a = np.asarray(img)
    h, w = a.shape[:2]
    corners = np.array([a[0,0], a[0,-1], a[-1,0], a[-1,-1]])
    print(path.name, img.size, "corner_mean", corners.mean(axis=0).round(1).tolist(), "center", a[h//2,w//2].tolist())
