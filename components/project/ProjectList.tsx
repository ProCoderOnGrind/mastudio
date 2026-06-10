import ProjectRow from "./ProjectRow";
import type { Project } from "@/data/projects";

export default function ProjectList({ projects, editTargets }: { projects: Project[]; editTargets?: Record<string, any> }) {
  return (
    <div className="flex flex-col">
      {projects.map((p, i) => (
        <ProjectRow key={p.slug} project={p} hero={i === 0} editTarget={editTargets?.[p.slug]} />
      ))}
    </div>
  );
}
