import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, PROJECTS } from "@/data/projects";
import { CATEGORIES, categoryLabel } from "@/data/categories";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
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
    const title = `${category.label} Architecture Projects in Albania`;
    const description = `${category.label} projects by MA Studio & Partners — an architecture, urban planning and interior design studio based in Tirana, Albania.`;
    return {
      title,
      description,
      alternates: { canonical: `/projects/${category.key}` },
      openGraph: {
        title: `${title} | ${SITE_NAME}`,
        description,
        url: absoluteUrl(`/projects/${category.key}`),
      },
    };
  }
  const project = getProject(slug);
  if (!project) return {};
  const description = `${project.name} — ${project.type} in ${project.location} (${project.year}), designed by MA Studio & Partners, architecture studio in Tirana, Albania.`;
  return {
    title: `${project.name} — ${project.type} in ${project.location}`,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${project.name} | ${SITE_NAME}`,
      description,
      url: absoluteUrl(`/projects/${project.slug}`),
    },
  };
}

/** Breadcrumb trail, so results show the category path rather than a bare URL. */
function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const isCategory = CATEGORIES.some((c) => c.key === slug);
  if (isCategory) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              breadcrumbSchema([
                { name: "Projects", path: "/" },
                { name: categoryLabel(slug as never), path: `/projects/${slug}` },
              ]),
            ),
          }}
        />
        <CategoryView categoryKey={slug} />
      </>
    );
  }

  const project = getProject(slug);
  if (!project) notFound();

  const categoryKey = project.category;
  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    about: project.type,
    locationCreated: { "@type": "Place", name: project.location },
    dateCreated: String(project.year),
    creator: { "@id": absoluteUrl("/#organization") },
    url: absoluteUrl(`/projects/${project.slug}`),
    ...(project.images?.[0] ? { image: absoluteUrl(project.images[0]) } : {}),
  };

  const schema = [
    breadcrumbSchema([
      { name: "Projects", path: "/" },
      { name: categoryLabel(categoryKey), path: `/projects/${categoryKey}` },
      { name: project.name, path: `/projects/${project.slug}` },
    ]),
    projectSchema,
  ];

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ProjectPageView project={project} />
    </>
  );
}
