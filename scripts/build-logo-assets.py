# Builds the site's logo assets from the master seal artwork
# ("MA Studio_ Logo finale e permiresuar.png" in the repo root).
#
#   python scripts/build-logo-assets.py
#
# The artwork's circle is NOT centered on its canvas (offset ~32,35px), so the
# canvas is first re-cropped around the circle's true centre (least-squares
# fit of the stroke: centre 919.0,925.9 / radius 834.4 in the source file).
# That keeps the ring, the intro mark and the contact map disc concentric.
#
# The seal is then split at the radial gap between the centre MA mark
# (content ends at r=585px) and the outer ring, arc text + circle
# (content starts at r=735px), so the intro and map rotate the ring while
# the mark stays upright:
#   public/mastudio/logo-seal.png       full seal   (header, general use)
#   public/mastudio/logo-seal-ring.png  outer ring  (rotating layer)
#   public/mastudio/logo-seal-mark.png  centre mark (static layer)
#   app/icon.png                        favicon
#
# Geometry note for MapSeal: measured on the generated ring asset, the circle
# stroke sits at 97.8% of the container (center within 0.7px of the canvas
# center), so a map disc at 98% of the container puts the circle line exactly
# on the map's edge.
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

CIRCLE_C = (919.0, 925.9)  # fitted circle centre in the source file
HALF = 880                 # crop half-side; all artwork lies within r=867.4
SPLIT_R = 660 / HALF       # midpoint of the 585..735px mark/ring gap
FEATHER = 3                # px of mask blur so the cut edge stays soft
OUT_SIZE = 800
ICON_SIZE = 512

root = Path(__file__).resolve().parent.parent
src = Image.open(root / "MA Studio_ Logo finale e permiresuar.png").convert("RGBA")

# Square canvas centred on the circle's true centre.
side = 2 * HALF
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(src, (round(HALF - CIRCLE_C[0]), round(HALF - CIRCLE_C[1])))

# Feathered disc mask at the split radius.
disc = Image.new("L", (side, side), 0)
r = HALF * SPLIT_R
ImageDraw.Draw(disc).ellipse([HALF - r, HALF - r, HALF + r, HALF + r], fill=255)
disc = disc.filter(ImageFilter.GaussianBlur(FEATHER))

alpha = canvas.split()[3]
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
