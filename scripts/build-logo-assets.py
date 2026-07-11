# Builds the site's logo assets from the master seal artwork
# ("MA Studio_ Logo finale e permiresuar.png" in the repo root).
#
#   python scripts/build-logo-assets.py
#
# The seal is split at the radial gap (r 0.72-0.78 of the canvas half-width)
# between the centre MA mark and the outer ring (arc text + circle), so the
# intro and map can rotate the ring while the mark stays upright:
#   public/mastudio/logo-seal.png       full seal   (header, general use)
#   public/mastudio/logo-seal-ring.png  outer ring  (rotating layer)
#   public/mastudio/logo-seal-mark.png  centre mark (static layer)
#   app/icon.png                        favicon
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SPLIT_R = 0.75   # fraction of half-width where ring and mark separate
FEATHER = 3      # px of mask blur so the cut edge stays soft
OUT_SIZE = 800
ICON_SIZE = 512

root = Path(__file__).resolve().parent.parent
src = Image.open(root / "MA Studio_ Logo finale e permiresuar.png").convert("RGBA")

# Square canvas, artwork centered (source is 1774x1782).
side = max(src.size)
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(src, ((side - src.width) // 2, (side - src.height) // 2))

# Feathered disc mask at the split radius.
disc = Image.new("L", (side, side), 0)
r = side / 2 * SPLIT_R
c = side / 2
ImageDraw.Draw(disc).ellipse([c - r, c - r, c + r, c + r], fill=255)
disc = disc.filter(ImageFilter.GaussianBlur(FEATHER))

alpha = canvas.split()[3]
from PIL import ImageChops

mark = canvas.copy()
mark.putalpha(ImageChops.multiply(alpha, disc))
ring = canvas.copy()
ring.putalpha(ImageChops.multiply(alpha, ImageChops.invert(disc)))

out = root / "public" / "mastudio"
for img, name in [(canvas, "logo-seal.png"), (ring, "logo-seal-ring.png"), (mark, "logo-seal-mark.png")]:
    img.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS).save(out / name, "PNG", optimize=True)
    print(name, "written")

canvas.resize((ICON_SIZE, ICON_SIZE), Image.LANCZOS).save(root / "app" / "icon.png", "PNG", optimize=True)
print("app/icon.png written")
