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
  // Capture the queued rAF callback so we can assert the appear-from state
  // (before it runs) and the settled target state (after we run it) deterministically.
  let rafCb: FrameRequestCallback | null = null;
  beforeEach(() => {
    rafCb = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCb = cb;
      return 1;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it("opens as the close reversed: scale 0.96 -> 1 with a matching fade-in", () => {
    render(
      <ViewerProvider>
        <OpenButton />
        <ProjectViewer />
      </ViewerProvider>
    );
    fireEvent.click(screen.getByText("open"));
    const stage = screen.getByTestId("viewer-stage");

    // appear-from state (the mirror of the close's end-state)
    expect(stage.style.transform).toBe("scale(0.96)");
    expect(stage.style.opacity).toBe("0");

    // run the queued animation frame…
    expect(typeof rafCb).toBe("function");
    rafCb?.(0);

    // …and the stage settles at the visible target state
    expect(stage.style.transform).toBe("scale(1)");
    expect(stage.style.opacity).toBe("1");
  });
});
