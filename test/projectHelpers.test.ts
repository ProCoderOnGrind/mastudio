import { describe, it, expect } from "vitest";
import { findProject, filterByCategory, getNextProject } from "@/lib/projectHelpers";
import type { Project } from "@/data/projects";

const P = (slug: string, category: Project["category"]): Project => ({
  slug, name: slug.toUpperCase(), type: "Residence", year: 2024,
  location: "Tirana, Albania", category, images: ["/mastudio/x/img-0.jpg"],
});

const list: Project[] = [P("a", "residential"), P("b", "culture"), P("c", "residential")];

describe("projectHelpers", () => {
  it("findProject returns the match or undefined", () => {
    expect(findProject(list, "b")?.slug).toBe("b");
    expect(findProject(list, "zzz")).toBeUndefined();
  });
  it("filterByCategory keeps only matching", () => {
    expect(filterByCategory(list, "residential").map((p) => p.slug)).toEqual(["a", "c"]);
  });
  it("getNextProject wraps around", () => {
    expect(getNextProject(list, "c")?.slug).toBe("a");
    expect(getNextProject(list, "a")?.slug).toBe("b");
  });
});
