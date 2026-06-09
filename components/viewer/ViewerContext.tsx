"use client";
import { createContext, useCallback, useContext, useState } from "react";
import type { Project } from "@/data/projects";

interface ViewerState {
  project: Project | null;
  open: (project: Project) => void;
  close: () => void;
}

const ViewerCtx = createContext<ViewerState | null>(null);

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);

  const open = useCallback((p: Project) => {
    setProject(p);
    if (typeof window !== "undefined") {
      window.history.pushState({ viewer: p.slug }, "", `/projects/${p.slug}`);
    }
  }, []);

  const close = useCallback(() => setProject(null), []);

  return <ViewerCtx.Provider value={{ project, open, close }}>{children}</ViewerCtx.Provider>;
}

export function useViewer() {
  const ctx = useContext(ViewerCtx);
  if (!ctx) throw new Error("useViewer must be used within ViewerProvider");
  return ctx;
}
