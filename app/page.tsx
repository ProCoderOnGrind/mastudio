import ProjectList from "@/components/project/ProjectList";
import { PROJECTS } from "@/data/projects";

export default function Home() {
  return (
    <div className="pt-4">
      <ProjectList projects={PROJECTS} />
    </div>
  );
}
