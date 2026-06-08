import { notFound } from "next/navigation";
import { getProject, PROJECTS, nextProject } from "@/data/projects";
import { CATEGORIES } from "@/data/categories";
import CategoryView from "@/components/project/CategoryView";
import ProjectPageView from "@/components/viewer/ProjectPageView";

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

  return <ProjectPageView project={project} next={next} />;
}
