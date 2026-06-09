"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/data/categories";
import { searchAll } from "@/lib/search";

export default function SearchBar() {
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchAll(q), [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") inputRef.current?.blur();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => {
    setFocused(false);
    setQ("");
  };

  // Navigate from pointerdown (fires before the input blurs / iOS dismisses the
  // keyboard) so a touch tap on a chip is never swallowed by the close race.
  // Non-primary buttons fall through to the Link's default: middle-click opens a
  // new tab, right-click opens the context menu. Keyboard Enter uses the href
  // since no pointerdown fires.
  const goToCategory = (e: React.PointerEvent, href: string) => {
    if (e.button !== 0) return;
    e.preventDefault();
    close();
    router.push(href);
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 border-b border-black/70 px-1 py-1 transition-[width] duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
          focused ? "w-[320px] max-w-[60vw]" : "w-[150px] sm:w-[180px]"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(close, 120)}
          placeholder="Search…"
          aria-label="Search projects and categories"
          className="w-full bg-transparent text-[14px] outline-none placeholder:text-big-gray"
        />
      </div>

      {focused && (
        <div
          className="absolute right-0 top-full z-[85] mt-2 w-[320px] max-w-[80vw] bg-white p-3 shadow-xl"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="label meta mb-2">Categories</div>
          <div className="mb-3 flex flex-wrap gap-2.5 sm:gap-2">
            {CATEGORIES.map((c) => {
              const href = `/?category=${c.key}`;
              return (
                <Link
                  key={c.key}
                  href={href}
                  onPointerDown={(e) => goToCategory(e, href)}
                  onClick={(e) => {
                    // pointer click already navigated via pointerdown (suppress the
                    // duplicate href nav); keyboard Enter (detail 0) navigates via the
                    // href, so just close the dropdown explicitly.
                    if (e.detail !== 0) e.preventDefault();
                    else close();
                  }}
                  className="label border border-hairline px-3 py-2.5 transition-colors hover:bg-black hover:text-white sm:px-2 sm:py-1"
                >
                  {c.label}
                </Link>
              );
            })}
          </div>
          <ul className="max-h-[40vh] overflow-auto">
            {results.map((r) => (
              <li key={r.href + r.label}>
                <Link
                  href={r.href}
                  onClick={close}
                  className="flex items-center justify-between py-1.5 hover:text-accent"
                >
                  <span className="text-[14px]">{r.label}</span>
                  <span className="label meta">{r.sub ?? r.group}</span>
                </Link>
              </li>
            ))}
            {q && results.length === 0 && (
              <li className="meta py-1.5 text-[13px]">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
