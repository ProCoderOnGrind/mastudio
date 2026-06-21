import { describe, it, expect } from "vitest";
import {
  POSTS,
  POST_CATEGORIES,
  postsByCategory,
  isPostCategory,
  postCategoryLabel,
  formatPostDate,
} from "@/data/posts";

const CATEGORY_KEYS = ["news", "events", "awards", "lectures"];

describe("posts data", () => {
  it("loads the sample editorial posts", () => {
    expect(POSTS.length).toBeGreaterThanOrEqual(6);
  });

  it("every post has required fields and a valid category", () => {
    for (const p of POSTS) {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.excerpt).toBeTruthy();
      expect(CATEGORY_KEYS).toContain(p.category);
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (p.source !== undefined) {
        expect(p.source.label).toBeTruthy();
        expect(p.source.url).toMatch(/^https?:\/\//);
      }
    }
  });

  it("slugs are unique", () => {
    expect(new Set(POSTS.map((p) => p.slug)).size).toBe(POSTS.length);
  });

  it("is sorted newest-first by date", () => {
    const dates = POSTS.map((p) => p.date);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
  });
});

describe("post category helpers", () => {
  it("exposes the four editorial sections", () => {
    expect(POST_CATEGORIES.map((c) => c.key)).toEqual(CATEGORY_KEYS);
  });

  it("isPostCategory accepts valid keys and rejects others", () => {
    expect(isPostCategory("awards")).toBe(true);
    expect(isPostCategory("nope")).toBe(false);
  });

  it("postCategoryLabel maps keys to display labels", () => {
    expect(postCategoryLabel("awards")).toBe("Awards");
    expect(postCategoryLabel("unknown")).toBe("unknown");
  });

  it("postsByCategory filters by key and falls back to all for unknown", () => {
    expect(postsByCategory("awards").every((p) => p.category === "awards")).toBe(true);
    expect(postsByCategory("nope").length).toBe(POSTS.length);
  });
});

describe("formatPostDate", () => {
  it("renders ISO dates as DD.MM.YYYY", () => {
    expect(formatPostDate("2026-06-11")).toBe("11.06.2026");
  });

  it("returns the input unchanged when it is not an ISO date", () => {
    expect(formatPostDate("not-a-date")).toBe("not-a-date");
  });
});
