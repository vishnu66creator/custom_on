from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Image.open(root / "src/assets/references/pullover-hoodie-front-back-reference.png").convert("RGBA")
# The reference places front and back garments side-by-side on transparency.
for label, box in {
    "front": (18, 68, 180, 334),
    "back": (180, 68, 342, 334),
}.items():
    crop = source.crop(box)
    alpha = crop.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        crop = crop.crop(bbox)
    scale = min(680 / crop.width, 860 / crop.height)
    crop = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (800, 1000), (0, 0, 0, 0))
    x = (canvas.width - crop.width) // 2
    y = (canvas.height - crop.height) // 2
    canvas.alpha_composite(crop, (x, y))
    output = root / "src/assets" / f"pullover-hoodie-{label}-cutout.png"
    canvas.save(output, optimize=True)
    print(f"wrote {output.name} {canvas.size} content={crop.size}")
