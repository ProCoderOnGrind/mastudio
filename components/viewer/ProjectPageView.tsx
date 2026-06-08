"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProjectStrip from "./ProjectStrip";
import type { Project } from "@/data/projects";

/** Full-page horizontal project view used for direct loads of /projects/[slug]. */
export default function ProjectPageView({ project, next }: { project: Project; next: Project }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      <div className="flex items-center justify-between px-5 py-4 md:px-10">
        <span className="label">{project.name}</span>
        <Link href="/" className="label hover:text-accent transition-colors">Close ✕</Link>
      </div>
      <div className="h-[calc(100%-56px)]">
        <ProjectStrip
          project={project}
          next={next}
          onNext={(p) => router.push(`/projects/${p.slug}`)}
        />
      </div>
    </div>
  );
}
