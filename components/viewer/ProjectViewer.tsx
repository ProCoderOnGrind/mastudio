"use client";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useViewer } from "./ViewerContext";
import ProjectStrip from "./ProjectStrip";
import { nextProject } from "@/data/projects";

const CLOSE_MS = 900; // fade + slight scale-down, reveals homepage
const OPEN_MS = 900; // open is the close reversed: fade + scale-up from 0.96
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"; // easeOutQuint

export default function ProjectViewer() {
  const { project, open, close } = useViewer();
  const stage = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const prevSlug = useRef<string | null>(null);
  const busy = useRef(false);

  // OPEN: fade backdrop in + scale-up the stage (appear). On a project change
  // while open (Next), crossfade the stage back in (goNext faded it out first).
  useLayoutEffect(() => {
    if (!project) {
      prevSlug.current = null;
      return;
    }
    busy.current = false;
    const b = bg.current;
    const s = stage.current;
    const firstOpen = prevSlug.current === null;
    prevSlug.current = project.slug;
    if (!s) return;

    if (firstOpen) {
      if (b) {
        b.style.transition = "none";
        b.style.opacity = "0";
      }
      s.style.transition = "none";
      s.style.opacity = "0";
      s.style.transformOrigin = "center";
      s.style.transform = "scale(0.96)";
      const id = requestAnimationFrame(() => {
        if (b) {
          b.style.transition = `opacity ${OPEN_MS}ms ${EASE}`;
          b.style.opacity = "1";
        }
        s.style.transition = `opacity ${OPEN_MS}ms ${EASE}, transform ${OPEN_MS}ms ${EASE}`;
        s.style.opacity = "1";
        s.style.transform = "scale(1)";
      });
      return () => cancelAnimationFrame(id);
    } else {
      // crossfade-in (the outgoing stage was faded to 0 by goNext)
      s.style.transition = "none";
      s.style.opacity = "0";
      s.style.transform = "none";
      const id = requestAnimationFrame(() => {
        s.style.transition = `opacity 280ms ${EASE}`;
        s.style.opacity = "1";
      });
      return () => cancelAnimationFrame(id);
    }
  }, [project]);

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

  const goNext = useCallback(() => {
    const s = stage.current;
    if (!s || !project) return;
    const next = nextProject(project.slug);
    s.style.transition = `opacity 200ms ${EASE}`;
    s.style.opacity = "0";
    window.setTimeout(() => open(next), 210);
  }, [open, project]);

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
      <div ref={stage} data-testid="viewer-stage" className="relative z-[2] flex h-full flex-col will-change-[transform,opacity]">
        <div className="flex items-center justify-between px-5 py-4 md:px-10">
          <span className="label">{project.name}</span>
          <button onClick={doClose} aria-label="Close" className="label transition-colors hover:text-accent">
            Close ✕
          </button>
        </div>
        <div className="h-[calc(100%-56px)]">
          <ProjectStrip project={project} onNext={goNext} />
        </div>
      </div>
    </div>
  );
}
