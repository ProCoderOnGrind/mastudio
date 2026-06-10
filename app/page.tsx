import Link from "next/link";
import ProjectList from "@/components/project/ProjectList";
import ProjectListEditable from "@/components/tina/ProjectListEditable";
import IntroOverlay from "@/components/intro/IntroOverlay";
import { PROJECTS, projectsByCategory } from "@/data/projects";
import { isCategoryKey, categoryLabel } from "@/data/categories";

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
    <div className="pt-4">
      <IntroOverlay />
      {active && (
        <div className="px-5 pb-2">
          <Link
            href="/"
            className="label inline-flex items-center gap-2 border border-hairline px-3 py-1.5 transition-colors hover:bg-black hover:text-white"
          >
            {categoryLabel(active)} <span aria-hidden>✕</span>
          </Link>
        </div>
      )}
      {list}
    </div>
  );
}
