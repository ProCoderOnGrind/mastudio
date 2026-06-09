import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProjectStrip from "@/components/viewer/ProjectStrip";
import { PROJECTS, nextProject } from "@/data/projects";

const project = PROJECTS[0];
const next = nextProject(project.slug);

describe("ProjectStrip — Next project control", () => {
  it("links to the next project on the standalone page (no onNext)", () => {
    render(<ProjectStrip project={project} />);
    const link = screen.getByRole("link", { name: `Next project: ${next.name}` });
    expect(link.getAttribute("href")).toBe(`/projects/${next.slug}`);
  });

  it("calls onNext (no navigation) when used in the viewer", () => {
    const onNext = vi.fn();
    render(<ProjectStrip project={project} onNext={onNext} />);
    const btn = screen.getByRole("button", { name: `Next project: ${next.name}` });
    fireEvent.click(btn);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
