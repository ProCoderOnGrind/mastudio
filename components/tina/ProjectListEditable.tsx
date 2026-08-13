"use client";
import { useTina } from "tinacms/dist/react";
import ProjectList from "@/components/project/ProjectList";
import type { Project } from "@/data/projects";
import { categoryForType, isCategoryKey } from "@/data/categories";

/**
 * Dev-only editable wrapper for the home project list. Subscribes to the
 * local Tina form via `useTina`, maps all projects to `Project` objects, and
 * renders `ProjectList` with per-row `editTarget` bindings so the visual
 * click-to-edit highlights light up. Never used in production.
 */
export default function ProjectListEditable(props: {
  activeCategory: string | null;
  tina: { query: string; variables: object; data: any };
}) {
  const { data } = useTina(props.tina);
  const raws = (data.projects.projects as any[] | null | undefined)?.filter(Boolean) ?? [];
  const all: Project[] = raws.map((p) => ({
    slug: p.slug,
    name: p.name,
    type: p.type,
    year: p.year,
    location: p.location,
    category: categoryForType(p.type),
    seoDescription: p.seoDescription,
    images: (p.images ?? []).filter(Boolean),
    imageAlts: (p.imageAlts ?? []).filter(Boolean),
    description: p.description,
    client: p.client,
    status: p.status,
    size: p.size,
  }));
  const projects =
    props.activeCategory && isCategoryKey(props.activeCategory)
      ? all.filter((p) => p.category === props.activeCategory)
      : all;
  const editTargets: Record<string, any> = {};
  for (const r of raws) editTargets[r.slug] = r;
  return <ProjectList projects={projects} editTargets={editTargets} />;
}
