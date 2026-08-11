import postsData from "@/content/posts.json";

export type PostCategoryKey = "news" | "events" | "awards" | "lectures";

export interface PostCategory {
  key: PostCategoryKey;
  label: string;
}

// Editorial sections — mirrors big.dk's News secondary nav (Events / Awards / Lectures).
export const POST_CATEGORIES: PostCategory[] = [
  { key: "news", label: "News" },
  { key: "events", label: "Events" },
  { key: "awards", label: "Awards" },
  { key: "lectures", label: "Lectures" },
];

export interface PostSource {
  label: string;
  url: string;
}

export interface Post {
  slug: string;
  title: string;
  date: string; // ISO "YYYY-MM-DD"; displayed as DD.MM.YYYY
  category: PostCategoryKey;
  excerpt: string;
  source?: PostSource;
  image?: string; // optional path under /public; falls back to a seeded gradient
  /**
   * Optional YouTube link. When present the entry's image becomes a play
   * target that opens the video on YouTube. Any common YouTube URL form works
   * — it is normalised by `lib/youtube`.
   */
  video?: string;
  /**
   * Full article text, one string per paragraph — the same shape the About
   * sections use. A post only gets its own page once this (or a video) exists;
   * see `hasPostPage`.
   */
  body?: string[];
}

interface RawPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt?: string;
  source?: { label?: string | null; url?: string | null } | null;
  image?: string | null;
  video?: string | null;
  body?: (string | null)[] | null;
}

function toCategory(value: string): PostCategoryKey {
  return isPostCategory(value) ? value : "news";
}

export const POSTS: Post[] = (postsData as { posts: RawPost[] }).posts
  .map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    category: toCategory(p.category),
    excerpt: p.excerpt ?? "",
    source:
      p.source && p.source.label && p.source.url
        ? { label: p.source.label, url: p.source.url }
        : undefined,
    image: p.image || undefined,
    video: p.video || undefined,
    body: p.body?.filter((line): line is string => Boolean(line?.trim())) ?? undefined,
  }))
  // Newest first, regardless of authoring order in the content file.
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

/**
 * Whether a post earns its own page.
 *
 * A page built from a headline and a two-line excerpt is thin content, and a
 * set of them reads to search engines as doorway pages — actively worse than
 * having no detail route at all. So a post is only promoted once it carries
 * real substance: written paragraphs, or a video to watch. Write a body in the
 * CMS and the page, its sitemap entry and its link all appear on the next
 * build; until then the post stays listing-only.
 */
export function hasPostPage(post: Post): boolean {
  return Boolean(post.body?.length || post.video);
}

/** Every post that currently has a detail page. */
export function postsWithPages(): Post[] {
  return POSTS.filter(hasPostPage);
}

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function isPostCategory(value: string): value is PostCategoryKey {
  return POST_CATEGORIES.some((c) => c.key === value);
}

export function postCategoryLabel(key: string): string {
  return POST_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export function postsByCategory(cat: string): Post[] {
  return isPostCategory(cat) ? POSTS.filter((p) => p.category === cat) : POSTS;
}

// big.dk shows dates as DD.MM.YYYY; we store ISO YYYY-MM-DD.
export function formatPostDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]}.${m[2]}.${m[1]}`;
}
