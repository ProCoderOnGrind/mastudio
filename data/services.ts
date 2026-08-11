import { SERVICES } from "@/data/offices";

export interface ServiceMeaning {
  name: string;
  // One plain-language line for clients who don't know the term.
  meaning: string;
  // Anchor id on /services, also used for deep links from the footer.
  slug: string;
}

/** "Energy Efficiency" -> "energy-efficiency". */
export function serviceSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Client-friendly explanations, keyed to the canonical SERVICES list in contact.json.
// If a service has no explanation yet it simply falls back to its name.
const MEANINGS: Record<string, string> = {
  "Urban Planning":
    "Planning how whole areas and cities grow — where homes, roads, parks and public spaces go, so a place works for the people who live there.",
  "Urban Design":
    "Designing the spaces between buildings — squares, streets and waterfronts — so they feel safe, beautiful and easy to move through.",
  Architecture:
    "Designing the buildings themselves, from the first idea all the way to the detailed drawings used to build them.",
  "Landscape Design":
    "Designing the outdoor spaces — gardens, parks, greenery and terrain — around and between buildings.",
  "Interior Design":
    "Designing the inside of a space: the layout, materials, lighting and furniture, so it works and feels right.",
  Engineering:
    "The technical backbone that makes sure a building stands safely and is built to last.",
  "Energy Efficiency":
    "Designing buildings that need less energy to heat, cool and run — lower bills and a smaller footprint.",
  "Energy Auditing":
    "Inspecting an existing building to find exactly where it wastes energy and how to fix it.",
};

export const SERVICE_MEANINGS: ServiceMeaning[] = SERVICES.map((name) => ({
  name,
  meaning: MEANINGS[name] ?? name,
  slug: serviceSlug(name),
}));
