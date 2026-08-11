import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlurImage from "@/components/media/BlurImage";
import {
  getPost,
  postsWithPages,
  hasPostPage,
  formatPostDate,
  postCategoryLabel,
} from "@/data/posts";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { youtubeId, youtubeEmbedUrl, youtubeThumbnail, youtubeWatchUrl } from "@/lib/youtube";

/**
 * A single blog entry.
 *
 * Only posts that carry real substance get a route here — see `hasPostPage`.
 * That keeps six excerpt-only stubs out of the index while letting a post
 * become an indexable page the moment someone writes its body in the CMS.
 */
export function generateStaticParams() {
  return postsWithPages().map((p) => ({ slug: p.slug }));
}

// A slug outside generateStaticParams is a post without a page: 404, don't render.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post || !hasPostPage(post)) return {};

  const description = post.excerpt || `${post.title} — MA Studio & Partners, Tirana, Albania.`;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: `${post.title} | ${SITE_NAME}`,
      description,
      url: absoluteUrl(`/blog/${post.slug}`),
      publishedTime: post.date,
      section: postCategoryLabel(post.category),
      ...(post.image ? { images: [absoluteUrl(post.image)] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post || !hasPostPage(post)) notFound();

  const videoId = youtubeId(post.video);
  const embedUrl = youtubeEmbedUrl(post.video);
  const watchUrl = youtubeWatchUrl(post.video);
  const url = absoluteUrl(`/blog/${post.slug}`);

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${url}#post`,
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      articleSection: postCategoryLabel(post.category),
      inLanguage: "en",
      author: { "@id": absoluteUrl("/#organization") },
      publisher: { "@id": absoluteUrl("/#organization") },
      mainEntityOfPage: url,
      url,
      ...(post.image ? { image: absoluteUrl(post.image) } : {}),
      ...(post.body?.length ? { articleBody: post.body.join("\n\n") } : {}),
      ...(watchUrl
        ? {
            video: {
              "@type": "VideoObject",
              name: post.title,
              description: post.excerpt,
              uploadDate: post.date,
              contentUrl: watchUrl,
              embedUrl,
              thumbnailUrl: youtubeThumbnail(post.video),
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Blog", item: absoluteUrl("/blog") },
        { "@type": "ListItem", position: 2, name: post.title, item: url },
      ],
    },
  ];

  return (
    <article className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="px-5 pt-8 md:pt-10">
        <Link
          href="/blog"
          className="label meta inline-block transition-colors hover:text-accent"
        >
          ← Blog
        </Link>

        <div className="label meta mt-6">
          {formatPostDate(post.date)} · {postCategoryLabel(post.category)}
        </div>

        <h1 className="mt-3 max-w-[22ch] text-[30px] leading-tight md:text-[52px]">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-5 max-w-[60ch] text-[18px] leading-relaxed text-big-gray md:text-[20px]">
            {post.excerpt}
          </p>
        )}
      </div>

      <div className="mt-10 px-5">
        {videoId && embedUrl ? (
          <div className="relative aspect-video w-full overflow-hidden bg-neutral-200">
            <iframe
              // nocookie host so an unplayed embed sets no tracking cookie.
              src={embedUrl.replace("www.youtube.com", "www.youtube-nocookie.com")}
              title={post.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        ) : (
          <BlurImage
            seed={post.slug}
            src={post.image}
            label={post.title}
            ratio="16 / 10"
            priority
            sizes="(max-width: 768px) 100vw, 100vw"
          />
        )}
      </div>

      {post.body?.length ? (
        <div className="mt-12 px-5">
          <div className="flex max-w-[68ch] flex-col gap-5">
            {post.body.map((paragraph, i) => (
              <p key={i} className="text-[17px] leading-relaxed md:text-justify">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 px-5">
        {post.source && (
          <a
            href={post.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="label inline-block border-b border-black pb-0.5 transition-colors hover:border-accent hover:text-accent"
          >
            {post.source.label} ↗
          </a>
        )}
        {watchUrl && (
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="label inline-block border-b border-black pb-0.5 transition-colors hover:border-accent hover:text-accent"
          >
            Watch on YouTube ↗
          </a>
        )}
        <Link
          href="/services"
          className="label inline-block border-b border-black pb-0.5 transition-colors hover:border-accent hover:text-accent"
        >
          Our services
        </Link>
      </div>
    </article>
  );
}
