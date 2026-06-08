import { describe, it, expect } from "vitest";
import { ABOUT_SECTIONS } from "@/data/about";

describe("about sections data", () => {
  it("lists sections 2–10 in order", () => {
    expect(ABOUT_SECTIONS.map((s) => s.title)).toEqual([
      "Profile & Philosophy",
      "Company Profile",
      "International Collaborations",
      "Achievements",
      "Awards",
      "International Conferences",
      "Company Expertise",
      "Sustainability",
      "Office Structure",
    ]);
  });
  it("keeps collaborator and project names as list items", () => {
    const collab = ABOUT_SECTIONS.find((s) => s.title === "International Collaborations");
    expect(collab?.items).toContain("MVRDV");
    const profile = ABOUT_SECTIONS.find((s) => s.title === "Company Profile");
    expect(profile?.items?.some((i) => i.includes("Tirana Olympic Park"))).toBe(true);
  });
  it("Company Expertise has the six disciplines", () => {
    const exp = ABOUT_SECTIONS.find((s) => s.title === "Company Expertise");
    expect(exp?.subsections?.map((s) => s.title)).toEqual([
      "Workplace Consultancy",
      "Project Management",
      "Urban Design",
      "Architecture",
      "Engineering",
      "Interior Design",
    ]);
  });
});
