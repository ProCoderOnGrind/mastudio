const KEY = "ma-intro-played";

export function hasPlayedIntro(): boolean {
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroPlayed(): void {
  try {
    window.sessionStorage.setItem(KEY, "1");
  } catch {
    /* sessionStorage unavailable (private mode / SSR) — ignore */
  }
}
