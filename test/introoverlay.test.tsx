import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import IntroOverlay from "@/components/intro/IntroOverlay";
import { markIntroPlayed } from "@/lib/intro";

describe("IntroOverlay", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("renders nothing once the intro has already played this session", () => {
    markIntroPlayed();
    const { container } = render(<IntroOverlay />);
    expect(container.querySelector('[data-intro="overlay"]')).toBeNull();
  });

  it("renders the overlay on a fresh session", () => {
    const { container } = render(<IntroOverlay />);
    expect(container.querySelector('[data-intro="overlay"]')).not.toBeNull();
  });
});
