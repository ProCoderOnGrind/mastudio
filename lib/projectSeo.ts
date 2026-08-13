/**
 * Per-project search metadata: the meta description and the image alt text.
 *
 * Both used to be generated from a single template — every project shipped the
 * same "<name> — <type> in <location>" sentence and every photo the same
 * "<name> — 3". Google treats descriptions that differ only by a few nouns as
 * boilerplate and substitutes its own snippet, and "<name> — 3" tells neither a
 * screen reader nor Google Images anything about the photo. So the real copy is
 * authored per project in `content/projects.json` (editable in Tina), and the
 * templates below survive only as a fallback for a project added without it.
 */

import type { Project } from "@/data/projects";

/** How the studio's name reads in prose — SITE_NAME is set in display caps. */
const STUDIO = "MA Studio & Partners";

/**
 * The meta description for a project page.
 *
 * The fallback is deliberately plain: it is a safety net for a project added
 * without copy, not something to leave in place. Anything falling back here is
 * competing against 31 near-identical sentences.
 */
export function projectMetaDescription(project: Project): string {
  const written = project.seoDescription?.trim();
  if (written) return written;
  return `${project.name} — ${project.type} in ${project.location} (${project.year}), designed by ${STUDIO}, architecture studio in Tirana, Albania.`;
}

/** True when the project carries hand-written copy rather than the fallback. */
export function hasWrittenDescription(project: Project): boolean {
  return Boolean(project.seoDescription?.trim());
}

/**
 * Alt text for the image at `index`.
 *
 * `imageAlts` is index-parallel to `images`, so a photo inserted in the middle
 * without a matching alt entry shifts the rest. The fallback keeps such a photo
 * describable rather than silently mislabelled, and never claims to know what
 * the picture shows.
 */
export function projectImageAlt(project: Project, index: number): string {
  const written = project.imageAlts?.[index]?.trim();
  if (written) return written;
  const position = project.images.length > 1 ? `, view ${index + 1} of ${project.images.length}` : "";
  return `${project.name} — ${project.type} in ${project.location} by ${STUDIO}${position}`;
}

/**
 * Search terms for a project page. Google ignores the keywords meta tag, so
 * this earns its place only by keeping the terms in one reviewable list beside
 * the copy that does count — the title, the description and the alt text.
 */
export function projectKeywords(project: Project): string[] {
  const city = project.location.split(",")[0]?.trim() || project.location;
  // Deduped because most projects are in Tirana, where the city-specific term
  // and the studio's home term collapse onto the same string.
  return [
    ...new Set([
      project.name,
      `${project.type} ${city}`,
      `${project.type} architecture Albania`,
      `architecture studio ${city}`,
      "architecture studio Tirana",
      "MA Studio & Partners",
    ]),
  ];
}
