import { notFound } from "next/navigation";
import { getProject, PROJECTS } from "@/data/projects";
import { CATEGORIES } from "@/data/categories";
import ProjectMeta from "@/components/project/ProjectMeta";
import Gallery from "@/components/project/Gallery";
import BlurImage from "@/components/media/BlurImage";
import CategoryView from "@/components/project/CategoryView";

export function generateStaticParams() {
  return [
    ...PROJECTS.map((p) => ({ slug: p.slug })),
    ...CATEGORIES.map((c) => ({ slug: c.key })),
  ];
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const isCategory = CATEGORIES.some((c) => c.key === slug);
  if (isCategory) return <CategoryView categoryKey={slug} />;

  const project = getProject(slug);
  if (!project) notFound();

  return (
    <article className="px-5 py-8">
      <div className="mb-6" data-cursor="arrow">
        <BlurImage seed={project.slug} ratio={project.ratio} />
      </div>
      <div className="grid gap-10 md:grid-cols-[260px_1fr]">
        <ProjectMeta project={project} />
        <div>
          <div className="mb-10 max-w-[60ch] space-y-4 text-[15px]">
            {project.description.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <Gallery seed={project.slug} ratios={project.gallery} />
        </div>
      </div>
    </article>
  );
}
