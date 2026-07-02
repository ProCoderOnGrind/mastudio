import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, PROJECTS } from "@/data/projects";
import { CATEGORIES } from "@/data/categories";
import CategoryView from "@/components/project/CategoryView";
import ProjectPageView from "@/components/viewer/ProjectPageView";
import ProjectDetailEditable from "@/components/tina/ProjectDetailEditable";

export function generateStaticParams() {
  return [
    ...PROJECTS.map((p) => ({ slug: p.slug })),
    ...CATEGORIES.map((c) => ({ slug: c.key })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.key === slug);
  if (category) {
    return { title: `${category.label} | MA STUDIO & PARTNERS` };
  }
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.name} | MA STUDIO & PARTNERS`,
    description: `${project.name} — ${project.type}, ${project.location} (${project.year}). A project by MA Studio & Partners.`,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const isCategory = CATEGORIES.some((c) => c.key === slug);
  if (isCategory) return <CategoryView categoryKey={slug} />;

  const project = getProject(slug);
  if (!project) notFound();

  // Dev only: fetch via the local Tina GraphQL server and render the editable
  // wrapper for visual click-to-edit. The dynamic import keeps the Tina network
  // client out of the production build (where the local server isn't running).
  if (process.env.NODE_ENV === "development") {
    const { client } = await import("@/tina/__generated__/client");
    const res = await client.queries.projects({ relativePath: "projects.json" });
    return (
      <ProjectDetailEditable
        slug={slug}
        tina={{ query: res.query, variables: res.variables, data: res.data }}
      />
    );
  }

  return <ProjectPageView project={project} />;
}
