import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import IntroOverlay, { RING_SRC, MARK_SRC } from "@/components/intro/IntroOverlay";
import { markIntroPlayed } from "@/lib/intro";

// The overlay is portaled to document.body, so query the document, not the render container.
describe("IntroOverlay", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("renders nothing once the intro has already played this session", () => {
    markIntroPlayed();
    render(<IntroOverlay />);
    expect(document.querySelector('[data-intro="overlay"]')).toBeNull();
  });

  it("renders the overlay on a fresh session", () => {
    render(<IntroOverlay />);
    expect(document.querySelector('[data-intro="overlay"]')).not.toBeNull();
  });

  it("renders the seal artwork as separate ring and mark layers", () => {
    render(<IntroOverlay />);
    const srcs = Array.from(document.querySelectorAll('[data-intro="overlay"] img')).map(
      (img) => img.getAttribute("src"),
    );
    expect(srcs).toContain(RING_SRC);
    expect(srcs).toContain(MARK_SRC);
  });
});
