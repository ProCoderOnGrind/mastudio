"use client";
import { useState } from "react";
import { SERVICE_MEANINGS } from "@/data/services";

// A service row: clearly clickable, tap "+" to reveal a plain-language explanation
// of what the service means for clients who don't know the term.
function ServiceRow({ name, meaning }: { name: string; meaning: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-hairline">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group flex w-full items-center justify-between py-3 text-left"
      >
        <span className="text-[15px] transition-colors group-hover:text-accent">{name}</span>
        <span
          className="text-[18px] leading-none text-accent transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "none" }}
        >
          +
        </span>
      </button>
      <div
        className="grid transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="max-w-[60ch] pb-3 text-justify text-[14px] leading-relaxed text-big-gray">{meaning}</p>
        </div>
      </div>
    </div>
  );
}

export default function ServicesList() {
  // Two independent columns on desktop (so an open row never pushes its neighbour);
  // a single column on mobile.
  const mid = Math.ceil(SERVICE_MEANINGS.length / 2);
  const columns = [SERVICE_MEANINGS.slice(0, mid), SERVICE_MEANINGS.slice(mid)];
  return (
    <div className="grid gap-x-12 md:grid-cols-2">
      {columns.map((col, ci) => (
        <div key={ci}>
          {col.map((s) => (
            <ServiceRow key={s.name} name={s.name} meaning={s.meaning} />
          ))}
        </div>
      ))}
    </div>
  );
}
