import type { Project } from "@/data/projects";

export function findProject(projects: Project[], slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function filterByCategory(projects: Project[], cat: string): Project[] {
  return projects.filter((p) => p.category === cat);
}

export function getNextProject(projects: Project[], slug: string): Project | undefined {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) return undefined;
  return projects[(i + 1) % projects.length];
}
