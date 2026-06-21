import BlogRow from "./BlogRow";
import type { Post } from "@/data/posts";

export default function BlogList({
  posts,
  editTargets,
}: {
  posts: Post[];
  editTargets?: Record<string, any>;
}) {
  return (
    <div className="flex flex-col">
      {posts.map((p, i) => (
        <BlogRow key={p.slug} post={p} hero={i === 0} editTarget={editTargets?.[p.slug]} />
      ))}
    </div>
  );
}
