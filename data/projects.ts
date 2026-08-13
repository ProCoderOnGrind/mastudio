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
  /** Hand-written meta description for this project. See `lib/projectSeo`. */
  seoDescription?: string;
  images: string[];    // local image paths under /public
  /** Alt text, index-parallel to `images`. See `lib/projectSeo`. */
  imageAlts?: string[];
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
  seoDescription?: string;
  images: string[];
  imageAlts?: string[];
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
  seoDescription: p.seoDescription,
  images: p.images,
  imageAlts: p.imageAlts,
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
