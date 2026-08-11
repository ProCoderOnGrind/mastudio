import { describe, it, expect } from "vitest";
import { searchAll, highlightSegments, recentProjects, RECENT_COUNT } from "@/lib/search";
import { PROJECTS } from "@/data/projects";

describe("searchAll", () => {
  it("returns project matches for a query", () => {
    const res = searchAll("germia");
    expect(res.some((r) => r.label === "Germia Concert Hall")).toBe(true);
  });
  it("only ever returns projects", () => {
    for (const q of ["about", "residential", "tirana", "germia"]) {
      expect(searchAll(q).every((r) => r.href.startsWith("/projects/"))).toBe(true);
    }
  });
  it("returns empty for gibberish", () => {
    expect(searchAll("zzzqqq").length).toBe(0);
  });
  it("is case-insensitive", () => {
    expect(searchAll("BANTU").some((r) => r.label.toLowerCase().includes("bantu"))).toBe(true);
  });
  it("matches by location", () => {
    expect(searchAll("tirana").length).toBeGreaterThan(0);
  });

  it("matches on a partial word, the way a search field is expected to", () => {
    const full = searchAll("germia");
    const partial = searchAll("germ");
    expect(partial.some((r) => r.label === "Germia Concert Hall")).toBe(true);
    expect(partial.length).toBeGreaterThanOrEqual(full.length);
  });

  it("tolerates a typo", () => {
    expect(searchAll("germai").some((r) => r.label === "Germia Concert Hall")).toBe(true);
  });

  it("ranks the closest name first", () => {
    expect(searchAll("germia")[0].label).toBe("Germia Concert Hall");
  });

  it("AND-s multiple words instead of widening the list", () => {
    const one = searchAll("concert");
    const two = searchAll("concert hall");
    expect(two.length).toBeGreaterThan(0);
    expect(two.length).toBeLessThanOrEqual(one.length);
    expect(two.every((r) => /concert/i.test(r.label) || /hall/i.test(r.label))).toBe(true);
  });

  it("drops results when one of the typed words matches nothing", () => {
    expect(searchAll("germia zzzqqq").length).toBe(0);
  });

  it("finds a project by its year", () => {
    expect(searchAll("2021").length).toBeGreaterThan(0);
  });
});

describe("recentProjects", () => {
  it("returns the newest projects, newest first", () => {
    const recent = recentProjects();
    const years = recent.map((r) => PROJECTS.find((p) => r.href.endsWith(p.slug))!.year);
    expect(years).toEqual([...years].sort((a, b) => b - a));
    expect(years[0]).toBe(Math.max(...PROJECTS.map((p) => p.year)));
  });

  it("caps the list", () => {
    expect(recentProjects().length).toBe(Math.min(RECENT_COUNT, PROJECTS.length));
    expect(recentProjects(3).length).toBe(3);
  });

  it("is what an empty query returns", () => {
    expect(searchAll("  ")).toEqual(recentProjects());
  });
});

describe("highlightSegments", () => {
  it("marks the typed substring", () => {
    const segs = highlightSegments("Germia Concert Hall", "concert");
    expect(segs.filter((s) => s.match).map((s) => s.text)).toEqual(["Concert"]);
    expect(segs.map((s) => s.text).join("")).toBe("Germia Concert Hall");
  });

  it("marks every typed word", () => {
    const segs = highlightSegments("Germia Concert Hall", "germia hall");
    expect(segs.filter((s) => s.match).map((s) => s.text)).toEqual(["Germia", "Hall"]);
  });

  it("leaves the label untouched when nothing matches literally", () => {
    expect(highlightSegments("Germia Concert Hall", "germai")).toEqual([
      { text: "Germia Concert Hall", match: false },
    ]);
  });

  it("leaves the label untouched for an empty query", () => {
    expect(highlightSegments("Germia Concert Hall", "  ")).toEqual([
      { text: "Germia Concert Hall", match: false },
    ]);
  });
});
