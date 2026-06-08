import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CoFoundersPage from "@/app/cofounders/page";

describe("CoFounders page", () => {
  it("renders a card for each co-founder", () => {
    render(<CoFoundersPage />);
    expect(screen.getByText("Co-Founders")).toBeInTheDocument();
    expect(screen.getByText("Ervin Taçi")).toBeInTheDocument();
    expect(screen.getByText("Klodiana Emiri Taçi")).toBeInTheDocument();
  });
});
