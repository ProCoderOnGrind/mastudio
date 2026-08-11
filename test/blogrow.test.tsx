import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BlogRow from "@/components/blog/BlogRow";
import type { Post } from "@/data/posts";

const withSource: Post = {
  slug: "skanderbeg-tower-waf-award",
  title: "Skanderbeg Mixed-Use Tower Wins WAF Future Project Award",
  date: "2026-05-28",
  category: "awards",
  excerpt: "Recognised for its stacked public terraces and low-carbon structure.",
  source: { label: "World Architecture Festival", url: "https://www.worldarchitecturefestival.com" },
};

const withoutSource: Post = {
  slug: "landscape-energy-practice",
  title: "Studio Expands with New Landscape & Energy Practice",
  date: "2026-04-30",
  category: "news",
  excerpt: "Two new in-house teams join under one roof.",
};

const withVideo: Post = {
  slug: "venice-biennale-lecture",
  title: "“From the City to Mankind” — Ervin Taçi at the Venice Biennale",
  date: "2026-05-14",
  category: "lectures",
  excerpt: "A lecture on designing across scales.",
  video: "https://youtu.be/aqz-KE-bpKQ?t=30",
};

describe("BlogRow video entries", () => {
  it("turns the image into a link to the canonical YouTube watch URL", () => {
    render(<BlogRow post={withVideo} />);
    const link = screen.getByRole("link", { name: /Watch on YouTube/ });
    expect(link.getAttribute("href")).toBe("https://www.youtube.com/watch?v=aqz-KE-bpKQ");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("names the link after the post so the target is clear out of context", () => {
    render(<BlogRow post={withVideo} />);
    expect(
      screen.getByRole("link", { name: `Watch on YouTube: ${withVideo.title}` }),
    ).toBeInTheDocument();
  });

  it("renders the play badge as decorative, leaving the link its own name", () => {
    const { container } = render(<BlogRow post={withVideo} />);
    const badge = container.querySelector('[aria-hidden="true"] svg');
    expect(badge).not.toBeNull();
  });

  it("leaves the image unlinked when the post has no video", () => {
    const { container } = render(<BlogRow post={withoutSource} />);
    expect(screen.queryByRole("link", { name: /YouTube/ })).toBeNull();
    expect(container.querySelector('[aria-hidden="true"] svg')).toBeNull();
  });

  it("ignores a video link that is not a YouTube video rather than linking out blindly", () => {
    render(<BlogRow post={{ ...withVideo, video: "https://vimeo.com/123456" }} />);
    expect(screen.queryByRole("link", { name: /YouTube/ })).toBeNull();
  });
});

describe("BlogRow", () => {
  it("renders the title, formatted date · category, and excerpt", () => {
    render(<BlogRow post={withSource} />);
    expect(screen.getByText(withSource.title)).toBeInTheDocument();
    expect(screen.getByText("28.05.2026 · Awards")).toBeInTheDocument();
    expect(screen.getByText(withSource.excerpt)).toBeInTheDocument();
  });

  it("renders an external source link when present", () => {
    render(<BlogRow post={withSource} />);
    const link = screen.getByRole("link", { name: /World Architecture Festival/ });
    expect(link.getAttribute("href")).toBe(withSource.source!.url);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("omits the source link when the post has no source", () => {
    render(<BlogRow post={withoutSource} />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
