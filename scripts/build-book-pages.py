# Renders the MA Studio book PDF into the WebP page images served by /book.
# Re-run whenever the studio publishes a new edition of the book.
#
#   python scripts/build-book-pages.py [path-to-book.pdf]
#
# Requires: pymupdf, Pillow. Downloads the PDF from the live site when no
# local path is given. Outputs public/book/pages, public/book/thumbs and
# data/book.json (the manifest the reader component consumes).
import io
import json
import sys
import urllib.request
from pathlib import Path

import fitz  # pymupdf
from PIL import Image

PDF_URL = "https://mastudio.al/wp-content/uploads/2026/03/MA-Studio-book-2026-web-.pdf"
PAGE_WIDTH = 1000   # px — one page fills ~half a 1440px viewport in the spread
THUMB_WIDTH = 168   # px — index grid
PAGE_QUALITY = 72
THUMB_QUALITY = 60

root = Path(__file__).resolve().parent.parent
pages_dir = root / "public" / "book" / "pages"
thumbs_dir = root / "public" / "book" / "thumbs"
pages_dir.mkdir(parents=True, exist_ok=True)
thumbs_dir.mkdir(parents=True, exist_ok=True)

if len(sys.argv) > 1:
    doc = fitz.open(sys.argv[1])
else:
    print(f"downloading {PDF_URL} ...")
    data = urllib.request.urlopen(PDF_URL).read()
    doc = fitz.open(stream=data, filetype="pdf")

aspect = doc[0].rect.width / doc[0].rect.height

for i, page in enumerate(doc, start=1):
    zoom = PAGE_WIDTH / page.rect.width
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    img.save(pages_dir / f"{i:03d}.webp", "WEBP", quality=PAGE_QUALITY)
    thumb = img.resize(
        (THUMB_WIDTH, round(THUMB_WIDTH / aspect)), Image.LANCZOS
    )
    thumb.save(thumbs_dir / f"{i:03d}.webp", "WEBP", quality=THUMB_QUALITY)
    if i % 20 == 0 or i == doc.page_count:
        print(f"{i}/{doc.page_count}")

manifest = {
    "pageCount": doc.page_count,
    "aspect": round(aspect, 4),
    "pdfUrl": PDF_URL,
}
(root / "data" / "book.json").write_text(json.dumps(manifest, indent=2) + "\n")
print("manifest:", manifest)
