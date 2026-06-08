const OVERRIDES: Record<string, string> = {
  "eve-music-hall": "EVE Music Hall",
  copenhill: "CopenHill",
  "big-hq": "BIG HQ",
  "noma-2-0": "Noma 2.0",
  "via-57-west": "VIA 57 West",
  "not-a-hotel-setouchi": "NOT A HOTEL Setouchi",
  "one-high-line": "One High Line",
  "the-plus": "The Plus",
  "the-spiral": "The Spiral",
  "the-drop": "The Drop",
  "the-impact": "The Impact",
  "lego-brand-house": "LEGO Brand House",
};

const SMALL = new Set(["of", "and", "the", "at", "in", "to", "for", "a", "an"]);

export function slugToTitle(slug: string): string {
  if (OVERRIDES[slug]) return OVERRIDES[slug];
  return slug
    .split("-")
    .map((w, i) => {
      if (/^\d+$/.test(w)) return w;
      if (i > 0 && SMALL.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}
