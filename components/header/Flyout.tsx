"use client";
import Link from "next/link";
import { useState } from "react";
import type { Category } from "@/data/categories";

export default function Flyout({ category }: { category: Category }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Link href={`/projects/${category.key}`} className="label hover:text-accent transition-colors">
        {category.label}
      </Link>
      {category.subcategories.length > 0 && (
        <div className="absolute left-0 top-full z-50 min-w-[180px] bg-white pt-3 transition-all duration-200"
          style={{ opacity: hover ? 1 : 0, pointerEvents: hover ? "auto" : "none",
                   transform: hover ? "translateY(0)" : "translateY(-6px)" }}>
          <Link href={`/projects/${category.key}`} className="label block py-1 meta hover:text-black">View all</Link>
          {category.subcategories.map((s) => (
            <Link key={s} href={`/projects/${category.key}`} className="label block py-1 hover:text-big-gray capitalize">
              {s.replace(/-/g, " ")}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
