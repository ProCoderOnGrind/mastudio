import { describe, it, expect } from "vitest";
import { PROJECTS, type Project } from "@/data/projects";
import {
  hasWrittenDescription,
  projectImageAlt,
  projectKeywords,
  projectMetaDescription,
} from "@/lib/projectSeo";

/**
 * These assertions guard the two failure modes that put the old SEO back:
 * a project added without copy (silently falling back to the template), and
 * an `imageAlts` array drifting out of step with `images` after a photo is
 * inserted or removed in the CMS.
 */
describe("project search metadata", () => {
  it("every project carries a hand-written description, not the fallback", () => {
    const missing = PROJECTS.filter((p) => !hasWrittenDescription(p)).map((p) => p.slug);
    expect(missing).toEqual([]);
  });

  it("descriptions fit the snippet Google renders", () => {
    for (const p of PROJECTS) {
      const d = projectMetaDescription(p);
      // Below ~70 chars there is nothing to show; past ~165 Google truncates.
      expect(d.length, `${p.slug}: ${d.length} chars`).toBeGreaterThan(70);
      expect(d.length, `${p.slug}: ${d.length} chars`).toBeLessThanOrEqual(165);
    }
  });

  it("descriptions are unique — duplicates are read as boilerplate", () => {
    const seen = new Map<string, string>();
    for (const p of PROJECTS) {
      const d = projectMetaDescription(p);
      expect(seen.get(d), `${p.slug} duplicates ${seen.get(d)}`).toBeUndefined();
      seen.set(d, p.slug);
    }
  });

  it("has one alt text per photo, in step with the images array", () => {
    for (const p of PROJECTS) {
      expect(p.imageAlts?.length, `${p.slug}`).toBe(p.images.length);
    }
  });

  it("alt text is descriptive rather than a numbered placeholder", () => {
    for (const p of PROJECTS) {
      p.images.forEach((_, i) => {
        const alt = projectImageAlt(p, i);
        expect(alt.length, `${p.slug}[${i}]`).toBeGreaterThan(30);
        expect(alt.length, `${p.slug}[${i}]`).toBeLessThanOrEqual(125);
        // The old value was literally "<name> — 3".
        expect(alt, `${p.slug}[${i}]`).not.toMatch(/—\s*\d+$/);
      });
    }
  });

  it("alt text is unique within a project", () => {
    for (const p of PROJECTS) {
      const alts = p.images.map((_, i) => projectImageAlt(p, i));
      expect(new Set(alts).size, `${p.slug}`).toBe(alts.length);
    }
  });

  it("falls back rather than throwing when a project has no copy", () => {
    const bare: Project = {
      slug: "x",
      name: "New Project",
      type: "Residence",
      year: 2026,
      location: "Tirana, Albania",
      category: "residential",
      images: ["/mastudio/x/img-0.jpg", "/mastudio/x/img-1.jpg"],
    };
    expect(projectMetaDescription(bare)).toContain("New Project");
    expect(projectImageAlt(bare, 1)).toContain("view 2 of 2");
    // A partially filled array must not shift the remaining photos.
    const partial: Project = { ...bare, imageAlts: ["A red brick house in Tirana"] };
    expect(projectImageAlt(partial, 0)).toBe("A red brick house in Tirana");
    expect(projectImageAlt(partial, 1)).toContain("view 2 of 2");
  });

  it("every referenced photo exists on disk", async () => {
    const { existsSync } = await import("node:fs");
    const missing: string[] = [];
    for (const p of PROJECTS) {
      for (const src of p.images) {
        // Tina writes percent-encoded paths for filenames containing
        // punctuation; the browser resolves them, so decode before the
        // filesystem check or every such photo reads as missing.
        if (!existsSync("public" + decodeURIComponent(src))) missing.push(`${p.slug} -> ${src}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("keywords name the project and its city", () => {
    const p = PROJECTS.find((x) => x.slug === "voxel-residence")!;
    const k = projectKeywords(p);
    expect(k).toContain("VOXEL RESIDENCE");
    expect(k).toContain("architecture studio Tirana");
    expect(k.some((t) => t.includes("Tirana"))).toBe(true);
  });
});
