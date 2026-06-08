import ProjectList from "./ProjectList";
import PageTitle from "@/components/PageTitle";
import { projectsByCategory } from "@/data/projects";
import { CATEGORIES } from "@/data/categories";

export default function CategoryView({ categoryKey }: { categoryKey: string }) {
  const cat = CATEGORIES.find((c) => c.key === categoryKey)!;
  return (
    <div>
      <PageTitle>{cat.label}</PageTitle>
      <ProjectList projects={projectsByCategory(categoryKey)} />
    </div>
  );
}
