from pathlib import Path

root = Path(__file__).resolve().parents[1]
products = ["regular-tee", "oversized-tee", "polo-tee", "full-sleeve-tee", "pullover-hoodie", "zip-up-hoodie"]
sizes = ["S", "M", "L"]
lines = [
    "export type SizeMedia = {",
    "  frontImage: string;",
    "  backImage: string;",
    "  frontMaskImage: string;",
    "  backMaskImage: string;",
    "};",
    "",
    "export const SIZE_MEDIA: Record<string, Record<string, SizeMedia>> = {",
]
for product in products:
    lines.append(f'  "{product}": {{')
    for size in sizes:
        base = f"/assets/size_catalog/{product}/{size.lower()}"
        lines.extend([
            f'    "{size}": {{',
            f'      frontImage: "{base}-front.png",',
            f'      backImage: "{base}-back.png",',
            f'      frontMaskImage: "{base}-front-mask.png",',
            f'      backMaskImage: "{base}-back-mask.png",',
            "    },",
        ])
    lines.append("  },")
lines.append("};")
(root / "src" / "lib" / "size-media.ts").write_text("\n".join(lines) + "\n")
