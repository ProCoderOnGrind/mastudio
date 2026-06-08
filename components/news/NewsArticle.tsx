"use client";
import { useState } from "react";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";
import type { NewsItem } from "@/data/news";

export default function NewsArticle({ item }: { item: NewsItem }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal>
      <article className="grid gap-4 border-t border-hairline py-8 md:grid-cols-[120px_1fr_1fr] md:gap-8">
        <div className="label meta">{item.date}</div>
        <BlurImage seed={item.id} ratio={item.ratio} />
        <div>
          <h2 className="mb-3 text-[15px] uppercase leading-snug">{item.title}</h2>
          <div className="grid transition-all duration-300" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
            <p className="overflow-hidden text-[14px] meta">{item.excerpt}</p>
          </div>
          <button onClick={() => setOpen((o) => !o)} className="label mt-2 hover:text-big-gray">
            {open ? "Read less −" : "Read more +"}
          </button>
        </div>
      </article>
    </Reveal>
  );
}
