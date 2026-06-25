"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { tinaField } from "tinacms/dist/react";
import { nextProject, type Project } from "@/data/projects";

/**
 * Project image viewer.
 *  - MOBILE: swipeable photo cards (whole photo, never cropped).
 *  - DESKTOP: one full photo per screen; each wheel step (or arrow key) slides
 *    exactly one photo left/right. The final step lands on the Next project.
 *
 * `onNext`, when provided (viewer), makes the Next panel a button (in-place
 * crossfade). Without it (standalone page) the Next panel is a link.
 */
export default function ProjectStrip({
  project,
  onNext,
  editTarget,
}: {
  project: Project;
  onNext?: () => void;
  /** Raw Tina list item for click-to-edit (dev only); undefined in production. */
  editTarget?: any;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* MOBILE */}
      <div className="min-h-0 flex-1 md:hidden">
        <MobileCover project={project} onNext={onNext} editTarget={editTarget} />
      </div>
      {/* DESKTOP */}
      <div className="hidden min-h-0 flex-1 md:block">
        <DesktopSlides project={project} onNext={onNext} editTarget={editTarget} />
      </div>
    </div>
  );
}

function DesktopSlides({
  project,
  onNext,
  editTarget,
}: {
  project: Project;
  onNext?: () => void;
  editTarget?: any;
}) {
  const images = project.images;
  const next = nextProject(project.slug);
  const total = images.length + (next ? 1 : 0);
  const scroller = useRef<HTMLDivElement>(null);
  const idx = useRef(0);
  const locked = useRef(false);
  const [progress, setProgress] = useState(0);

  const goTo = useCallback(
    (i: number) => {
      const el = scroller.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(total - 1, i));
      idx.current = clamped;
      el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
      setProgress(total > 1 ? clamped / (total - 1) : 0);
    },
    [total],
  );

  // Reset to the first photo when the project changes in-place (Next project).
  useEffect(() => {
    idx.current = 0;
    const el = scroller.current;
    if (el) el.scrollLeft = 0;
    setProgress(0);
  }, [project.slug]);

  // One wheel "tick" = exactly one photo. A short lock absorbs trackpad
  // momentum / repeated wheel events so a single gesture only steps once.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (locked.current) return;
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 6) return;
      locked.current = true;
      goTo(idx.current + (delta > 0 ? 1 : -1));
      window.setTimeout(() => {
        locked.current = false;
      }, 700);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goTo(idx.current + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goTo(idx.current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [goTo]);

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scroller}
        className="no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory overflow-hidden"
        data-cursor="arrow"
      >
        {images.map((src, i) => (
          <section
            key={src}
            className="relative flex h-full w-full shrink-0 snap-center items-center justify-center bg-[#f4f4f3] p-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${project.name} — ${i + 1}`}
              className="h-full w-full object-contain"
              draggable={false}
              data-tina-field={editTarget ? tinaField(editTarget, "images") : undefined}
            />
            {/* Name + meta overlaid on the first photo */}
            {i === 0 && (
              <div className="pointer-events-none absolute bottom-0 left-0 p-8">
                <h1
                  className="text-[clamp(28px,4vw,56px)] uppercase leading-none text-white mix-blend-difference"
                  data-tina-field={editTarget ? tinaField(editTarget, "name") : undefined}
                >
                  {project.name}
                </h1>
                <div
                  className="label mt-2 text-white mix-blend-difference"
                  data-tina-field={editTarget ? tinaField(editTarget, "location") : undefined}
                >
                  {project.location}
                </div>
                <div
                  className="label mt-1 text-white mix-blend-difference"
                  data-tina-field={editTarget ? tinaField(editTarget, "type") : undefined}
                >
                  {project.type} · {project.year}
                </div>
              </div>
            )}
          </section>
        ))}

        {next && (
          <section className="flex h-full w-full shrink-0 snap-center flex-col justify-center px-16">
            {onNext ? (
              <button type="button" onClick={onNext} className="group/next text-left" aria-label={`Next project: ${next.name}`}>
                <div className="label meta mb-3">Next project</div>
                <div className="text-[clamp(28px,4vw,56px)] uppercase leading-none transition-colors group-hover/next:text-accent">
                  {next.name} →
                </div>
                <div className="label meta mt-2">{next.location}</div>
              </button>
            ) : (
              <Link href={`/projects/${next.slug}`} className="group/next" aria-label={`Next project: ${next.name}`}>
                <div className="label meta mb-3">Next project</div>
                <div className="text-[clamp(28px,4vw,56px)] uppercase leading-none transition-colors group-hover/next:text-accent">
                  {next.name} →
                </div>
                <div className="label meta mt-2">{next.location}</div>
              </Link>
            )}
          </section>
        )}
      </div>

      {/* progress bar */}
      <div className="h-[3px] w-full bg-hairline">
        <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

function MobileCover({
  project,
  onNext,
  editTarget,
}: {
  project: Project;
  onNext?: () => void;
  editTarget?: any;
}) {
  const images = project.images;
  const next = nextProject(project.slug);
  const ref = useRef<HTMLDivElement>(null);
  // Reset to the first photo when the project changes in-place (Next project).
  useEffect(() => {
    if (ref.current) ref.current.scrollLeft = 0;
  }, [project.slug]);

  const EASE = [0.22, 1, 0.36, 1] as const;

  return (
    <div ref={ref} className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden bg-[#f0f0f0]">
      {images.map((src, i) => (
        <section key={src} className="flex h-full w-screen shrink-0 snap-center items-center justify-center px-5">
          {/* Full photo in a clean card — never cropped; whole image always shown. */}
          <motion.figure
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: i === 0 ? 0.12 : 0 }}
            className="w-full overflow-hidden rounded-md bg-white shadow-[0_18px_42px_-18px_rgba(0,0,0,0.45)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${project.name} — ${i + 1}`}
              className="w-full"
              draggable={false}
              data-tina-field={editTarget ? tinaField(editTarget, "images") : undefined}
            />
            <figcaption className="px-4 py-3.5">
              <div className="text-[15px] font-semibold uppercase tracking-tight" data-tina-field={editTarget ? tinaField(editTarget, "name") : undefined}>
                {project.name}
              </div>
              <div className="meta mt-0.5 text-[12.5px]" data-tina-field={editTarget ? tinaField(editTarget, "location") : undefined}>
                {project.location}
              </div>
              <div className="mt-1 text-[12px] text-neutral-400" data-tina-field={editTarget ? tinaField(editTarget, "type") : undefined}>
                {project.type} · {project.year}
              </div>
            </figcaption>
          </motion.figure>
        </section>
      ))}
      {next && (
        <section className="flex h-full w-screen shrink-0 snap-center flex-col justify-center px-6">
          {onNext ? (
            <button type="button" onClick={onNext} className="text-left" aria-label={`Next project: ${next.name}`}>
              <div className="label meta mb-3">Next project</div>
              <div className="text-[clamp(28px,8vw,44px)] uppercase leading-none transition-colors hover:text-accent">{next.name} →</div>
              <div className="label meta mt-2">{next.location}</div>
            </button>
          ) : (
            <Link href={`/projects/${next.slug}`} aria-label={`Next project: ${next.name}`}>
              <div className="label meta mb-3">Next project</div>
              <div className="text-[clamp(28px,8vw,44px)] uppercase leading-none transition-colors hover:text-accent">{next.name} →</div>
              <div className="label meta mt-2">{next.location}</div>
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
