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
   * Optional video link (YouTube). When set, the entry's image renders with a
   * play badge and opens this URL in a new tab — the image itself stays a
   * still, so no player is embedded on the page.
   */
  videoUrl?: string;
}

interface RawPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt?: string;
  source?: { label?: string | null; url?: string | null } | null;
  image?: string | null;
  videoUrl?: string | null;
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
    videoUrl: p.videoUrl || undefined,
  }))
  // Newest first, regardless of authoring order in the content file.
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

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
