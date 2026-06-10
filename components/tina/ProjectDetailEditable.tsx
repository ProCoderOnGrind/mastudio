"use client";
import { useTina } from "tinacms/dist/react";
import ProjectPageView from "@/components/viewer/ProjectPageView";
import type { Project } from "@/data/projects";
import { categoryForType } from "@/data/categories";

/**
 * Dev-only editable wrapper for the project detail page. Subscribes to the
 * local Tina form via `useTina`, finds the matching list item by slug, maps it
 * to a `Project`, and renders the standard view with `editTarget` so the visual
 * click-to-edit bindings (`tinaField`) light up. Never used in production.
 */
export default function ProjectDetailEditable(props: {
  slug: string;
  tina: { query: string; variables: object; data: any };
}) {
  const { data } = useTina(props.tina);
  const raw = (data.projects.projects as any[] | null | undefined)?.find(
    (p) => p?.slug === props.slug
  );
  if (!raw) return null;
  const project: Project = {
    slug: raw.slug,
    name: raw.name,
    type: raw.type,
    year: raw.year,
    location: raw.location,
    category: categoryForType(raw.type),
    images: (raw.images ?? []).filter(Boolean),
    description: raw.description,
    client: raw.client,
    status: raw.status,
    size: raw.size,
  };
  return <ProjectPageView project={project} editTarget={raw} />;
}
