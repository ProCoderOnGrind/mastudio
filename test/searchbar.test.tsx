import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// SearchBar now calls useRouter(); mock it before importing the component.
const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import SearchBar from "@/components/header/SearchBar";

describe("SearchBar", () => {
  beforeEach(() => push.mockClear());

  it("reveals category chips when the field is focused", () => {
    render(<SearchBar />);
    const input = screen.getByLabelText("Search projects and categories");
    expect(screen.queryByText("Residential")).toBeNull();
    fireEvent.focus(input);
    expect(screen.getByText("Residential")).toBeInTheDocument();
    expect(screen.getByText("Masterplan")).toBeInTheDocument();
  });

  it("shows live results as you type", () => {
    render(<SearchBar />);
    const input = screen.getByLabelText("Search projects and categories");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "germia" } });
    expect(screen.getByText("Germia Concert Hall")).toBeInTheDocument();
  });

  it("keeps the category chip href for keyboard/desktop", () => {
    render(<SearchBar />);
    fireEvent.focus(screen.getByLabelText("Search projects and categories"));
    const chip = screen.getByRole("link", { name: "Residential" });
    expect(chip.getAttribute("href")).toBe("/?category=residential");
  });

  it("navigates on pointerdown so taps land before the dropdown closes", () => {
    render(<SearchBar />);
    fireEvent.focus(screen.getByLabelText("Search projects and categories"));
    const chip = screen.getByRole("link", { name: "Residential" });
    fireEvent.pointerDown(chip, { button: 0 });
    expect(push).toHaveBeenCalledWith("/?category=residential");
  });
});
