import type { Metadata } from "next";
import ProjectList from "@/components/project/ProjectList";
import CategoryBar from "@/components/project/CategoryBar";
import ProjectListEditable from "@/components/tina/ProjectListEditable";
import IntroOverlay from "@/components/intro/IntroOverlay";
import { PROJECTS, projectsByCategory } from "@/data/projects";
import { isCategoryKey, categoryLabel } from "@/data/categories";
import { pageMetadata } from "@/lib/seo";

// Kept under ~155 characters so Google shows it whole instead of writing its own.
const HOME_DESCRIPTION =
  "MA Studio & Partners is an architecture studio in Tirana, Albania: architecture, urban planning, landscape and interior design, continuing DEA Studio since 2000.";

/**
 * The homepage carried no metadata of its own, so it fell back to the bare
 * studio name — a title with no service or location terms at all, which is
 * exactly what non-brand searches ("architecture studio in Tirana") match on.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  const active = category && isCategoryKey(category) ? category : null;

  const title = active
    ? `${categoryLabel(active)} Projects — Architecture Studio in Tirana`
    : "Architecture Studio in Tirana";

  const description = active
    ? `${categoryLabel(active)} projects by MA Studio & Partners, an architecture and urban planning studio based in Tirana, Albania.`
    : HOME_DESCRIPTION;

  // The ?category= grid is a filtered view of the same collection, so it
  // canonicalises onto "/" (the dedicated /projects/<category> pages are the
  // indexable versions).
  return pageMetadata({ title, description, path: "/" });
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category && isCategoryKey(category) ? category : null;

  let list;
  if (process.env.NODE_ENV === "development") {
    const { client } = await import("@/tina/__generated__/client");
    const res = await client.queries.projects({ relativePath: "projects.json" });
    list = (
      <ProjectListEditable
        activeCategory={active}
        tina={{ query: res.query, variables: res.variables, data: res.data }}
      />
    );
  } else {
    const projects = active ? projectsByCategory(active) : PROJECTS;
    list = <ProjectList projects={projects} />;
  }

  return (
    <div>
      <IntroOverlay />
      {/* The design opens straight on the project grid, so the page's one h1 is
          carried for crawlers and screen readers without altering the layout. */}
      <h1 className="sr-only">
        {active
          ? `${categoryLabel(active)} projects — MA Studio & Partners, architecture studio in Tirana, Albania`
          : "MA Studio & Partners — architecture, urban planning, landscape and interior design studio in Tirana, Albania"}
      </h1>
      <CategoryBar active={active} />
      {list}
    </div>
  );
}
