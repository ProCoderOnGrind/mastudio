import type { Metadata } from "next";
import ProjectList from "@/components/project/ProjectList";
import CategoryBar from "@/components/project/CategoryBar";
import ProjectListEditable from "@/components/tina/ProjectListEditable";
import IntroOverlay from "@/components/intro/IntroOverlay";
import { PROJECTS, projectsByCategory } from "@/data/projects";
import { isCategoryKey, categoryLabel } from "@/data/categories";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const HOME_DESCRIPTION =
  "MA Studio & Partners is an architecture studio in Tirana, Albania, working across architecture, urban planning, urban design, landscape and interior design. Established in 2020 as the continuation of DEA Studio (2000–2020).";

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
    : "Architecture Studio in Tirana, Albania";

  const description = active
    ? `${categoryLabel(active)} projects by MA Studio & Partners, an architecture and urban planning studio based in Tirana, Albania.`
    : HOME_DESCRIPTION;

  return {
    title,
    description,
    // The ?category= grid is a filtered view of the same collection.
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE_NAME}`,
      description,
      url: absoluteUrl("/"),
      siteName: SITE_NAME,
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
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
