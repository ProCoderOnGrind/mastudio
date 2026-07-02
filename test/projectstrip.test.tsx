import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProjectStrip from "@/components/viewer/ProjectStrip";
import { PROJECTS, nextProject } from "@/data/projects";

const project = PROJECTS[0];
const next = nextProject(project.slug);

describe("ProjectStrip — Next project control", () => {
  // The strip renders a mobile and a desktop instance (CSS hides one), so the
  // Next control exists twice in the DOM — assert on all copies.
  it("links to the next project on the standalone page (no onNext)", () => {
    render(<ProjectStrip project={project} />);
    const links = screen.getAllByRole("link", { name: `Next project: ${next.name}` });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.getAttribute("href")).toBe(`/projects/${next.slug}`);
    }
  });

  it("calls onNext (no navigation) when used in the viewer", () => {
    const onNext = vi.fn();
    render(<ProjectStrip project={project} onNext={onNext} />);
    const [btn] = screen.getAllByRole("button", { name: `Next project: ${next.name}` });
    fireEvent.click(btn);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
