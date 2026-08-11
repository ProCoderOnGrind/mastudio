import type { MetadataRoute } from "next";
import { PROJECTS } from "@/data/projects";
import { CATEGORIES } from "@/data/categories";
import { POSTS, postsWithPages } from "@/data/posts";
import { absoluteUrl } from "@/lib/site";

/**
 * Generated sitemap covering every public route: the marketing pages, each
 * project category, each project, and the blog.
 *
 * The `/blog?category=…` filters are deliberately absent — they are the same
 * document with a subset of rows, and the blog page points its canonical at
 * `/blog`, so listing them would only invite duplicate-content dilution. The
 * internal design-lab / motion-lab / demo routes are likewise excluded and are
 * blocked in robots.txt.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const newestPost = POSTS[0]?.date;

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.8 },
    { url: absoluteUrl("/cofounders"), changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/book"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/services"), changeFrequency: "monthly", priority: 0.9 },
    {
      url: absoluteUrl("/blog"),
      changeFrequency: "weekly",
      priority: 0.9,
      lastModified: newestPost ? new Date(newestPost) : undefined,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: absoluteUrl(`/projects/${c.key}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const projectPages: MetadataRoute.Sitemap = PROJECTS.map((p) => ({
    url: absoluteUrl(`/projects/${p.slug}`),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  // Only posts that actually have a page — see `hasPostPage`. Listing a URL
  // that 404s is a crawl error, so this stays in step with the route.
  const postPages: MetadataRoute.Sitemap = postsWithPages().map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    changeFrequency: "yearly",
    priority: 0.6,
    lastModified: new Date(p.date),
  }));

  return [...staticPages, ...categoryPages, ...projectPages, ...postPages];
}
