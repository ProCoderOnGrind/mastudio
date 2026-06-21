"use client";
import { useTina } from "tinacms/dist/react";
import BlogList from "@/components/blog/BlogList";
import { isPostCategory, type Post, type PostCategoryKey } from "@/data/posts";

/**
 * Dev-only editable wrapper for the blog list. Subscribes to the local Tina
 * form via `useTina`, maps raw documents to `Post` objects, and renders
 * `BlogList` with per-row `editTarget` bindings so the visual click-to-edit
 * highlights light up. Never used in production.
 */
export default function BlogListEditable(props: {
  activeCategory: string | null;
  tina: { query: string; variables: object; data: any };
}) {
  const { data } = useTina(props.tina);
  const raws = (data.posts.posts as any[] | null | undefined)?.filter(Boolean) ?? [];
  const all: Post[] = raws
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      category: (isPostCategory(p.category) ? p.category : "news") as PostCategoryKey,
      excerpt: p.excerpt ?? "",
      source:
        p.source && p.source.label && p.source.url
          ? { label: p.source.label, url: p.source.url }
          : undefined,
      image: p.image || undefined,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const posts =
    props.activeCategory && isPostCategory(props.activeCategory)
      ? all.filter((p) => p.category === props.activeCategory)
      : all;

  const editTargets: Record<string, any> = {};
  for (const r of raws) editTargets[r.slug] = r;
  return <BlogList posts={posts} editTargets={editTargets} />;
}
