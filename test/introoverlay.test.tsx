import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import IntroOverlay from "@/components/intro/IntroOverlay";
import { markIntroPlayed } from "@/lib/intro";

// jsdom has no WebGL, so the scene setup would throw on its own. That is the
// path production takes when WebGL is blocked too, so stubbing three here keeps
// the tests about the gating rather than about the renderer.
vi.mock("three", () => {
  throw new Error("no WebGL in jsdom");
});

// The overlay is portaled to document.body, so query the document, not the render container.
describe("IntroOverlay", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("renders nothing once the intro has already played this session", () => {
    markIntroPlayed();
    render(<IntroOverlay />);
    expect(document.querySelector('[data-intro="stage"]')).toBeNull();
  });

  it("renders the stage on a fresh session", () => {
    render(<IntroOverlay />);
    expect(document.querySelector('[data-intro="stage"]')).not.toBeNull();
  });

  it("shows the studio seal over the stage", () => {
    render(<IntroOverlay />);
    const srcs = Array.from(document.querySelectorAll('[data-intro="stage"] img')).map((img) =>
      img.getAttribute("src"),
    );
    expect(srcs).toContain("/mastudio/logo-seal.png");
  });

  it("offers a way past it", () => {
    render(<IntroOverlay />);
    const labels = Array.from(document.querySelectorAll('[data-intro="stage"] button')).map(
      (b) => b.textContent,
    );
    expect(labels).toContain("Skip");
  });
});
