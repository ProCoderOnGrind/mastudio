import { describe, it, expect } from "vitest";
import { searchAll } from "@/lib/search";

describe("searchAll", () => {
  it("returns project + page matches for a query", () => {
    const res = searchAll("copen");
    expect(res.some((r) => r.label === "CopenHill")).toBe(true);
  });
  it("matches static pages", () => {
    const res = searchAll("about");
    expect(res.some((r) => r.href === "/about")).toBe(true);
  });
  it("returns empty for gibberish", () => {
    expect(searchAll("zzzqqq").length).toBe(0);
  });
  it("is case-insensitive", () => {
    expect(searchAll("SPIRAL").some((r) => r.label === "The Spiral")).toBe(true);
  });
});
