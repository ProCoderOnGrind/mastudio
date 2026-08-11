import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ArticleContent from "@/components/blog/ArticleContent";
import {
  toArticleBlocks,
  articleBlocks,
  articleText,
  hasArticle,
  hasPostPage,
  type Post,
} from "@/data/posts";

const base: Post = {
  slug: "open-studio",
  title: "Open Studio",
  date: "2026-05-01",
  category: "events",
  excerpt: "An evening in the studio.",
};

describe("toArticleBlocks", () => {
  it("reads text and image blocks in the order they were written", () => {
    expect(
      toArticleBlocks([
        { _template: "text", text: "First paragraph." },
        { _template: "image", src: "/a.jpg", caption: "The courtyard" },
        { _template: "text", text: "Second paragraph." },
      ]),
    ).toEqual([
      { kind: "text", text: "First paragraph." },
      { kind: "image", src: "/a.jpg", caption: "The courtyard" },
      { kind: "text", text: "Second paragraph." },
    ]);
  });

  it("drops half-filled blocks rather than rendering them broken", () => {
    expect(
      toArticleBlocks([
        { _template: "text", text: "   " },
        { _template: "image", caption: "no file was picked" },
        null,
        { _template: "image", src: "/b.jpg" },
      ]),
    ).toEqual([{ kind: "image", src: "/b.jpg" }]);
  });

  it("treats a block with no template but with text as text", () => {
    expect(toArticleBlocks([{ text: "Recovered." }])).toEqual([
      { kind: "text", text: "Recovered." },
    ]);
  });

  it("reads the editor's GraphQL shape, which tags blocks __typename not _template", () => {
    expect(
      toArticleBlocks([
        { __typename: "PostsPostsArticleText", text: "Written in the editor." },
        { __typename: "PostsPostsArticleImage", src: "/a.jpg", caption: "Picked in the editor" },
      ]),
    ).toEqual([
      { kind: "text", text: "Written in the editor." },
      { kind: "image", src: "/a.jpg", caption: "Picked in the editor" },
    ]);
  });

  it("is undefined when there is nothing usable", () => {
    expect(toArticleBlocks([])).toBeUndefined();
    expect(toArticleBlocks(null)).toBeUndefined();
    expect(toArticleBlocks([{ _template: "text", text: "" }])).toBeUndefined();
  });
});

describe("articleBlocks", () => {
  it("prefers the block article", () => {
    const post: Post = {
      ...base,
      article: [{ kind: "text", text: "New." }],
      body: ["Old."],
    };
    expect(articleBlocks(post)).toEqual([{ kind: "text", text: "New." }]);
  });

  it("falls back to the old paragraphs format so existing posts keep working", () => {
    expect(articleBlocks({ ...base, body: ["One.", "Two."] })).toEqual([
      { kind: "text", text: "One." },
      { kind: "text", text: "Two." },
    ]);
  });

  it("is empty when nothing is written", () => {
    expect(articleBlocks(base)).toEqual([]);
    expect(hasArticle(base)).toBe(false);
  });
});

describe("articleText", () => {
  it("joins only the prose, skipping images", () => {
    const post: Post = {
      ...base,
      article: [
        { kind: "text", text: "One." },
        { kind: "image", src: "/a.jpg" },
        { kind: "text", text: "Two." },
      ],
    };
    expect(articleText(post)).toBe("One.\n\nTwo.");
  });
});

describe("hasPostPage", () => {
  it("is true once there is an article, in either format", () => {
    expect(hasPostPage({ ...base, article: [{ kind: "text", text: "x" }] })).toBe(true);
    expect(hasPostPage({ ...base, body: ["x"] })).toBe(true);
  });
  it("is true for a video with nothing written", () => {
    expect(hasPostPage({ ...base, video: "https://youtu.be/aaaaaaaaaaa" })).toBe(true);
  });
  it("stays false for an excerpt-only post", () => {
    expect(hasPostPage(base)).toBe(false);
  });
});

describe("ArticleContent", () => {
  it("renders paragraphs and captioned images in order", () => {
    render(
      <ArticleContent
        post={{
          ...base,
          article: [
            { kind: "text", text: "First paragraph." },
            { kind: "image", src: "/a.jpg", caption: "The courtyard" },
          ],
        }}
      />,
    );
    expect(screen.getByText("First paragraph.")).toBeInTheDocument();
    expect(screen.getByText("The courtyard")).toBeInTheDocument();
  });

  it("closes on a YouTube link when the post has a video", () => {
    render(
      <ArticleContent
        post={{ ...base, article: [{ kind: "text", text: "x" }], video: "https://youtu.be/dQw4w9WgXcQ" }}
      />,
    );
    const link = screen.getByRole("link", { name: /Watch on YouTube: Open Studio/ });
    expect(link).toHaveAttribute("href", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("has no video block when no video is set", () => {
    render(<ArticleContent post={{ ...base, article: [{ kind: "text", text: "x" }] }} />);
    expect(screen.queryByRole("link", { name: /Watch on YouTube/ })).toBeNull();
  });
});
