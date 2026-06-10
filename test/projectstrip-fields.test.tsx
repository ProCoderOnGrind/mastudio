import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectStrip from "@/components/viewer/ProjectStrip";
import type { Project } from "@/data/projects";

const richDescription = {
  type: "root",
  children: [{ type: "p", children: [{ type: "text", text: "A civic landmark." }] }],
};

const project: Project = {
  slug: "x", name: "X", type: "Culture", year: 2026, location: "Tirana, Albania",
  category: "culture", images: ["/mastudio/x/img-0.jpg"],
  client: "City of Tirana", status: "Completed", size: "12,000 m²",
  description: richDescription,
};

describe("ProjectStrip — rich project fields", () => {
  it("renders client, status, and size when present", () => {
    render(<ProjectStrip project={project} />);
    expect(screen.getByText("City of Tirana")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("12,000 m²")).toBeInTheDocument();
  });
  it("renders the description body", () => {
    render(<ProjectStrip project={project} />);
    expect(screen.getByText("A civic landmark.")).toBeInTheDocument();
  });
  it("omits client/status/size labels when absent", () => {
    const bare: Project = { ...project, client: undefined, status: undefined, size: undefined, description: undefined };
    render(<ProjectStrip project={bare} />);
    expect(screen.queryByText("Client")).not.toBeInTheDocument();
    expect(screen.queryByText("Status")).not.toBeInTheDocument();
    expect(screen.queryByText("Size")).not.toBeInTheDocument();
  });
});
