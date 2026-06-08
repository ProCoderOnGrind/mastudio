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
      <span className="mb-4 inline-block h-8 w-8 bg-black" aria-hidden />
      <h1 className="mb-1 text-[20px]">{project.name}</h1>
      <div className="label meta mb-6">{project.location}</div>
      <Field label="Year" value={String(project.year)} />
      <Field label="Client" value={project.client} />
      <Field label="Type" value={project.typology} />
      <Field label="Size" value={project.size} />
      <Field label="Status" value={project.status} />
    </aside>
  );
}
