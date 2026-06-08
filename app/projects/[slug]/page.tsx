import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, PROJECTS, nextProject } from "@/data/projects";
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

  const next = nextProject(project.slug);
  const gallery = project.images.slice(1);

  return (
    <article className="px-5 py-8">
      <div className="mb-6" data-cursor="arrow">
        <BlurImage
          src={project.images[0]}
          label={project.name}
          ratio="16 / 9"
          priority
          className="max-h-[82vh]"
          sizes="100vw"
        />
      </div>
      <div className="grid gap-10 md:grid-cols-[260px_1fr]">
        <ProjectMeta project={project} />
        <div>
          {gallery.length > 0 ? (
            <Gallery images={gallery} name={project.name} />
          ) : (
            <p className="meta text-[15px]">More imagery coming soon.</p>
          )}
        </div>
      </div>

      <Link
        href={`/projects/${next.slug}`}
        className="mt-20 flex items-center justify-between border-t border-hairline pt-6 group"
      >
        <span className="label meta">Next project</span>
        <span className="text-[clamp(24px,5vw,56px)] uppercase transition-colors group-hover:text-accent">
          {next.name} →
        </span>
      </Link>
    </article>
  );
}
