"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { nextProject, type Project } from "@/data/projects";

/**
 * Horizontal "filmstrip" project view (big.dk-style): a fixed-height row of
 * panels where wheel/drag input maps to horizontal scroll with smoothing.
 * On mobile each image panel is full-bleed with a blurred fill behind the
 * contained image. The final panel links to the next project.
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
  const scroller = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const raf = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  // smooth scroll loop toward target
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    // Start each project at the beginning — reset when switching via "Next project".
    el.scrollLeft = 0;
    target.current = 0;
    setProgress(0);

    const max = () => el.scrollWidth - el.clientWidth;
    const tick = () => {
      const cur = el.scrollLeft;
      const diff = target.current - cur;
      if (Math.abs(diff) > 0.5) {
        el.scrollLeft = cur + diff * 0.18;
        raf.current = requestAnimationFrame(tick);
      } else {
        el.scrollLeft = target.current;
        raf.current = null;
      }
      setProgress(max() > 0 ? el.scrollLeft / max() : 0);
    };
    const kick = () => {
      if (raf.current == null) raf.current = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;
      e.preventDefault();
      target.current = Math.max(0, Math.min(max(), target.current + delta));
      kick();
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        target.current = Math.min(max(), target.current + el.clientWidth * 0.8);
        kick();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        target.current = Math.max(0, target.current - el.clientWidth * 0.8);
        kick();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [project.slug]);

  // pointer drag — only engages once the pointer actually moves.
  const start = useRef<{ x: number; left: number; id: number } | null>(null);
  const moved = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const el = scroller.current;
    if (!el) return;
    start.current = { x: e.clientX, left: el.scrollLeft, id: e.pointerId };
    moved.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = scroller.current;
    if (!el || !start.current) return;
    const dx = e.clientX - start.current.x;
    if (!moved.current && Math.abs(dx) > 4) {
      moved.current = true;
      el.setPointerCapture(start.current.id);
    }
    if (moved.current) {
      el.scrollLeft = start.current.left - dx;
      target.current = el.scrollLeft;
    }
  };
  const onPointerUp = () => {
    start.current = null;
  };

  const images = project.images;
  const next = nextProject(project.slug);

  return (
    <div className="flex h-full flex-col">
      {/* MOBILE: full-screen cover swipe — each photo fills the screen, name + index overlaid. */}
      <div className="min-h-0 flex-1 md:hidden">
        <MobileCover project={project} onNext={onNext} editTarget={editTarget} />
      </div>

      {/* DESKTOP: horizontal filmstrip (unchanged). */}
      <div className="hidden min-h-0 flex-1 flex-col md:flex">
      <div
        ref={scroller}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="no-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
        data-cursor="arrow"
      >
        <div className="flex h-full flex-nowrap items-stretch gap-8 px-5 md:gap-16 md:px-10">
          {/* Hero panel */}
          <section className="relative flex h-full w-screen shrink-0 items-center justify-center overflow-hidden bg-[#f4f4f3] md:block md:w-auto md:bg-transparent" style={{ maxWidth: "min(100vw, 1100px)" }}>
            {images[0] && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={images[0]} alt={project.name} className="relative z-[1] h-auto max-h-full w-full max-w-full object-contain md:h-full md:w-auto" draggable={false} data-tina-field={editTarget ? tinaField(editTarget, "images") : undefined} />
            )}
            <div className="absolute bottom-0 left-0 z-[2] p-6">
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
                className="label mt-1 text-white mix-blend-difference md:hidden"
                data-tina-field={editTarget ? tinaField(editTarget, "type") : undefined}
              >
                {project.type} · {project.year}
              </div>
            </div>
          </section>

          {/* Info column — desktop only */}
          <section className="hidden h-full w-[clamp(220px,22vw,300px)] shrink-0 flex-col justify-center md:flex">
            <Meta label="Project" value={project.type} field={editTarget ? tinaField(editTarget, "type") : undefined} />
            <Meta label="Year" value={String(project.year)} field={editTarget ? tinaField(editTarget, "year") : undefined} />
            <Meta label="Location" value={project.location} field={editTarget ? tinaField(editTarget, "location") : undefined} />
            <Meta label="Studio" value="MA Studio & Partners" />
            {project.client && <Meta label="Client" value={project.client} field={editTarget ? tinaField(editTarget, "client") : undefined} />}
            {project.status && <Meta label="Status" value={project.status} field={editTarget ? tinaField(editTarget, "status") : undefined} />}
            {project.size && <Meta label="Size" value={project.size} field={editTarget ? tinaField(editTarget, "size") : undefined} />}
            {project.description ? (
              <div className="meta mt-6 text-[14px] leading-relaxed [&_p]:mb-3" data-tina-field={editTarget ? tinaField(editTarget, "description") : undefined}>
                <TinaMarkdown content={project.description as any} />
              </div>
            ) : null}
            <p className="meta mt-6 text-[14px] leading-relaxed">
              Swipe through the project — or use the wheel and arrow keys.
            </p>
          </section>

          {/* Remaining images — light surface; the empty space carries an index caption */}
          {images.slice(1).map((src, i) => (
            <section key={src} className="relative flex h-full w-screen shrink-0 flex-col overflow-hidden bg-[#f4f4f3] md:block md:w-auto md:bg-transparent">
              <div className="flex items-baseline justify-between px-6 pt-6 md:hidden">
                <span className="label">{project.name}</span>
                <span className="label meta">
                  {String(i + 2).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </span>
              </div>
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden md:contents">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${project.name} — ${i + 2}`} className="h-auto max-h-full w-full object-contain md:h-full md:w-auto" draggable={false} data-tina-field={editTarget ? tinaField(editTarget, "images") : undefined} />
              </div>
            </section>
          ))}

          {/* Next project panel */}
          {next && (
            <section className="flex h-full w-screen shrink-0 flex-col justify-center px-5 md:w-[40vw] md:px-0">
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
      </div>

      {/* progress bar */}
      <div className="h-[3px] w-full bg-hairline">
        <div className="h-full bg-accent transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
      </div>
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

  // Smooth entrance: cards fade + rise as the viewer opens. Re-keyed per project
  // so it replays when switching via "Next project".
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

function Meta({ label, value, field }: { label: string; value: string; field?: string }) {
  return (
    <div className="mb-3 border-t border-hairline pt-2" data-tina-field={field}>
      <div className="label meta">{label}</div>
      <div className="label">{value}</div>
    </div>
  );
}
