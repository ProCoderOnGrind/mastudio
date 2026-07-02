import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutSections from "@/components/about/AboutSections";

describe("AboutSections", () => {
  it("renders each top-level section title", () => {
    render(<AboutSections />);
    expect(screen.getByText("Profile & Philosophy")).toBeInTheDocument();
    expect(screen.getByText("How we work")).toBeInTheDocument();
    expect(screen.getByText("Office Structure")).toBeInTheDocument();
  });
  it("keeps list names in the DOM (SEO-safe accordions)", () => {
    render(<AboutSections />);
    expect(screen.getByText("MVRDV")).toBeInTheDocument();
  });
});
