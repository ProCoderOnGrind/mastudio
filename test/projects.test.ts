import { describe, it, expect } from "vitest";
import { PROJECTS, getProject } from "@/data/projects";

describe("projects data", () => {
  it("has exactly 34 projects", () => {
    expect(PROJECTS).toHaveLength(34);
  });
  it("every project has required fields", () => {
    for (const p of PROJECTS) {
      expect(p.slug).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.location).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.year).toBeGreaterThan(1990);
      expect(["Completed", "In Progress", "Competition"]).toContain(p.status);
      expect(p.ratio).toMatch(/\d+ \/ \d+/);
    }
  });
  it("slugs are unique", () => {
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(34);
  });
  it("getProject finds by slug", () => {
    expect(getProject("copenhill")?.name).toBe("CopenHill");
    expect(getProject("nope")).toBeUndefined();
  });
});
