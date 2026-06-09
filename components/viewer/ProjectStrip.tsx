"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
}: {
  project: Project;
  onNext?: () => void;
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
      <div
        ref={scroller}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="no-scrollbar flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
        data-cursor="arrow"
      >
        <div className="flex h-full flex-nowrap items-stretch gap-8 px-5 md:gap-16 md:px-10">
          {/* Hero panel */}
          <section className="relative flex h-full w-screen shrink-0 items-center justify-center overflow-hidden md:block md:w-auto" style={{ maxWidth: "min(100vw, 1100px)" }}>
            {images[0] && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[0]} aria-hidden alt="" className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-[.45] md:hidden" draggable={false} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[0]} alt={project.name} className="relative z-[1] h-auto max-h-full w-full max-w-full object-contain md:h-full md:w-auto" draggable={false} />
              </>
            )}
            <div className="absolute bottom-0 left-0 z-[2] p-6">
              <h1 className="text-[clamp(28px,4vw,56px)] uppercase leading-none text-white mix-blend-difference">
                {project.name}
              </h1>
              <div className="label mt-2 text-white mix-blend-difference">{project.location}</div>
              <div className="label mt-1 text-white mix-blend-difference md:hidden">
                {project.type} · {project.year}
              </div>
            </div>
          </section>

          {/* Info column — desktop only */}
          <section className="hidden h-full w-[clamp(220px,22vw,300px)] shrink-0 flex-col justify-center md:flex">
            <Meta label="Project" value={project.type} />
            <Meta label="Year" value={String(project.year)} />
            <Meta label="Location" value={project.location} />
            <Meta label="Studio" value="MA Studio & Partners" />
            <p className="meta mt-6 text-[14px] leading-relaxed">
              Swipe through the project — or use the wheel and arrow keys.
            </p>
          </section>

          {/* Remaining images */}
          {images.slice(1).map((src, i) => (
            <section key={src} className="relative flex h-full w-screen shrink-0 items-center justify-center overflow-hidden md:block md:w-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} aria-hidden alt="" className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-[.45] md:hidden" draggable={false} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${project.name} — ${i + 2}`} className="relative z-[1] h-auto max-h-full w-full object-contain md:h-full md:w-auto" draggable={false} />
            </section>
          ))}

          {/* Next project panel */}
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
        </div>
      </div>

      {/* progress bar */}
      <div className="h-[3px] w-full bg-hairline">
        <div className="h-full bg-accent transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 border-t border-hairline pt-2">
      <div className="label meta">{label}</div>
      <div className="label">{value}</div>
    </div>
  );
}
