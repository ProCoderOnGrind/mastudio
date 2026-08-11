import BlurImage from "@/components/media/BlurImage";
import YouTubePlayBadge from "@/components/media/YouTubePlayBadge";
import { tinaField } from "tinacms/dist/react";
import { articleBlocks, type Post } from "@/data/posts";
import { youtubeThumbnail, youtubeWatchUrl } from "@/lib/youtube";

/**
 * The body of a written article: the CMS blocks in the order they were written,
 * then the closing video if the post has one.
 *
 * Shared deliberately by the popup and by the standalone `/blog/<slug>` page,
 * so an article reads identically whichever way it was reached and there is
 * only one place to change how it renders.
 */
export default function ArticleContent({
  post,
  editTarget,
}: {
  post: Post;
  /** Raw Tina document for click-to-edit (dev only); undefined in production. */
  editTarget?: any;
}) {
  const blocks = articleBlocks(post);
  const watchUrl = youtubeWatchUrl(post.video);
  // The author's cover, else the post's own photo, else YouTube's poster frame.
  const cover = post.videoImage || post.image || youtubeThumbnail(post.video) || undefined;

  return (
    <div className="flex flex-col gap-8">
      {blocks.length > 0 && (
        <div
          className="flex flex-col gap-7"
          data-tina-field={editTarget ? tinaField(editTarget, "article") : undefined}
        >
          {blocks.map((block, i) =>
            block.kind === "text" ? (
              <p key={i} className="max-w-[68ch] whitespace-pre-line text-[17px] leading-relaxed">
                {block.text}
              </p>
            ) : (
              // Width is capped so the first photo clears the fold on open
              // rather than being cut off. The 440px is the chrome above it —
              // bar, date, headline, excerpt, opening paragraph — subtracted
              // before scaling, so the clearance stays constant instead of
              // vanishing on a short laptop. Capping the height instead would
              // leave side bars on a tall screen; narrowing keeps the frame
              // exactly 16:10. `contain` because the point is the whole photo.
              <figure key={i} className="flex flex-col gap-2.5">
                <BlurImage
                  src={block.src}
                  label={block.caption || post.title}
                  ratio="16 / 10"
                  fit="contain"
                  className="mx-auto w-full max-w-[calc((100dvh-440px)*1.6)] bg-neutral-100"
                  sizes="(max-width: 768px) 100vw, 760px"
                />
                {block.caption && (
                  <figcaption className="label meta mx-auto w-full max-w-[calc((100dvh-440px)*1.6)]">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            ),
          )}
        </div>
      )}

      {watchUrl && (
        <figure
          className="flex flex-col gap-3"
          data-tina-field={editTarget ? tinaField(editTarget, "videoImage") : undefined}
        >
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            // Unquoted: several headlines already open with a curly quote,
            // which would double up inside a quoted label.
            aria-label={`Watch on YouTube: ${post.title}`}
            className="group relative block outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <div className="relative overflow-hidden">
              <div className="transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <BlurImage
                  seed={post.slug}
                  src={cover}
                  label={post.title}
                  ratio="16 / 9"
                  sizes="(max-width: 768px) 100vw, 760px"
                />
              </div>
              <YouTubePlayBadge />
            </div>
          </a>
          <figcaption className="label meta">Watch on YouTube ↗</figcaption>
        </figure>
      )}
    </div>
  );
}
