"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useViewer, type OriginRect } from "./ViewerContext";
import { useCallbackRef } from "./useCallbackRef";
import ProjectStrip from "./ProjectStrip";
import { nextProject, type Project } from "@/data/projects";

const DURATION = 1800;
// strong ease-out (easeOutQuint): quick to start, then glides slowly into place
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function ProjectViewer() {
  const { project, rect, open, close } = useViewer();
  const stage = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);

  // FLIP zoom-in: the clicked card grows to fullscreen over a solid backdrop.
  useLayoutEffect(() => {
    const el = stage.current;
    const back = bg.current;
    if (!el || !back || !project || !rect) return;
    const sx = rect.width / window.innerWidth;
    const sy = rect.height / window.innerHeight;
    back.style.transition = "none";
    back.style.opacity = "1"; // solid white while open
    el.style.transformOrigin = "top left";
    el.style.transition = "none";
    el.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(${sx}, ${sy})`;
    el.style.opacity = "0.5";
    const id = requestAnimationFrame(() => {
      el.style.transition = `transform ${DURATION}ms ${EASE}, opacity ${DURATION / 2}ms ${EASE}`;
      el.style.transform = "none";
      el.style.opacity = "1";
    });
    return () => cancelAnimationFrame(id);
  }, [project, rect]);

  // Close = reverse of open: the photo shrinks back to the card while the
  // white backdrop fades out, revealing the homepage behind it.
  const doClose = useCallbackRef(() => {
    const el = stage.current;
    const back = bg.current;
    if (!el || !back || !rect) {
      close();
      return;
    }
    const sx = rect.width / window.innerWidth;
    const sy = rect.height / window.innerHeight;
    el.style.transition = `transform ${DURATION}ms ${EASE}`;
    el.style.transformOrigin = "top left";
    el.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(${sx}, ${sy})`;
    back.style.transition = `opacity ${DURATION}ms ${EASE}`;
    back.style.opacity = "0";
    window.setTimeout(() => {
      close();
      if (window.history.state?.viewer) window.history.back();
    }, DURATION);
  });

  // Esc + browser back close the viewer; lock body scroll while open.
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

  // Going to the next project zooms it in from the clicked "Next" link.
  const goNext = (p: Project, fromRect?: OriginRect) => {
    const fallback = {
      left: window.innerWidth / 2 - 40,
      top: window.innerHeight / 2 - 40,
      width: 80,
      height: 80,
    };
    open(p, fromRect ?? fallback);
  };

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal>
      <div ref={bg} className="absolute inset-0 bg-white" />
      <div ref={stage} className="relative h-full w-full will-change-transform">
        <div className="flex items-center justify-between px-5 py-4 md:px-10">
          <span className="label">{project.name}</span>
          <button onClick={doClose} aria-label="Close" className="label hover:text-accent transition-colors">
            Close ✕
          </button>
        </div>
        <div className="h-[calc(100%-56px)]">
          <ProjectStrip project={project} next={nextProject(project.slug)} onNext={goNext} />
        </div>
      </div>
    </div>
  );
}
