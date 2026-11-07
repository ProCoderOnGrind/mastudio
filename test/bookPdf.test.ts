import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import manifest from "@/data/book.json";

// The book's "Download PDF" button once pointed at the old WordPress upload,
// which disappeared when mastudio.al moved to this site, so the button
// silently led nowhere. Keep the PDF on this site and keep the link to it.
describe("book PDF download", () => {
  it("links to a PDF served by this site, not an external host", () => {
    expect(manifest.pdfUrl).toMatch(/^\/book\/[^/]+\.pdf$/);
  });

  it("the linked file exists and is a PDF", () => {
    const file = path.resolve(__dirname, "..", "public", manifest.pdfUrl.slice(1));
    expect(existsSync(file), file).toBe(true);
    expect(readFileSync(file).subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });
});
