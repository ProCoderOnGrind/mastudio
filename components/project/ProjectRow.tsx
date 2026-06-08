"use client";
import { useRef } from "react";
import Reveal from "@/components/motion/Reveal";
import BlurImage from "@/components/media/BlurImage";
import { useViewer } from "@/components/viewer/ViewerContext";
import type { Project } from "@/data/projects";

export default function ProjectRow({ project, hero = false }: { project: Project; hero?: boolean }) {
  const { open } = useViewer();
  const imgWrap = useRef<HTMLDivElement>(null);

  const handleOpen = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    const r = imgWrap.current?.getBoundingClientRect();
    open(project, r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null);
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
            <span className="block text-[18px] leading-tight">{project.name}</span>
            <span className="label meta">{project.location}</span>
          </span>
        </div>
        <div ref={imgWrap} className="overflow-hidden">
          <div className="transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.02]">
            {hero ? (
              <BlurImage
                src={project.images[0]}
                label={project.name}
                ratio={null}
                priority
                className="h-[calc(100svh-180px)]"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            ) : (
              <BlurImage
                src={project.images[0]}
                label={project.name}
                ratio="16 / 9"
                className="max-h-[46vh]"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            )}
          </div>
        </div>
      </a>
    </Reveal>
  );
}
