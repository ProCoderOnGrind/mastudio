import maData from "@/content/projects.json";
import { categoryForType, type CategoryKey } from "@/data/categories";
import { findProject, filterByCategory, getNextProject } from "@/lib/projectHelpers";

export interface Project {
  slug: string;
  name: string;
  type: string;        // MA Studio project type, e.g. "Residence"
  year: number;
  location: string;
  category: CategoryKey;
  images: string[];    // local image paths under /public
  description?: unknown;   // Tina rich-text AST (rendered via TinaMarkdown later)
  client?: string;
  status?: string;
  size?: string;
}

interface RawProject {
  slug: string;
  name: string;
  type: string;
  year: number;
  location: string;
  images: string[];
  description?: unknown;   // Tina rich-text AST (rendered via TinaMarkdown later)
  client?: string;
  status?: string;
  size?: string;
}

export const PROJECTS: Project[] = (maData as { projects: RawProject[] }).projects.map((p) => ({
  slug: p.slug,
  name: p.name,
  type: p.type,
  year: p.year,
  location: p.location,
  category: categoryForType(p.type),
  images: p.images,
  description: p.description,
  client: p.client,
  status: p.status,
  size: p.size,
}));

export function getProject(slug: string): Project | undefined {
  return findProject(PROJECTS, slug);
}

export function projectsByCategory(cat: string): Project[] {
  return filterByCategory(PROJECTS, cat);
}

export function nextProject(slug: string): Project {
  return getNextProject(PROJECTS, slug)!; // PROJECTS is non-empty; preserves prior non-undefined return type
}
