/**
 * One builder for every page's <head>, so canonicals, share cards and titles
 * can't drift apart page by page.
 *
 * Why it exists: Next merges metadata *shallowly* between the layout and a
 * page. Two consequences bit this site in production:
 *   - a `canonical: "/"` in the root layout was inherited by every page that
 *     didn't set its own, so About, Contact, Co-Founders and Book all told
 *     Google "I am a copy of the homepage" and were dropped from the index;
 *   - any page that set `openGraph` replaced the layout's wholesale, losing the
 *     share image, so those links unfurled as bare text.
 * Building the whole object here, every time, closes both gaps.
 */

import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

/** Google shows roughly 60 characters of a title before truncating it. */
const TITLE_BUDGET = 60;
/** …and roughly 155–160 characters of a description. */
const DESCRIPTION_BUDGET = 158;

const SUFFIX = ` | ${SITE_NAME}`;

/** The studio's generated share card (app/opengraph-image.tsx). */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "MA Studio & Partners — architecture studio in Tirana, Albania",
};

/**
 * Trim to the SERP budget at a word boundary, so Google shows our sentence
 * rather than cutting it mid-word or replacing it with its own snippet.
 */
export function clampDescription(text: string, max = DESCRIPTION_BUDGET): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:—–-]+$/, "")}…`;
}

/**
 * The page title, with the studio suffix only when it still fits. A long
 * project name keeps its own words (the part that matches the search) and
 * drops the brand rather than being truncated by Google.
 */
export function fullTitle(title: string): string {
  return title.length + SUFFIX.length <= TITLE_BUDGET ? `${title}${SUFFIX}` : title;
}

export function pageMetadata({
  title,
  description,
  path,
  images,
  type = "website",
  keywords,
  extra,
}: {
  /** The page's own name, without the studio suffix. */
  title: string;
  description: string;
  /** Site-relative path; also the canonical. */
  path: string;
  images?: { url: string; alt?: string; width?: number; height?: number }[];
  type?: "website" | "article";
  keywords?: string[];
  /** Extra Open Graph fields (e.g. publishedTime for articles). */
  extra?: Record<string, unknown>;
}): Metadata {
  const resolvedTitle = fullTitle(title);
  const desc = clampDescription(description);
  const ogImages = images?.length ? images : [DEFAULT_OG_IMAGE];
  return {
    // `absolute` so the layout template can't append the suffix a second time.
    title: { absolute: resolvedTitle },
    description: desc,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "en_GB",
      title: resolvedTitle,
      description: desc,
      url: absoluteUrl(path),
      images: ogImages,
      ...extra,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: desc,
      images: ogImages.map((i) => i.url),
    },
  };
}
