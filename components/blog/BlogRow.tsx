"use client";
import Reveal from "@/components/motion/Reveal";
import BlurImage from "@/components/media/BlurImage";
import { tinaField } from "tinacms/dist/react";
import { formatPostDate, postCategoryLabel, type Post } from "@/data/posts";

/**
 * One blog entry — big.dk's news index recreated in the MA Studio clone's
 * editorial row style (hairline divider, label meta, seeded BlurImage). When an
 * `editTarget` is supplied (dev/Tina mode) the fields carry click-to-edit
 * bindings, mirroring ProjectRow. Listing-only: there is no detail route.
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
          {post.videoUrl ? (
            // Still image that reads as a video: the play badge sits above the
            // photo and the whole thing links out to the video (new tab). The
            // badge is the only cue — nothing is embedded or autoplayed here.
            <a
              href={post.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Play video: ${post.title}`}
              className="group relative block"
            >
              <div className="transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.02]">
                {media}
              </div>
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white shadow-[0_6px_24px_-6px_rgba(0,0,0,0.6)] backdrop-blur-[2px] transition-[transform,background-color] duration-300 group-hover:scale-110 group-hover:bg-accent md:h-20 md:w-20">
                  {/* Optically centred: a triangle's visual centre sits left of its box centre. */}
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ml-[3px] h-6 w-6 md:h-7 md:w-7">
                    <path d="M8 5.14v13.72L19 12 8 5.14Z" />
                  </svg>
                </span>
              </span>
            </a>
          ) : (
            <div className="transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] hover:scale-[1.02]">
              {media}
            </div>
          )}
        </div>

        <div className="order-2 md:order-1">
          <div className="label meta" data-tina-field={editTarget ? tinaField(editTarget, "date") : undefined}>
            {formatPostDate(post.date)} · {postCategoryLabel(post.category)}
          </div>
          <h2 className="mt-3 text-[22px] leading-tight md:text-[28px]" data-tina-field={editTarget ? tinaField(editTarget, "title") : undefined}>
            {post.title}
          </h2>
          <p className="mt-3 max-w-[48ch] text-[15px] meta" data-tina-field={editTarget ? tinaField(editTarget, "excerpt") : undefined}>
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
