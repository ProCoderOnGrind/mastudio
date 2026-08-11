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

/**
 * One block of a written article. Authors add Text and Image blocks in any
 * order in the CMS, and they render in that order — so a photo can sit between
 * two paragraphs rather than only at the top.
 */
export type ArticleBlock =
  | { kind: "text"; text: string }
  | { kind: "image"; src: string; caption?: string };

export interface Post {
  slug: string;
  title: string;
  date: string; // ISO "YYYY-MM-DD"; displayed as DD.MM.YYYY
  category: PostCategoryKey;
  excerpt: string;
  source?: PostSource;
  image?: string; // optional path under /public; falls back to a seeded gradient
  /**
   * Optional YouTube link. When present the article closes on a cover image
   * with a play button over it that opens the video on YouTube. Any common
   * YouTube URL form works — it is normalised by `lib/youtube`.
   */
  video?: string;
  /** Cover for that closing video; falls back to the post image, then to YouTube's own thumbnail. */
  videoImage?: string;
  /** The article, as ordered text and image blocks. */
  article?: ArticleBlock[];
  /**
   * The original paragraphs-only article format, kept so posts written before
   * `article` existed keep rendering. Read through `articleBlocks`, never
   * directly.
   */
  body?: string[];
}

/**
 * A block as Tina hands it over. The content file tags each one with
 * `_template`, but the GraphQL layer the editor uses tags them with
 * `__typename` instead — so neither tag can be relied on, and the fields
 * themselves are what decide.
 */
interface RawBlock {
  _template?: string | null;
  __typename?: string | null;
  text?: string | null;
  src?: string | null;
  caption?: string | null;
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
  videoImage?: string | null;
  article?: (RawBlock | null)[] | null;
  body?: (string | null)[] | null;
}

function toCategory(value: string): PostCategoryKey {
  return isPostCategory(value) ? value : "news";
}

/**
 * Read Tina's stored blocks into `ArticleBlock`s, dropping anything unusable —
 * a text block with no text, an image block with no file. A half-filled block
 * in the CMS should leave a gap in the editor, not a broken article on the site.
 */
export function toArticleBlocks(raw: RawPost["article"]): ArticleBlock[] | undefined {
  const blocks: ArticleBlock[] = [];
  for (const item of raw ?? []) {
    if (!item) continue;
    // Keyed off the fields, not the template tag: an image block carries a
    // file, a text block carries words. That holds for the content file and
    // for the editor's GraphQL alike, which name their tags differently.
    if (item.src?.trim()) {
      blocks.push({
        kind: "image",
        src: item.src.trim(),
        ...(item.caption?.trim() ? { caption: item.caption.trim() } : {}),
      });
    } else if (item.text?.trim()) {
      blocks.push({ kind: "text", text: item.text.trim() });
    }
  }
  return blocks.length ? blocks : undefined;
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
    videoImage: p.videoImage || undefined,
    article: toArticleBlocks(p.article),
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
  return Boolean(hasArticle(post) || post.video);
}

/**
 * The article as ordered blocks, whichever format it was written in. Posts
 * authored before the block editor existed hold plain paragraphs in `body`;
 * they read out here as text blocks, so every consumer handles one shape.
 */
export function articleBlocks(post: Post): ArticleBlock[] {
  if (post.article?.length) return post.article;
  return (post.body ?? []).map((text) => ({ kind: "text", text }));
}

/** Whether there is anything written to open. */
export function hasArticle(post: Post): boolean {
  return articleBlocks(post).length > 0;
}

/** Just the prose, for metadata and structured data. */
export function articleText(post: Post): string {
  return articleBlocks(post)
    .filter((b): b is { kind: "text"; text: string } => b.kind === "text")
    .map((b) => b.text)
    .join("\n\n");
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
