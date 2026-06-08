import { describe, it, expect } from "vitest";
import { gradientFor, blurDataURL, hashString } from "@/lib/placeholder";

describe("placeholder", () => {
  it("hashes deterministically", () => {
    expect(hashString("copenhill")).toBe(hashString("copenhill"));
    expect(hashString("a")).not.toBe(hashString("b"));
  });
  it("returns a grayscale linear-gradient", () => {
    const g = gradientFor("copenhill");
    expect(g).toMatch(/^linear-gradient\(/);
  });
  it("returns a base64 svg data URL for blur", () => {
    expect(blurDataURL("copenhill")).toMatch(/^data:image\/svg\+xml;base64,/);
  });
});
