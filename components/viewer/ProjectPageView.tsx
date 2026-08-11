"use client";
import Link from "next/link";
import { tinaField } from "tinacms/dist/react";
import ProjectStrip from "./ProjectStrip";
import type { Project } from "@/data/projects";

/** Full-page horizontal project view used for direct loads of /projects/[slug]. */
export default function ProjectPageView({
  project,
  editTarget,
}: {
  project: Project;
  /** Raw Tina list item for click-to-edit (dev only); undefined in production. */
  editTarget?: any;
}) {
  return (
    // z-200 matches the in-app viewer. At z-60 this sat *under* the sticky
    // header, which covered its own title bar and the Close control with it.
    <div className="fixed inset-0 z-[200] flex flex-col bg-white">
      <div className="flex items-center justify-between px-5 py-4 md:px-10">
        <span
          className="label"
          data-tina-field={editTarget ? tinaField(editTarget, "name") : undefined}
        >
          {project.name}
        </span>
        <Link href="/" className="label hover:text-accent transition-colors">Close ✕</Link>
      </div>
      <div className="h-[calc(100%-56px)]">
        <ProjectStrip project={project} editTarget={editTarget} />
      </div>
    </div>
  );
}
