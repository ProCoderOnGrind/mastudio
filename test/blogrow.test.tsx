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
