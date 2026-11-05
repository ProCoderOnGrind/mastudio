/**
 * Canonical site identity, shared by metadata, the sitemap, robots.txt and
 * structured data so they can never drift apart.
 *
 * The absolute origin matters for SEO: Open Graph images and canonical URLs
 * must be absolute, and crawlers use the canonical to collapse the
 * `/blog?category=…` filter views onto one indexable page. Set
 * NEXT_PUBLIC_SITE_URL in the host environment; Vercel's own VERCEL_URL is used
 * for preview deployments so previews never advertise the production domain.
 */

// The production domain on Vercel. Used only when no env var is present (local
// builds, CI) — it used to point at a domain the site isn't served from.
const FALLBACK = "https://mastudio.al";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return FALLBACK;
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "MA STUDIO & PARTNERS";

export const SITE_DESCRIPTION =
  "Modelling Architecture Studio & Partners — architecture, urban planning, landscape and interior design based in Tirana, Albania.";

/** Absolute URL for a site-relative path, for canonicals and structured data. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, `${SITE_URL}/`).toString();
}
