import { describe, it, expect } from "vitest";
import { isCategoryKey, categoryLabel, CATEGORIES } from "@/data/categories";

describe("category helpers", () => {
  it("isCategoryKey accepts valid keys", () => {
    expect(isCategoryKey("residential")).toBe(true);
    expect(isCategoryKey("masterplan")).toBe(true);
  });
  it("isCategoryKey rejects unknown values", () => {
    expect(isCategoryKey("nope")).toBe(false);
    expect(isCategoryKey("")).toBe(false);
  });
  it("categoryLabel returns the human label", () => {
    expect(categoryLabel("residential")).toBe("Residential");
    expect(categoryLabel("masterplan")).toBe("Masterplan");
  });
  it("CATEGORIES has the five expected entries", () => {
    expect(CATEGORIES.map((c) => c.key)).toEqual([
      "residential",
      "hospitality",
      "culture",
      "masterplan",
      "commercial",
    ]);
  });
});
