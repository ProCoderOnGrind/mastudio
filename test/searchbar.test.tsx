import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// SearchBar now calls useRouter(); mock it before importing the component.
const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import SearchBar from "@/components/header/SearchBar";
import { recentProjects } from "@/lib/search";

const field = () => screen.getByLabelText("Search projects");

describe("SearchBar", () => {
  beforeEach(() => push.mockClear());

  it("offers the most recent projects when the field is focused", () => {
    render(<SearchBar />);
    expect(screen.queryByText("Recent projects")).toBeNull();
    fireEvent.focus(field());
    expect(screen.getByText("Recent projects")).toBeInTheDocument();
    const rows = screen.getAllByRole("option");
    expect(rows.map((r) => r.getAttribute("href"))).toEqual(
      recentProjects().map((r) => r.href),
    );
  });

  it("offers only projects — no categories, no pages", () => {
    render(<SearchBar />);
    fireEvent.focus(field());
    for (const href of screen.getAllByRole("option").map((r) => r.getAttribute("href"))) {
      expect(href).toMatch(/^\/projects\//);
    }
    expect(screen.queryByText("Residential")).toBeNull();
    expect(screen.queryByText("Masterplan")).toBeNull();
    expect(screen.queryByText("CoFounders")).toBeNull();
  });

  it("shows live results as you type", () => {
    render(<SearchBar />);
    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: "germia" } });
    expect(screen.getByText(/Concert Hall/)).toBeInTheDocument();
  });

  it("narrows to matches on a partial word", () => {
    render(<SearchBar />);
    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: "germ" } });
    expect(screen.getByText(/Concert Hall/)).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.queryByText("Recent projects")).toBeNull();
  });

  it("navigates once on pointerdown; the trailing click does not double-navigate", () => {
    render(<SearchBar />);
    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: "germia" } });
    const row = screen.getAllByRole("option")[0];
    const href = row.getAttribute("href")!;
    fireEvent.pointerDown(row, { button: 0 });
    expect(push).toHaveBeenCalledWith(href);
    // the synthetic click that follows a pointer tap must not navigate again
    fireEvent.click(row, { detail: 1 });
    expect(push).toHaveBeenCalledTimes(1);
  });

  it("tells the visitor when nothing matched", () => {
    render(<SearchBar />);
    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: "zzzqqq" } });
    expect(screen.getByText(/No project matches/)).toBeInTheDocument();
  });

  it("opens the highlighted result on Enter", () => {
    render(<SearchBar />);
    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: "germia" } });
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0][0]).toMatch(/^\/projects\//);
  });

  it("moves the highlight with the arrow keys", () => {
    render(<SearchBar />);
    fireEvent.focus(field());
    expect(screen.getAllByRole("option")[0].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    expect(screen.getAllByRole("option")[0].getAttribute("aria-selected")).toBe("false");
    expect(screen.getAllByRole("option")[1].getAttribute("aria-selected")).toBe("true");
  });

  it("clears the query on the first Escape", () => {
    render(<SearchBar />);
    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: "germia" } });
    fireEvent.keyDown(field(), { key: "Escape" });
    expect((field() as HTMLInputElement).value).toBe("");
  });
});
