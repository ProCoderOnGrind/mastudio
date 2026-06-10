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
}

interface RawProject {
  slug: string;
  name: string;
  type: string;
  year: number;
  location: string;
  images: string[];
}

export const PROJECTS: Project[] = (maData as { projects: RawProject[] }).projects.map((p) => ({
  slug: p.slug,
  name: p.name,
  type: p.type,
  year: p.year,
  location: p.location,
  category: categoryForType(p.type),
  images: p.images,
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
