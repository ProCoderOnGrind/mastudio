"use client";
import { createContext, useCallback, useContext, useState } from "react";
import type { Project } from "@/data/projects";

export interface OriginRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface ViewerState {
  project: Project | null;
  rect: OriginRect | null;
  open: (project: Project, rect: OriginRect | null) => void;
  close: () => void;
}

const ViewerCtx = createContext<ViewerState | null>(null);

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const [rect, setRect] = useState<OriginRect | null>(null);

  const open = useCallback((p: Project, r: OriginRect | null) => {
    setRect(r);
    setProject(p);
    if (typeof window !== "undefined") {
      window.history.pushState({ viewer: p.slug }, "", `/projects/${p.slug}`);
    }
  }, []);

  const close = useCallback(() => setProject(null), []);

  return (
    <ViewerCtx.Provider value={{ project, rect, open, close }}>{children}</ViewerCtx.Provider>
  );
}

export function useViewer() {
  const ctx = useContext(ViewerCtx);
  if (!ctx) throw new Error("useViewer must be used within ViewerProvider");
  return ctx;
}
