"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useViewer } from "./ViewerContext";
import { useCallbackRef } from "./useCallbackRef";
import ProjectStrip from "./ProjectStrip";

const OPEN_MS = 1800; // open zoom from the card
const CLOSE_MS = 900; // close: gentle fade + slight scale-down, reveals homepage
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"; // easeOutQuint — glides into place

export default function ProjectViewer() {
  const { project, rect, close } = useViewer();
  const stage = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  // OPEN: the clicked card grows to fullscreen over a solid backdrop.
  useLayoutEffect(() => {
    const el = stage.current;
    const back = bg.current;
    if (!el || !back || !project || !rect) return;
    busy.current = false;
    back.style.transition = "none";
    back.style.opacity = "1";
    el.style.opacity = "1";
    const sx = rect.width / window.innerWidth;
    const sy = rect.height / window.innerHeight;
    el.style.transformOrigin = "top left";
    el.style.transition = "none";
    el.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(${sx}, ${sy})`;
    el.style.opacity = "0.5";
    const id = requestAnimationFrame(() => {
      el.style.transition = `transform ${OPEN_MS}ms ${EASE}, opacity ${OPEN_MS / 2}ms ${EASE}`;
      el.style.transform = "none";
      el.style.opacity = "1";
    });
    return () => cancelAnimationFrame(id);
  }, [project, rect]);

  const finish = useCallbackRef(() => {
    close();
    if (typeof window !== "undefined" && window.history.state?.viewer) window.history.back();
  });

  // CLOSE: gentle fade + slight scale-down while the white backdrop fades out,
  // revealing the homepage behind. Same behaviour for every project.
  const doClose = useCallbackRef(() => {
    if (busy.current) return;
    busy.current = true;
    const el = stage.current;
    const back = bg.current;
    if (!el || !back) {
      finish();
      return;
    }
    el.style.transition = `opacity ${CLOSE_MS}ms ${EASE}, transform ${CLOSE_MS}ms ${EASE}`;
    el.style.transformOrigin = "center";
    el.style.transform = "scale(0.96)";
    el.style.opacity = "0";
    back.style.transition = `opacity ${CLOSE_MS}ms ease`;
    back.style.opacity = "0";
    window.setTimeout(finish, CLOSE_MS + 50);
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
          <ProjectStrip project={project} />
        </div>
      </div>
    </div>
  );
}
