import { describe, it, expect } from "vitest";
import { FOUNDERS } from "@/data/founders";

describe("founders data", () => {
  it("has the two real co-founders in order", () => {
    expect(FOUNDERS.map((f) => f.name)).toEqual(["Ervin Taçi", "Klodiana Emiri Taçi"]);
  });
  it("each founder has a role and a non-empty multi-paragraph bio", () => {
    for (const f of FOUNDERS) {
      expect(f.role).toBeTruthy();
      expect(Array.isArray(f.bio)).toBe(true);
      expect(f.bio.length).toBeGreaterThanOrEqual(1);
      expect(f.bio.every((p) => p.length > 0)).toBe(true);
    }
  });
});
