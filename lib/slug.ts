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

/**
 * Make a CMS-typed slug safe for a URL: "Trailblazing Magazine Interview" →
 * "trailblazing-magazine-interview", "klodiana-taçi" → "klodiana-taci",
 * "habitus-mastudio-partners " → "habitus-mastudio-partners".
 *
 * Editors type slugs by hand in Tina; spaces, capitals, accents and stray
 * trailing spaces all produced routes that 404'd while the sitemap still
 * listed them — dead links handed straight to Google.
 */
export function toUrlSlug(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents (ç → c, ë → e)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
