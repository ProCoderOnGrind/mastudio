import Link from "next/link";
import type { Metadata } from "next";
import BlogList from "@/components/blog/BlogList";
import { ArticleProvider } from "@/components/blog/ArticleContext";
import ArticleModal from "@/components/blog/ArticleModal";
import {
  POSTS,
  POST_CATEGORIES,
  postsByCategory,
  isPostCategory,
  postCategoryLabel,
  hasPostPage,
} from "@/data/posts";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { youtubeEmbedUrl, youtubeThumbnail, youtubeWatchUrl } from "@/lib/youtube";

const BLOG_DESCRIPTION =
  "News, awards, lectures and events from MA Studio & Partners — architecture, urban planning, landscape and interior design based in Tirana, Albania.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  const active = category && isPostCategory(category) ? category : null;

  const title = active ? `${postCategoryLabel(active)} — Blog` : "Blog";
  const description = active
    ? `${postCategoryLabel(active)} from MA Studio & Partners — architecture, urban planning, landscape and interior design in Tirana, Albania.`
    : BLOG_DESCRIPTION;

  return {
    title,
    description,
    // Every filter view collapses onto /blog: same document, subset of rows.
    // Without this the four category URLs compete with the index for the same
    // terms and split its ranking signals.
    alternates: { canonical: "/blog" },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE_NAME}`,
      description,
      url: absoluteUrl("/blog"),
      siteName: SITE_NAME,
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

/**
 * Structured data for the listing. Each entry becomes a BlogPosting, and a post
 * carrying a YouTube link also gets VideoObject markup so the video is eligible
 * for video rich results and the Google video tab.
 */
function blogSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": absoluteUrl("/blog#blog"),
    name: `Blog | ${SITE_NAME}`,
    description: BLOG_DESCRIPTION,
    url: absoluteUrl("/blog"),
    publisher: { "@id": absoluteUrl("/#organization") },
    blogPost: POSTS.map((post) => {
      const watch = youtubeWatchUrl(post.video);
      // Posts with their own page point at it; the rest resolve to the listing.
      const page = hasPostPage(post) ? absoluteUrl(`/blog/${post.slug}`) : absoluteUrl("/blog");
      return {
        "@type": "BlogPosting",
        "@id": hasPostPage(post) ? `${page}#post` : absoluteUrl(`/blog#${post.slug}`),
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        articleSection: postCategoryLabel(post.category),
        author: { "@id": absoluteUrl("/#organization") },
        publisher: { "@id": absoluteUrl("/#organization") },
        mainEntityOfPage: page,
        url: page,
        ...(post.image ? { image: absoluteUrl(post.image) } : {}),
        ...(watch
          ? {
              video: {
                "@type": "VideoObject",
                name: post.title,
                description: post.excerpt,
                uploadDate: post.date,
                contentUrl: watch,
                embedUrl: youtubeEmbedUrl(post.video),
                thumbnailUrl: youtubeThumbnail(post.video),
              },
            }
          : {}),
      };
    }),
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category && isPostCategory(category) ? category : null;

  let list;
  if (process.env.NODE_ENV === "development") {
    const { client } = await import("@/tina/__generated__/client");
    const res = await client.queries.posts({ relativePath: "posts.json" });
    const BlogListEditable = (await import("@/components/tina/BlogListEditable")).default;
    list = (
      <BlogListEditable
        activeCategory={active}
        tina={{ query: res.query, variables: res.variables, data: res.data }}
      />
    );
  } else {
    const posts = active ? postsByCategory(active) : POSTS;
    list = <BlogList posts={posts} />;
  }

  const chipBase =
    "label inline-flex items-center border border-hairline px-3 py-2.5 transition-colors md:py-1.5";

  return (
    <div>
      <script
        type="application/ld+json"
        // Static, author-controlled content — no user input reaches this string.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema()) }}
      />

      {/* The design opens straight on the filter row and the hero photo, so the
          page's one h1 is carried for crawlers and screen readers without
          altering that layout. */}
      <h1 className="sr-only">
        {active ? `${postCategoryLabel(active)} — MA Studio & Partners blog` : "MA Studio & Partners blog — news, awards, lectures and events"}
      </h1>

      <nav className="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-8 pb-5 md:pt-10" aria-label="Filter posts by category">
        <Link
          href="/blog"
          aria-current={!active ? "true" : undefined}
          className={`${chipBase} ${!active ? "border-black bg-black text-white" : "hover:bg-black hover:text-white"}`}
        >
          All
        </Link>
        {POST_CATEGORIES.map((c) => {
          const isActive = active === c.key;
          return (
            <Link
              key={c.key}
              href={`/blog?category=${c.key}`}
              aria-current={isActive ? "true" : undefined}
              className={`${chipBase} ${isActive ? "border-black bg-black text-white" : "hover:bg-black hover:text-white"}`}
            >
              {c.label}
            </Link>
          );
        })}
      </nav>

      {/* The provider wraps the rows so a click opens the article over the
          listing; the standalone /blog/<slug> page stays the crawlable copy. */}
      <ArticleProvider>
        <div className="mt-2">{list}</div>
        <ArticleModal />
      </ArticleProvider>
    </div>
  );
}
