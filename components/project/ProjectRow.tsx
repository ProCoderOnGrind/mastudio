"use client";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";
import BlurImage from "@/components/media/BlurImage";
import { useViewer } from "@/components/viewer/ViewerContext";
import { projectImageAlt } from "@/lib/projectSeo";
import { tinaField } from "tinacms/dist/react";
import type { Project } from "@/data/projects";

const EASE = "cubic-bezier(.4,0,.2,1)";

export default function ProjectRow({ project, hero = false, editTarget }: { project: Project; hero?: boolean; editTarget?: any }) {
  const { open } = useViewer();
  // Same scroll-in trigger as before; only the reveal *style* changes to a
  // curtain wipe. Each row plays its own choreography when it enters view.
  const { ref, shown } = useScrollReveal<HTMLAnchorElement>();

  const handleOpen = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    open(project);
  };

  return (
    <a
      ref={ref}
      href={`/projects/${project.slug}`}
      onClick={handleOpen}
      className="group grid cursor-pointer grid-cols-1 gap-5 border-t border-hairline px-5 py-6 md:grid-cols-[14rem_1fr] md:items-center"
    >
      <div className="flex items-start gap-3">
        {/* index square draws in */}
        <span
          className="mt-1 inline-block h-6 w-6 shrink-0 bg-black"
          aria-hidden
          style={{
            transform: shown ? "scale(1)" : "scale(0)",
            transition: `transform .45s ${EASE} .1s`,
          }}
        />
        <span>
          {/* name: line-mask reveal */}
          <span className="block overflow-hidden">
            <span
              className="block text-[18px] leading-tight"
              data-tina-field={editTarget ? tinaField(editTarget, "name") : undefined}
              style={{
                transform: shown ? "translateY(0)" : "translateY(110%)",
                transition: `transform .65s ${EASE} .2s`,
              }}
            >
              {project.name}
            </span>
          </span>
          {/* location: line-mask reveal */}
          <span className="block overflow-hidden">
            <span
              className="label meta block"
              data-tina-field={editTarget ? tinaField(editTarget, "location") : undefined}
              style={{
                transform: shown ? "translateY(0)" : "translateY(130%)",
                transition: `transform .65s ${EASE} .32s`,
              }}
            >
              {project.location}
            </span>
          </span>
        </span>
      </div>
      {/* The intro's masterplan re-tiles into this exact rectangle on its way
          out (components/intro/IntroOverlay.tsx), so the hero photo needs a
          stable handle that does not depend on class names. */}
      <div className="overflow-hidden" data-hero-shot={hero ? "" : undefined}>
        {/* curtain wipe: clip-path sweeps the image open left-to-right */}
        <div
          style={{
            clipPath: shown ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
            transition: `clip-path .9s ${EASE}`,
          }}
        >
          <div className="transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.02]" data-tina-field={editTarget ? tinaField(editTarget, "images") : undefined}>
            <BlurImage
              src={project.images[0]}
              label={project.name}
              alt={projectImageAlt(project, 0)}
              ratio={null}
              priority={hero}
              // The offset is the header + filter row + this row's own frame
              // (see --row-image-offset in globals.css), so the first photo
              // fills the viewport exactly and needs no scrolling to be seen.
              className="aspect-[16/10] md:aspect-auto md:h-[calc(100svh-var(--row-image-offset))]"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        </div>
      </div>
    </a>
  );
}
