import { describe, it, expect } from "vitest";
import { searchAll } from "@/lib/search";

describe("searchAll", () => {
  it("returns project matches for a query", () => {
    const res = searchAll("germia");
    expect(res.some((r) => r.label === "Germia Concert Hall")).toBe(true);
  });
  it("matches static pages", () => {
    const res = searchAll("about");
    expect(res.some((r) => r.href === "/about")).toBe(true);
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
});
