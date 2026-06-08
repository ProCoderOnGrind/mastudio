"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useViewer } from "./ViewerContext";
import { useCallbackRef } from "./useCallbackRef";
import ProjectStrip from "./ProjectStrip";
import { nextProject, type Project } from "@/data/projects";

const DURATION = 600;
const EASE = "cubic-bezier(.4,0,.2,1)";

export default function ProjectViewer() {
  const { project, rect, open, close } = useViewer();
  const stage = useRef<HTMLDivElement>(null);

  // FLIP zoom-in from the clicked card rect to fullscreen.
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el || !project || !rect) return;
    const sx = rect.width / window.innerWidth;
    const sy = rect.height / window.innerHeight;
    el.style.transformOrigin = "top left";
    el.style.transition = "none";
    el.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(${sx}, ${sy})`;
    el.style.opacity = "0.4";
    const id = requestAnimationFrame(() => {
      el.style.transition = `transform ${DURATION}ms ${EASE}, opacity ${DURATION / 2}ms ${EASE}`;
      el.style.transform = "none";
      el.style.opacity = "1";
    });
    return () => cancelAnimationFrame(id);
  }, [project, rect]);

  const doClose = useCallbackRef(() => {
    const el = stage.current;
    if (!el || !rect) {
      close();
      return;
    }
    const sx = rect.width / window.innerWidth;
    const sy = rect.height / window.innerHeight;
    el.style.transition = `transform ${DURATION}ms ${EASE}, opacity ${DURATION}ms ${EASE}`;
    el.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(${sx}, ${sy})`;
    el.style.opacity = "0";
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

  const goNext = (p: Project) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    open(p, { left: vw / 2 - 40, top: vh / 2 - 40, width: 80, height: 80 });
  };

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-white" aria-modal role="dialog">
      <div ref={stage} className="h-full w-full will-change-transform">
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
