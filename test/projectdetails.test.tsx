import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectDetails from "@/components/viewer/ProjectDetails";
import type { Project } from "@/data/projects";

const base: Project = {
  slug: "test-project",
  name: "Test Project",
  type: "Residence",
  year: 2024,
  location: "Tirana, Albania",
  category: "residential",
  images: ["/a.jpg"],
};

describe("ProjectDetails", () => {
  it("sets 'Label: value' lines as term and detail", () => {
    render(
      <ProjectDetails
        project={{ ...base, description: "Program: Housing;\n\nConstruction Area: 900 m²;" }}
      />,
    );
    expect(screen.getByText("Program")).toBeInTheDocument();
    expect(screen.getByText("Housing")).toBeInTheDocument();
    expect(screen.getByText("Construction Area")).toBeInTheDocument();
    expect(screen.getByText("900 m²")).toBeInTheDocument();
  });

  it("carries the project's name and meta line", () => {
    render(<ProjectDetails project={{ ...base, description: "Program: Housing;" }} />);
    expect(screen.getByRole("heading", { name: "Test Project" })).toBeInTheDocument();
    expect(screen.getByText(/Tirana, Albania · Residence · 2024/)).toBeInTheDocument();
  });

  it("renders nothing at all when the project has no description", () => {
    const { container } = render(<ProjectDetails project={base} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the description is an empty string", () => {
    const { container } = render(<ProjectDetails project={{ ...base, description: "" }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
