import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import BlogRow from "@/components/blog/BlogRow";
import { ArticleProvider } from "@/components/blog/ArticleContext";
import ArticleModal from "@/components/blog/ArticleModal";
import type { Post } from "@/data/posts";

const unwritten: Post = {
  slug: "landscape-energy-practice",
  title: "Studio Expands with New Landscape & Energy Practice",
  date: "2026-04-30",
  category: "news",
  excerpt: "Two new in-house teams join under one roof.",
};

const written: Post = {
  slug: "open-studio-exhibition",
  title: "Open Studio",
  date: "2026-05-01",
  category: "events",
  excerpt: "An evening in the studio.",
  article: [{ kind: "text", text: "The doors were open until ten." }],
};

function listing(post: Post) {
  return render(
    <ArticleProvider>
      <BlogRow post={post} />
      <ArticleModal />
    </ArticleProvider>,
  );
}

describe("opening an article from the listing", () => {
  it("opens the popup for a post that has been written up", () => {
    listing(written);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("link", { name: written.title }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("The doors were open until ten.")).toBeInTheDocument();
  });

  it("opens the popup for a post with nothing written yet", () => {
    listing(unwritten);
    // No page exists for it, so the control is a button rather than a dead link.
    const opener = screen.getByRole("button", { name: unwritten.title });
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    // Scoped to the dialog: the listing row carries the same heading text.
    expect(within(dialog).getByRole("heading", { name: unwritten.title })).toBeInTheDocument();
    // Nothing written yet, so no article body renders — just the framing.
    expect(within(dialog).queryByRole("figure")).toBeNull();
  });

  it("gives a written-up post a real href so ctrl-click and crawlers still work", () => {
    listing(written);
    expect(screen.getByRole("link", { name: written.title })).toHaveAttribute(
      "href",
      "/blog/open-studio-exhibition",
    );
  });

  it("closes on Escape", () => {
    listing(written);
    fireEvent.click(screen.getByRole("link", { name: written.title }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes from the Close button", () => {
    listing(written);
    fireEvent.click(screen.getByRole("link", { name: written.title }));
    fireEvent.click(screen.getByRole("button", { name: /Close/ }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("still links normally when no provider is mounted", () => {
    render(<BlogRow post={written} />);
    expect(screen.getByRole("link", { name: written.title })).toHaveAttribute(
      "href",
      "/blog/open-studio-exhibition",
    );
  });
});

describe("scroll lock", () => {
  it("does not pad the page by an implausible scrollbar width", () => {
    render(
      <ArticleProvider>
        <BlogRow post={written} />
        <ArticleModal />
      </ArticleProvider>,
    );
    fireEvent.click(screen.getByRole("link", { name: written.title }));
    expect(document.body.style.overflow).toBe("hidden");
    const pad = parseInt(document.body.style.paddingRight || "0", 10);
    expect(pad).toBeLessThanOrEqual(40);
  });
});
