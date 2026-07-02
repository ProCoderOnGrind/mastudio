import Link from "next/link";
import type { Metadata } from "next";
import BlogList from "@/components/blog/BlogList";
import {
  POSTS,
  POST_CATEGORIES,
  postsByCategory,
  isPostCategory,
} from "@/data/posts";

export const metadata: Metadata = {
  title: "Blog | MA STUDIO & PARTNERS",
  description:
    "News, awards, lectures and events from MA Studio & Partners — architecture, urban planning, landscape and interior design based in Tirana, Albania.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category && isPostCategory(category) ? category : null;

  let list;
  if (process.env.NODE_ENV === "development") {
    const { client } = await import("@/tina/__generated__/client");
    const res = await client.queries.posts({ relativePath: "posts.json" });
    const BlogListEditable = (await import("@/components/tina/BlogListEditable")).default;
    list = (
      <BlogListEditable
        activeCategory={active}
        tina={{ query: res.query, variables: res.variables, data: res.data }}
      />
    );
  } else {
    const posts = active ? postsByCategory(active) : POSTS;
    list = <BlogList posts={posts} />;
  }

  const chipBase =
    "label inline-flex items-center border border-hairline px-3 py-2.5 transition-colors md:py-1.5";

  return (
    <div>
      <nav className="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-8 pb-5 md:pt-10" aria-label="Filter posts by category">
        <Link
          href="/blog"
          aria-current={!active ? "true" : undefined}
          className={`${chipBase} ${!active ? "border-black bg-black text-white" : "hover:bg-black hover:text-white"}`}
        >
          All
        </Link>
        {POST_CATEGORIES.map((c) => {
          const isActive = active === c.key;
          return (
            <Link
              key={c.key}
              href={`/blog?category=${c.key}`}
              aria-current={isActive ? "true" : undefined}
              className={`${chipBase} ${isActive ? "border-black bg-black text-white" : "hover:bg-black hover:text-white"}`}
            >
              {c.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-2">{list}</div>
    </div>
  );
}
