import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CoFoundersPage from "@/app/cofounders/page";

describe("CoFounders page", () => {
  it("renders a card for every founder", () => {
    render(<CoFoundersPage />);
    expect(screen.getByText("Co-Founders")).toBeInTheDocument();
    expect(screen.getAllByText(/Founding Partner/).length).toBe(2);
  });
});
