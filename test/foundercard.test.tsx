import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FounderCard from "@/components/founder/FounderCard";
import type { Founder } from "@/data/founders";

const sample: Founder = {
  name: "Test Founder",
  role: "Co-Founder — Tester",
  bio: ["First paragraph about the founder.", "Second paragraph."],
};

describe("FounderCard", () => {
  it("shows the name, role, and bio text", () => {
    render(<FounderCard founder={sample} />);
    expect(screen.getByText("Test Founder")).toBeInTheDocument();
    expect(screen.getByText("Co-Founder — Tester")).toBeInTheDocument();
    expect(screen.getByText(/First paragraph/)).toBeInTheDocument();
  });
  it("toggles the reveal when the portrait is clicked", () => {
    render(<FounderCard founder={sample} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });
});
