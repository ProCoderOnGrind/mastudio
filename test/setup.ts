import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom has no IntersectionObserver — components using useScrollReveal (Reveal) need it.
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
// @ts-expect-error assigning a test double
globalThis.IntersectionObserver = IO;

// jsdom has no matchMedia — IntroOverlay reads prefers-reduced-motion.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}
