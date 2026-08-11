import { describe, it, expect } from "vitest";
import {
  POSTS,
  POST_CATEGORIES,
  postsByCategory,
  isPostCategory,
  postCategoryLabel,
  formatPostDate,
  hasPostPage,
  postsWithPages,
  getPost,
  type Post,
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

describe("post detail pages", () => {
  const base: Post = {
    slug: "x",
    title: "X",
    date: "2026-01-01",
    category: "news",
    excerpt: "An excerpt.",
  };

  it("withholds a page from excerpt-only posts, so no thin pages ship", () => {
    expect(hasPostPage(base)).toBe(false);
    expect(hasPostPage({ ...base, body: [] })).toBe(false);
  });

  it("grants a page once a post has body paragraphs or a video", () => {
    expect(hasPostPage({ ...base, body: ["A paragraph."] })).toBe(true);
    expect(hasPostPage({ ...base, video: "https://youtu.be/aqz-KE-bpKQ" })).toBe(true);
  });

  it("postsWithPages returns exactly the posts that qualify", () => {
    const listed = postsWithPages();
    expect(listed.every(hasPostPage)).toBe(true);
    expect(listed.length).toBe(POSTS.filter(hasPostPage).length);
  });

  it("getPost finds by slug and returns undefined for an unknown one", () => {
    expect(getPost(POSTS[0].slug)?.slug).toBe(POSTS[0].slug);
    expect(getPost("no-such-post")).toBeUndefined();
  });

  it("drops blank body lines so stray empty paragraphs never render", () => {
    const withBody = POSTS.filter((p) => p.body);
    for (const p of withBody) {
      expect(p.body!.every((line) => line.trim().length > 0)).toBe(true);
    }
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
