import { describe, it, expect } from "vitest";
import { ABOUT_SECTIONS } from "@/data/about";

describe("about sections data", () => {
  it("lists sections in order", () => {
    expect(ABOUT_SECTIONS.map((s) => s.title)).toEqual([
      "Profile & Philosophy",
      "Company Profile",
      "International Collaborations",
      "Achievements",
      "Awards",
      "International Conferences",
      "How we work",
      "Office Structure",
    ]);
  });
  it("keeps collaborator and project names as list items", () => {
    const collab = ABOUT_SECTIONS.find((s) => s.title === "International Collaborations");
    expect(collab?.items).toContain("MVRDV");
    const profile = ABOUT_SECTIONS.find((s) => s.title === "Company Profile");
    expect(profile?.items?.some((i) => i.includes("Tirana Olympic Park"))).toBe(true);
  });
  it("How we work has its subsections", () => {
    const exp = ABOUT_SECTIONS.find((s) => s.title === "How we work");
    expect(exp?.subsections?.map((s) => s.title)).toEqual([
      "Workplace Consultancy",
      "Project Management",
    ]);
  });
});
