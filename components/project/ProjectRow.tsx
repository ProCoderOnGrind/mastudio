import Link from "next/link";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";
import type { Project } from "@/data/projects";

export default function ProjectRow({ project }: { project: Project }) {
  return (
    <Reveal>
      <Link href={`/projects/${project.slug}`}
        className="group grid grid-cols-1 gap-3 border-t border-hairline px-5 py-6 md:grid-cols-[1fr_2fr] md:items-center">
        <div className="flex items-start gap-3">
          <span className="mt-1 inline-block h-6 w-6 shrink-0 bg-black" aria-hidden />
          <span>
            <span className="block text-[18px] leading-tight">{project.name}</span>
            <span className="label meta">{project.location}</span>
          </span>
        </div>
        <div className="overflow-hidden">
          <div className="transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.03]">
            <BlurImage
              src={project.images[0]}
              label={project.name}
              ratio="16 / 9"
              className="max-h-[46vh]"
            />
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
