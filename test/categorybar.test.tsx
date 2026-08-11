import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CategoryBar from "@/components/project/CategoryBar";
import { CATEGORIES } from "@/data/categories";

describe("CategoryBar", () => {
  it("renders a directly clickable chip per category, plus All", () => {
    render(<CategoryBar active={null} />);
    expect(screen.getByRole("link", { name: "All" }).getAttribute("href")).toBe("/");
    for (const c of CATEGORIES) {
      expect(screen.getByRole("link", { name: c.label }).getAttribute("href")).toBe(
        `/?category=${c.key}`,
      );
    }
  });

  it("marks All as current when no category is selected", () => {
    render(<CategoryBar active={null} />);
    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute("aria-current", "true");
  });

  it("marks the selected category as current instead", () => {
    render(<CategoryBar active="residential" />);
    expect(screen.getByRole("link", { name: "Residential" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "All" })).not.toHaveAttribute("aria-current");
  });
});
