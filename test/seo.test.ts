import { describe, it, expect } from "vitest";
import { clampDescription, fullTitle, pageMetadata } from "@/lib/seo";
import { toUrlSlug } from "@/lib/slug";
import { POSTS } from "@/data/posts";

describe("toUrlSlug", () => {
  it("turns hand-typed CMS slugs into URL-safe ones", () => {
    expect(toUrlSlug("habitus-mastudio-partners ")).toBe("habitus-mastudio-partners");
    expect(toUrlSlug("the-story-of-architect-klodiana-taçi")).toBe("the-story-of-architect-klodiana-taci");
    expect(toUrlSlug("Trailblazing Magazine Interview")).toBe("trailblazing-magazine-interview");
    expect(toUrlSlug("  --Rruga Ëlbasanit--  ")).toBe("rruga-elbasanit");
  });

  it("leaves every published post with a URL-safe slug", () => {
    for (const p of POSTS) expect(p.slug, p.title).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });
});

describe("clampDescription", () => {
  it("keeps short text as is", () => {
    expect(clampDescription("Architecture studio in Tirana.")).toBe("Architecture studio in Tirana.");
  });

  it("cuts long text at a word boundary within the SERP budget", () => {
    const long = "word ".repeat(60);
    const out = clampDescription(long);
    expect(out.length).toBeLessThanOrEqual(158);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\s…$/);
  });
});

describe("fullTitle", () => {
  it("appends the studio name only when it fits in ~60 characters", () => {
    expect(fullTitle("About")).toBe("About | MA STUDIO & PARTNERS");
    const long = "INSTITUTE OF ART & CULTURE DRITERO AGOLLI — Institute in Ebolowa";
    expect(fullTitle(long)).toBe(long);
  });
});

describe("pageMetadata", () => {
  it("always sets its own canonical, an absolute title and a share image", () => {
    const m = pageMetadata({ title: "Contact", description: "x", path: "/contact" });
    expect(m.alternates?.canonical).toBe("/contact");
    expect(m.title).toEqual({ absolute: "Contact | MA STUDIO & PARTNERS" });
    const og = m.openGraph as { images?: unknown[]; url?: string };
    expect(og.images?.length).toBeGreaterThan(0);
    expect(og.url).toMatch(/\/contact$/);
  });
});
