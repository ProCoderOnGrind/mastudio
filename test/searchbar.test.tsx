import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "@/components/header/SearchBar";

describe("SearchBar", () => {
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

  it("links a category chip to its filtered homepage", () => {
    render(<SearchBar />);
    fireEvent.focus(screen.getByLabelText("Search projects and categories"));
    const chip = screen.getByRole("link", { name: "Residential" });
    expect(chip.getAttribute("href")).toBe("/?category=residential");
  });
});
