import { PROJECTS } from "@/data/projects";

export type NewsCategory = "news" | "events" | "awards" | "lectures";
export interface NewsItem {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  category: NewsCategory;
  ratio: string;
}

const VERBS = ["UNVEILS","COMPLETES","WINS","BREAKS GROUND ON","REVEALS","TOPS OUT","OPENS","ANNOUNCES"];
const CATS: NewsCategory[] = ["news","events","awards","lectures"];

export const NEWS: NewsItem[] = PROJECTS.flatMap((p, i) => {
  const day = String(((i * 3) % 27) + 1).padStart(2, "0");
  const month = String((i % 12) + 1).padStart(2, "0");
  return [{
    id: `${p.slug}-news`,
    date: `${day}.${month}.2026`,
    title: `BIG ${VERBS[i % VERBS.length]} ${p.name.toUpperCase()} IN ${p.location.split(",").pop()!.trim().toUpperCase()}`,
    excerpt:
      "A milestone for the project as the design moves into its next phase. " +
      "The announcement was shared with collaborators, partners, and the local community.",
    category: CATS[i % CATS.length],
    ratio: i % 2 ? "3 / 2" : "16 / 9",
  }];
});

export function newsByCategory(cat: NewsCategory | "all"): NewsItem[] {
  return cat === "all" ? NEWS : NEWS.filter((n) => n.category === cat);
}
