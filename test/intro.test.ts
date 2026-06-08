import { describe, it, expect, beforeEach } from "vitest";
import { hasPlayedIntro, markIntroPlayed } from "@/lib/intro";

describe("intro session gating", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("is false before the intro has played", () => {
    expect(hasPlayedIntro()).toBe(false);
  });
  it("is true after marking it played", () => {
    markIntroPlayed();
    expect(hasPlayedIntro()).toBe(true);
  });
});
