"use client";
import Reveal from "@/components/motion/Reveal";
import BlurImage from "@/components/media/BlurImage";
import { useViewer } from "@/components/viewer/ViewerContext";
import { tinaField } from "tinacms/dist/react";
import type { Project } from "@/data/projects";

export default function ProjectRow({ project, hero = false, editTarget }: { project: Project; hero?: boolean; editTarget?: any }) {
  const { open } = useViewer();

  const handleOpen = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    open(project);
  };

  return (
    <Reveal>
      <a
        href={`/projects/${project.slug}`}
        onClick={handleOpen}
        className="group grid cursor-pointer grid-cols-1 gap-5 border-t border-hairline px-5 py-6 md:grid-cols-[14rem_1fr] md:items-center"
      >
        <div className="flex items-start gap-3">
          <span className="mt-1 inline-block h-6 w-6 shrink-0 bg-black" aria-hidden />
          <span>
            <span className="block text-[18px] leading-tight" data-tina-field={editTarget ? tinaField(editTarget, "name") : undefined}>{project.name}</span>
            <span className="label meta" data-tina-field={editTarget ? tinaField(editTarget, "location") : undefined}>{project.location}</span>
          </span>
        </div>
        <div className="overflow-hidden">
          <div className="transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.02]" data-tina-field={editTarget ? tinaField(editTarget, "images") : undefined}>
            <BlurImage
              src={project.images[0]}
              label={project.name}
              ratio={null}
              priority={hero}
              className="aspect-[16/10] md:aspect-auto md:h-[calc(100svh-220px)]"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        </div>
      </a>
    </Reveal>
  );
}
