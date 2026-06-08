import Link from "next/link";
import ProjectList from "@/components/project/ProjectList";
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
  const projects = active ? projectsByCategory(active) : PROJECTS;

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
      <ProjectList projects={projects} />
    </div>
  );
}
