# Builds the downloadable book PDF (public/book/MA-Studio-book-2026.pdf) from the
# page images the online reader serves (public/book/pages/*.webp).
#
#   python scripts/build-book-pdf.py
#
# Why this exists: the "Download PDF" button pointed at the old WordPress copy
# (mastudio.al/wp-content/...), which stopped existing when mastudio.al moved to
# this site. The original PDF isn't in the repo, so this rebuilds one from the
# reader's pages and serves it from the site itself, where it can't go missing.
# If the original PDF turns up, prefer it: copy it to the same path instead
# (scripts/build-book-pages.py does that when given the PDF).
#
# Each page is encoded to JPEG exactly once and embedded as-is (DCTDecode), so
# nothing is compressed twice. Requires: Pillow.
import io
from pathlib import Path

from PIL import Image

JPEG_QUALITY = 80   # the pages are WebP q72 already; 80 adds no visible loss
DPI = 127           # 1000x1400 px pages -> ~200x280 mm, the book's own format
TITLE = "MA Studio & Partners — Book 2026"

root = Path(__file__).resolve().parent.parent
pages = sorted((root / "public" / "book" / "pages").glob("*.webp"))
out = root / "public" / "book" / "MA-Studio-book-2026.pdf"
if not pages:
    raise SystemExit("no page images in public/book/pages")


def pdf_string(s: str) -> bytes:
    """A PDF text string; UTF-16BE with BOM so non-ASCII (—, &) survives."""
    return b"<FEFF" + s.encode("utf-16-be").hex().upper().encode() + b">"


objects: list[bytes] = []  # objects[i] is object number i + 1


def add(body: bytes) -> int:
    objects.append(body)
    return len(objects)


catalog = add(b"")          # filled in once the page tree exists
page_tree = add(b"")
page_refs = []

for path in pages:
    im = Image.open(path).convert("RGB")
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=JPEG_QUALITY, subsampling=2, optimize=True)
    jpeg = buf.getvalue()
    w, h = im.size
    pw, ph = w * 72 / DPI, h * 72 / DPI  # points

    img = add(
        b"<< /Type /XObject /Subtype /Image /Width %d /Height %d "
        b"/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode "
        b"/Length %d >>\nstream\n" % (w, h, len(jpeg)) + jpeg + b"\nendstream"
    )
    draw = b"q %.3f 0 0 %.3f 0 0 cm /Im0 Do Q" % (pw, ph)
    content = add(b"<< /Length %d >>\nstream\n" % len(draw) + draw + b"\nendstream")
    page_refs.append(add(
        b"<< /Type /Page /Parent %d 0 R /MediaBox [0 0 %.3f %.3f] "
        b"/Resources << /XObject << /Im0 %d 0 R >> >> /Contents %d 0 R >>"
        % (page_tree, pw, ph, img, content)
    ))

objects[page_tree - 1] = (
    b"<< /Type /Pages /Kids [" + b" ".join(b"%d 0 R" % r for r in page_refs)
    + b"] /Count %d >>" % len(page_refs)
)
objects[catalog - 1] = b"<< /Type /Catalog /Pages %d 0 R >>" % page_tree
info = add(
    b"<< /Title " + pdf_string(TITLE) + b" /Author " + pdf_string("MA Studio & Partners") + b" >>"
)

pdf = io.BytesIO()
pdf.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
offsets = []
for n, body in enumerate(objects, start=1):
    offsets.append(pdf.tell())
    pdf.write(b"%d 0 obj\n" % n + body + b"\nendobj\n")
xref = pdf.tell()
pdf.write(b"xref\n0 %d\n0000000000 65535 f \n" % (len(objects) + 1))
for off in offsets:
    pdf.write(b"%010d 00000 n \n" % off)
pdf.write(
    b"trailer\n<< /Size %d /Root %d 0 R /Info %d 0 R >>\nstartxref\n%d\n%%%%EOF\n"
    % (len(objects) + 1, catalog, info, xref)
)
out.write_bytes(pdf.getvalue())
print(f"{out.relative_to(root)}: {len(page_refs)} pages, {out.stat().st_size / 1e6:.1f} MB")
