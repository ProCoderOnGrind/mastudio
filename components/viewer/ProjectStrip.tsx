"use client";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import type { OriginRect } from "./ViewerContext";

/**
 * Horizontal "filmstrip" project view, modelled on big.dk:
 * a fixed-height row of panels (hero + info columns + full-height images)
 * where vertical wheel input is mapped to horizontal scroll with smoothing.
 */
export default function ProjectStrip({
  project,
  next,
  onNext,
}: {
  project: Project;
  next?: Project;
  onNext?: (p: Project, rect?: OriginRect) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const raf = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  // smooth scroll loop toward target
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    target.current = el.scrollLeft;

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

  // pointer drag — only starts after the pointer actually moves, so plain
  // clicks on children (e.g. the Next button) still fire.
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
  // if a drag happened, swallow the click so it doesn't trigger navigation
  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
    }
  };

  const images = project.images;

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scroller}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        className="no-scrollbar flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
        data-cursor="arrow"
      >
        <div className="flex h-full flex-nowrap items-stretch gap-8 px-5 md:gap-16 md:px-10">
          {/* Hero panel */}
          <section className="relative h-full shrink-0" style={{ width: "min(88vw, 1100px)" }}>
            {images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0]} alt={project.name} className="h-full w-full object-cover" draggable={false} />
            )}
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-[clamp(28px,4vw,56px)] uppercase leading-none text-white mix-blend-difference">
                {project.name}
              </h1>
              <div className="label mt-2 text-white mix-blend-difference">{project.location}</div>
            </div>
          </section>

          {/* Info column */}
          <section className="flex h-full w-[clamp(220px,22vw,300px)] shrink-0 flex-col justify-center">
            <Meta label="Project" value={project.type} />
            <Meta label="Year" value={String(project.year)} />
            <Meta label="Location" value={project.location} />
            <Meta label="Studio" value="MA Studio & Partners" />
            <p className="meta mt-6 text-[14px] leading-relaxed">
              Scroll to move through the project — drag, use the wheel, or the arrow keys.
            </p>
          </section>

          {/* Remaining images, full height, natural aspect */}
          {images.slice(1).map((src, i) => (
            <section key={src} className="relative h-full shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${project.name} — ${i + 2}`} className="h-full w-auto object-cover" draggable={false} />
            </section>
          ))}

          {/* Next project */}
          {next && (
            <section className="flex h-full w-[60vw] shrink-0 items-center">
              <button
                onClick={(e) => {
                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  onNext?.(next, { left: r.left, top: r.top, width: r.width, height: r.height });
                }}
                className="group text-left"
              >
                <span className="label meta">Next project</span>
                <span className="block text-[clamp(28px,5vw,72px)] uppercase leading-none transition-colors group-hover:text-accent">
                  {next.name} →
                </span>
              </button>
            </section>
          )}
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
