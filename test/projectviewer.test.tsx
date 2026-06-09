import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewerProvider, useViewer } from "@/components/viewer/ViewerContext";
import ProjectViewer from "@/components/viewer/ProjectViewer";
import { PROJECTS } from "@/data/projects";

function OpenButton() {
  const { open } = useViewer();
  return <button onClick={() => open(PROJECTS[0])}>open</button>;
}

describe("ProjectViewer — open animation", () => {
  beforeEach(() => {
    // Freeze rAF so the stage holds its appear-from state for assertion.
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0);
  });
  afterEach(() => vi.restoreAllMocks());

  it("mounts the stage at the mirrored appear-from scale (0.96)", () => {
    render(
      <ViewerProvider>
        <OpenButton />
        <ProjectViewer />
      </ViewerProvider>
    );
    fireEvent.click(screen.getByText("open"));
    const stage = screen.getByTestId("viewer-stage");
    expect(stage.style.transform).toBe("scale(0.96)");
  });
});
