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
#   public/mastudio/logo-seal-ring.png  outer ring  (rotating layer, intro)
#   public/mastudio/logo-seal-text.png  ring minus the circle stroke (map;
#                                       the map draws its own perfect circle
#                                       as a CSS border so the line can sit
#                                       exactly on the disc edge)
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

# Text-only variant: erase the circle stroke, keep the arc text. The stroke
# is a thin (4-5px at 800px) radial run; letter glyphs are much thicker. Rays
# are classified per 0.1 degree by the alpha thickness found near the rim,
# and the text zone is dilated a little so glyph edges are never nicked.
import math

import numpy as np

arr = np.array(ring)
ys, xs = np.nonzero(arr[:, :, 3] > 15)
rr = np.hypot(xs - HALF, ys - HALF)
rim_mask = rr > 0.86 * HALF
rim_ys, rim_xs = ys[rim_mask], xs[rim_mask]
rim_ang = ((np.degrees(np.arctan2(rim_ys - HALF, rim_xs - HALF)) % 360) * 10).astype(int)
thick = np.bincount(rim_ang, minlength=3600)  # rim pixels per 0.1 deg ray
# stroke rays carry ~15 px each at this scale, letter rays 60+
is_text = thick > 35
is_text = np.convolve(
    np.concatenate([is_text[-20:], is_text, is_text[:20]]).astype(int),
    np.ones(41), mode="same",
)[20:-20] > 0  # dilate +-2 deg
stroke = ~is_text[rim_ang]
text_arr = arr.copy()
text_arr[rim_ys[stroke], rim_xs[stroke], 3] = 0
text = Image.fromarray(text_arr)

out = root / "public" / "mastudio"
for img, name in [(canvas, "logo-seal.png"), (ring, "logo-seal-ring.png"), (mark, "logo-seal-mark.png"), (text, "logo-seal-text.png")]:
    img.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS).save(out / name, "PNG", optimize=True)
    print(name, "written")

canvas.resize((ICON_SIZE, ICON_SIZE), Image.LANCZOS).save(root / "app" / "icon.png", "PNG", optimize=True)
print("app/icon.png written")
