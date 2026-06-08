"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { searchAll } from "@/lib/search";

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const results = useMemo(() => searchAll(q), [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => { setOpen(false); setQ(""); router.push(href); };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="label flex items-center gap-2 border border-hairline px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
      >
        Search <span className="text-big-gray">⌘K</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/20 pt-[12vh]"
             onClick={() => setOpen(false)}>
          <div className="w-[560px] max-w-[92vw] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects and pages…"
              className="w-full border-b border-hairline px-4 py-3 text-[15px] outline-none"
            />
            <ul className="max-h-[50vh] overflow-auto py-2">
              {results.length === 0 && (
                <li className="px-4 py-3 meta text-[13px]">No results</li>
              )}
              {results.map((r) => (
                <li key={r.href + r.label}>
                  <button onClick={() => go(r.href)}
                    className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-neutral-100">
                    <span className="text-[14px]">{r.label}</span>
                    <span className="label meta">{r.sub ?? r.group}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
