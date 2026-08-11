"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { tinaField } from "tinacms/dist/react";
import ArticleContent from "./ArticleContent";
import { useArticle } from "./ArticleContext";
import { formatPostDate, postCategoryLabel } from "@/data/posts";

/**
 * The blog article, opened over the listing rather than as a page change.
 *
 * Portalled to <body> so no ancestor transform on the listing can become the
 * containing block and offset a fixed overlay — the same reason the intro
 * overlay portals.
 */
export default function ArticleModal() {
  const { post, editTarget, close } = useArticle();
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  // Whatever had focus before opening, so it can be handed back on close.
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!post) return;

    restoreFocus.current = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      // Keep Tab inside the dialog while it is open.
      if (e.key !== "Tab" || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    // Hold the page still behind the overlay, compensating for the scrollbar
    // so the listing does not jump sideways as it is hidden.
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      restoreFocus.current?.focus?.();
    };
  }, [post, close]);

  // No mount guard needed: `post` is null through SSR and hydration and only
  // becomes set by a click, so the portal never runs on the server.
  if (!post) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/45 px-0 py-0 backdrop-blur-[2px] md:px-6 md:py-10"
      // A click that starts and ends on the backdrop closes; a drag that ends
      // there after selecting text inside the article does not.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-popup-title"
        className="relative w-full max-w-[860px] bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-hairline bg-white/95 px-5 py-3 backdrop-blur md:px-10">
          <span className="label meta truncate">{postCategoryLabel(post.category)}</span>
          <button
            ref={closeButton}
            type="button"
            onClick={close}
            className="label -mr-2 shrink-0 px-2 py-1 transition-colors hover:text-accent"
          >
            Close ✕
          </button>
        </div>

        <article className="px-5 pb-12 pt-8 md:px-10">
          <div
            className="label meta"
            data-tina-field={editTarget ? tinaField(editTarget, "date") : undefined}
          >
            {formatPostDate(post.date)} · {postCategoryLabel(post.category)}
          </div>

          <h2
            id="article-popup-title"
            className="mt-3 max-w-[24ch] text-[26px] leading-tight md:text-[40px]"
            data-tina-field={editTarget ? tinaField(editTarget, "title") : undefined}
          >
            {post.title}
          </h2>

          {post.excerpt && (
            <p
              className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-big-gray md:text-[19px]"
              data-tina-field={editTarget ? tinaField(editTarget, "excerpt") : undefined}
            >
              {post.excerpt}
            </p>
          )}

          <div className="mt-9">
            <ArticleContent post={post} editTarget={editTarget} />
          </div>

          {post.source && (
            <a
              href={post.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="label mt-9 inline-block border-b border-black pb-0.5 transition-colors hover:border-accent hover:text-accent"
            >
              {post.source.label} ↗
            </a>
          )}
        </article>
      </div>
    </div>,
    document.body,
  );
}
