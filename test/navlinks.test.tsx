import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// NavLinks now calls usePathname(); mock it before importing the component.
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import NavLinks from "@/components/header/NavLinks";

describe("NavLinks", () => {
  it("renders the primary links with correct hrefs", () => {
    render(<NavLinks />);
    const expected: [string, string][] = [
      ["Projects", "/"],
      ["Blog", "/blog"],
      ["About", "/about"],
      ["Contact", "/contact"],
      ["CoFounders", "/cofounders"],
    ];
    for (const [label, href] of expected) {
      // desktop + mobile copies both exist; at least one must point to href
      const links = screen.getAllByRole("link", { name: label });
      expect(links.some((a) => a.getAttribute("href") === href)).toBe(true);
    }
  });
});
