import type { Project } from "@/data/projects";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <div className="label meta">{label}</div>
      <div className="label">{value}</div>
    </div>
  );
}

export default function ProjectMeta({ project }: { project: Project }) {
  return (
    <aside className="md:sticky md:top-24 md:self-start">
      <h1 className="mb-1 text-[20px] uppercase">{project.name}</h1>
      <div className="label meta mb-6">{project.location}</div>
      <Field label="Project" value={project.type} />
      <Field label="Year" value={String(project.year)} />
      <Field label="Location" value={project.location} />
      <Field label="Studio" value="MA Studio & Partners" />
    </aside>
  );
}
