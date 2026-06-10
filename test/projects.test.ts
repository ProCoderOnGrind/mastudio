import { describe, it, expect } from "vitest";
import { PROJECTS, getProject, projectsByCategory, nextProject } from "@/data/projects";

describe("projects data", () => {
  it("has the full MA Studio portfolio", () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(30);
  });
  it("every project has required fields and at least one image", () => {
    for (const p of PROJECTS) {
      expect(p.slug).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.location).toBeTruthy();
      expect(p.type).toBeTruthy();
      expect(p.year).toBeGreaterThan(1990);
      expect(["residential", "hospitality", "culture", "masterplan", "commercial"]).toContain(p.category);
      expect(p.images.length).toBeGreaterThan(0);
      expect(p.images[0]).toMatch(/^\/mastudio\//);
    }
  });
  it("slugs are unique", () => {
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(PROJECTS.length);
  });
  it("getProject finds a real project", () => {
    expect(getProject("germia-concert-hall")?.name).toBe("Germia Concert Hall");
    expect(getProject("nope")).toBeUndefined();
  });
  it("projectsByCategory filters", () => {
    expect(projectsByCategory("residential").every((p) => p.category === "residential")).toBe(true);
  });
  it("nextProject wraps around", () => {
    const last = PROJECTS[PROJECTS.length - 1];
    expect(nextProject(last.slug).slug).toBe(PROJECTS[0].slug);
  });
  it("optional rich fields are absent or correctly typed", () => {
    for (const p of PROJECTS) {
      if (p.client !== undefined) expect(typeof p.client).toBe("string");
      if (p.status !== undefined) expect(typeof p.status).toBe("string");
      if (p.size !== undefined) expect(typeof p.size).toBe("string");
    }
  });
});
