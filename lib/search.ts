import { PROJECTS } from "@/data/projects";

export interface SearchResult {
  label: string;
  href: string;
  group: "Pages" | "Projects";
  sub?: string;
}

const PAGES: SearchResult[] = [
  { label: "Projects", href: "/", group: "Pages" },
  { label: "About", href: "/about", group: "Pages" },
  { label: "Contact", href: "/contact", group: "Pages" },
];

export function searchAll(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return PAGES;
  const pages = PAGES.filter((p) => p.label.toLowerCase().includes(q));
  const projects: SearchResult[] = PROJECTS.filter(
    (p) => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
  ).map((p) => ({ label: p.name, href: `/projects/${p.slug}`, group: "Projects", sub: p.location }));
  return [...pages, ...projects];
}
