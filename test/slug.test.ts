import { describe, it, expect } from "vitest";
import { slugToTitle } from "@/lib/slug";

describe("slugToTitle", () => {
  it("title-cases a slug and preserves known acronyms", () => {
    expect(slugToTitle("eve-music-hall")).toBe("EVE Music Hall");
    expect(slugToTitle("copenhill")).toBe("CopenHill");
    expect(slugToTitle("big-hq")).toBe("BIG HQ");
    expect(slugToTitle("noma-2-0")).toBe("Noma 2.0");
    expect(slugToTitle("via-57-west")).toBe("VIA 57 West");
  });
});
