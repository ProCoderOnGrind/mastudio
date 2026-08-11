"use client";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import BlurImage from "@/components/media/BlurImage";
import YouTubePlayBadge from "@/components/media/YouTubePlayBadge";
import { tinaField } from "tinacms/dist/react";
import { formatPostDate, postCategoryLabel, hasPostPage, hasArticle, type Post } from "@/data/posts";
import { youtubeWatchUrl } from "@/lib/youtube";
import { useArticleOptional } from "./ArticleContext";

/**
 * One blog entry — big.dk's news index recreated in the MA Studio clone's
 * editorial row style (hairline divider, label meta, seeded BlurImage). When an
 * `editTarget` is supplied (dev/Tina mode) the fields carry click-to-edit
 * bindings, mirroring ProjectRow. Listing-only: there is no detail route.
 *
 * Clicking an entry that has a written article opens it in a popup over the
 * listing; the underlying `/blog/<slug>` href stays real, so middle-click,
 * ctrl-click and crawlers all still get a page. A post with a video but nothing
 * written keeps the older behaviour of opening the video directly.
 */
export default function BlogRow({
  post,
  hero = false,
  editTarget,
}: {
  post: Post;
  hero?: boolean;
  editTarget?: any;
}) {
  const articles = useArticleOptional();
  const href = `/blog/${post.slug}`;
  // Only take over the click when there is an article to pop up AND a provider
  // mounted to hold it; otherwise the link navigates as normal.
  const popsOpen = Boolean(articles) && hasArticle(post);
  // The image opens the video only when there is no article to open instead.
  const watchUrl = popsOpen ? null : youtubeWatchUrl(post.video);

  const openArticle = (e: React.MouseEvent) => {
    // Let the browser handle new-tab / new-window / download intents.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    articles!.open(post, editTarget);
  };

  const media = (
    <BlurImage
      seed={post.slug}
      src={post.image}
      label={post.title}
      ratio={hero ? null : "16 / 10"}
      priority={hero}
      // Hero (first) entry fills ~one viewport so exactly one full photo
      // shows on load; the rest keep the 16:10 editorial ratio.
      className={hero ? "aspect-[16/10] md:aspect-auto md:h-[calc(100svh-280px)]" : ""}
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );

  return (
    <Reveal>
      <article className="grid grid-cols-1 items-center gap-5 border-t border-hairline px-5 py-8 md:grid-cols-2 md:gap-10">
        <div className="order-1 overflow-hidden md:order-2" data-tina-field={editTarget ? tinaField(editTarget, "image") : undefined}>
          {watchUrl ? (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              // Unquoted: several headlines already open with a curly quote,
              // which would double up inside a quoted label.
              aria-label={`Watch on YouTube: ${post.title}`}
              className="group relative block outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <div className="relative transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                {media}
                <YouTubePlayBadge />
              </div>
            </a>
          ) : popsOpen ? (
            <a
              href={href}
              onClick={openArticle}
              aria-label={`Read: ${post.title}`}
              className="block outline-none transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              {media}
            </a>
          ) : (
            <div className="transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100">
              {media}
            </div>
          )}
        </div>

        <div className="order-2 md:order-1">
          <div className="label meta" data-tina-field={editTarget ? tinaField(editTarget, "date") : undefined}>
            {formatPostDate(post.date)} · {postCategoryLabel(post.category)}
          </div>
          <h2 className="mt-3 text-[24px] leading-tight md:text-[32px]" data-tina-field={editTarget ? tinaField(editTarget, "title") : undefined}>
            {/* Only posts with a real page are linked; the rest stay listing-only. */}
            {popsOpen ? (
              <a href={href} onClick={openArticle} className="transition-colors hover:text-accent">
                {post.title}
              </a>
            ) : hasPostPage(post) ? (
              <Link href={href} className="transition-colors hover:text-accent">
                {post.title}
              </Link>
            ) : (
              post.title
            )}
          </h2>
          <p className="mt-3 max-w-[48ch] text-[16px] meta" data-tina-field={editTarget ? tinaField(editTarget, "excerpt") : undefined}>
            {post.excerpt}
          </p>
          {post.source && (
            <a
              href={post.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="label mt-5 inline-block border-b border-black pb-0.5 transition-colors hover:border-accent hover:text-accent"
            >
              {post.source.label} ↗
            </a>
          )}
        </div>
      </article>
    </Reveal>
  );
}
