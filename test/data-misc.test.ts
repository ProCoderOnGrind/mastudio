import { describe, it, expect } from "vitest";
import { NEWS } from "@/data/news";
import { PEOPLE, PARTNERS } from "@/data/people";
import { OFFICES } from "@/data/offices";

describe("misc data", () => {
  it("news has items with date/title/category", () => {
    expect(NEWS.length).toBeGreaterThanOrEqual(12);
    for (const n of NEWS) {
      expect(n.date).toMatch(/\d{2}\.\d{2}\.\d{4}/);
      expect(n.title).toBeTruthy();
      expect(["news", "events", "awards", "lectures"]).toContain(n.category);
    }
  });
  it("people include partners with roles", () => {
    expect(PARTNERS.length).toBeGreaterThan(5);
    expect(PEOPLE.every((p) => p.name && p.role)).toBe(true);
  });
  it("offices have a city", () => {
    expect(OFFICES.map((o) => o.city)).toContain("Copenhagen");
  });
});
