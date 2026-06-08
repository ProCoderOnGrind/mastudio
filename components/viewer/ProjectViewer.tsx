"use client";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useViewer } from "./ViewerContext";
import ProjectStrip from "./ProjectStrip";

const OPEN_MS = 1000; // hero image morph (card -> fullscreen)
const CLOSE_MS = 900; // fade + slight scale-down, reveals homepage
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"; // easeOutQuint — glides into place

export default function ProjectViewer() {
  const { project, rect, close } = useViewer();
  const stage = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLImageElement>(null);
  const busy = useRef(false);

  // OPEN: FLIP only the hero image from the clicked card rect to fullscreen,
  // while the white backdrop + content fade in.
  useLayoutEffect(() => {
    if (!project) return;
    busy.current = false;
    const b = bg.current;
    const s = stage.current;
    const h = hero.current;
    if (b) {
      b.style.transition = "none";
      b.style.opacity = "0";
    }
    if (s) {
      s.style.transition = "none";
      s.style.opacity = "0";
      s.style.transform = "none";
    }
    if (h && rect) {
      const t = h.getBoundingClientRect();
      const sx = rect.width / t.width;
      const sy = rect.height / t.height;
      const dx = rect.left - t.left;
      const dy = rect.top - t.top;
      h.style.transformOrigin = "top left";
      h.style.transition = "none";
      h.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    }
    const id = requestAnimationFrame(() => {
      if (b) {
        b.style.transition = `opacity 400ms ${EASE}`;
        b.style.opacity = "1";
      }
      if (s) {
        s.style.transition = `opacity 450ms ${EASE}`;
        s.style.opacity = "1";
      }
      if (h) {
        h.style.transition = `transform ${OPEN_MS}ms ${EASE}`;
        h.style.transform = "none";
      }
    });
    return () => cancelAnimationFrame(id);
  }, [project, rect]);

  const finish = useCallback(() => {
    close();
    if (typeof window !== "undefined" && window.history.state?.viewer) window.history.back();
  }, [close]);

  const doClose = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    const b = bg.current;
    const s = stage.current;
    if (!b || !s) {
      finish();
      return;
    }
    s.style.transition = `opacity ${CLOSE_MS}ms ${EASE}, transform ${CLOSE_MS}ms ${EASE}`;
    s.style.transformOrigin = "center";
    s.style.transform = "scale(0.96)";
    s.style.opacity = "0";
    b.style.transition = `opacity ${CLOSE_MS}ms ${EASE}`;
    b.style.opacity = "0";
    window.setTimeout(finish, CLOSE_MS + 60);
  }, [finish]);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") doClose();
    };
    const onPop = () => close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
      document.body.style.overflow = "";
    };
  }, [project, close, doClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal>
      <div ref={bg} className="absolute inset-0 z-[1] bg-white" />
      <div ref={stage} className="relative z-[2] flex h-full flex-col will-change-[transform,opacity]">
        <div className="flex items-center justify-between px-5 py-4 md:px-10">
          <span className="label">{project.name}</span>
          <button onClick={doClose} aria-label="Close" className="label transition-colors hover:text-accent">
            Close ✕
          </button>
        </div>
        <div className="h-[calc(100%-56px)]">
          <ProjectStrip project={project} heroRef={hero} />
        </div>
      </div>
    </div>
  );
}
