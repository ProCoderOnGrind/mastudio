"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchAll, highlightSegments, type SearchResult } from "@/lib/search";

export default function SearchBar() {
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchAll(q), [q]);

  // A new query means a new result list, so the highlight goes back to the top.
  // Clamped rather than reset in an effect so it can never point past the list.
  const activeIndex = results.length === 0 ? 0 : Math.min(active, results.length - 1);

  const setQuery = (value: string) => {
    setQ(value);
    setActive(0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keep the keyboard-selected row inside the scroll area.
  useEffect(() => {
    const row = listRef.current?.querySelector('[data-active="true"]');
    // jsdom (and older Safari) has no scrollIntoView on elements.
    if (row instanceof HTMLElement && typeof row.scrollIntoView === "function") {
      row.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const close = () => {
    setFocused(false);
    setQ("");
    setActive(0);
  };

  // Navigate from pointerdown (fires before the input blurs / iOS dismisses the
  // keyboard) so a touch tap on a row is never swallowed by the close race.
  // Non-primary buttons fall through to the Link's default: middle-click opens a
  // new tab, right-click opens the context menu. Keyboard Enter uses the href
  // since no pointerdown fires.
  const goTo = (e: React.PointerEvent, href: string) => {
    if (e.button !== 0) return;
    e.preventDefault();
    close();
    router.push(href);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (results.length === 0) return;
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + results.length) % results.length);
      return;
    }
    if (e.key === "Enter") {
      const target = results[activeIndex];
      if (!target) return;
      e.preventDefault();
      close();
      router.push(target.href);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      // First Escape clears a query, a second one dismisses the panel — the
      // behaviour of every search field people already use.
      if (q) setQuery("");
      else inputRef.current?.blur();
    }
  };

  const open = focused;

  return (
    <div className="relative">
      {/* The focused width is capped below xl: the enlarged nav labels reach
          further across the header now, and a 360px field would grow back over
          "CoFounders" on a 1024px screen. */}
      <div
        className={`flex items-center gap-2.5 border-b-2 px-1 py-1.5 transition-[width,border-color] duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
          open
            ? "w-[300px] max-w-[62vw] border-black xl:w-[360px]"
            : "w-[175px] border-black/70 sm:w-[215px]"
        }`}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(close, 120)}
          onKeyDown={onInputKeyDown}
          placeholder="Search projects…"
          aria-label="Search projects"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="site-search-results"
          autoComplete="off"
          // 16px matches the enlarged nav labels, and 16px is also the floor
          // that keeps iOS Safari from auto-zooming the page on focus.
          className="w-full bg-transparent text-[16px] leading-tight outline-none placeholder:text-big-gray"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            // pointerdown, not click: the input's blur would close the panel first.
            onPointerDown={(e) => {
              e.preventDefault();
              setQuery("");
              inputRef.current?.focus();
            }}
            className="shrink-0 text-big-gray transition-colors hover:text-black"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div
          id="site-search-results"
          role="listbox"
          ref={listRef}
          className="absolute right-0 top-full z-[85] mt-3 max-h-[min(70vh,520px)] w-[420px] max-w-[86vw] overflow-auto border border-hairline bg-white py-2 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.25)]"
          onMouseDown={(e) => e.preventDefault()}
        >
          {results.length === 0 ? (
            <div className="px-4 py-6">
              <p className="text-[15px]">
                No project matches <span className="font-medium">“{q}”</span>
              </p>
              <p className="meta mt-1 text-[13px]">Try a project name or a city.</p>
            </div>
          ) : (
            <>
              <div className="label meta px-4 pt-2 pb-1.5">
                {q ? "Projects" : "Recent projects"}
              </div>
              {results.map((r, i) => (
                <Row
                  key={r.href}
                  result={r}
                  query={q}
                  isActive={i === activeIndex}
                  onHover={() => setActive(i)}
                  onPointerDown={(e) => goTo(e, r.href)}
                  onClick={(e: React.MouseEvent) => {
                    // A pointer click already navigated on pointerdown;
                    // keyboard Enter (detail 0) follows the href instead.
                    if (e.detail !== 0) e.preventDefault();
                    else close();
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  result,
  query,
  isActive,
  onHover,
  onPointerDown,
  onClick,
}: {
  result: SearchResult;
  query: string;
  isActive: boolean;
  onHover: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <Link
      href={result.href}
      role="option"
      aria-selected={isActive}
      data-active={isActive}
      onMouseMove={onHover}
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={`flex items-baseline justify-between gap-4 px-4 py-2.5 transition-colors ${
        isActive ? "bg-black text-white" : ""
      }`}
    >
      <span className="text-[15px] leading-snug">
        {highlightSegments(result.label, query).map((seg, i) =>
          seg.match ? (
            <mark
              key={i}
              className="bg-transparent font-semibold text-inherit underline decoration-accent decoration-2 underline-offset-2"
            >
              {seg.text}
            </mark>
          ) : (
            // A bare fragment, not a <span>: an extra element wrapping the whole
            // label would make the row match twice in text queries.
            <Fragment key={i}>{seg.text}</Fragment>
          ),
        )}
      </span>
      {result.sub && (
        <>
          {/* The space is load-bearing: without a whitespace node between the
              spans, assistive tech reads the row as "VoxelResidenceTirana". */}
          {" "}
          <span className={`label shrink-0 ${isActive ? "text-white/70" : "meta"}`}>
            {result.sub}
          </span>
        </>
      )}
    </Link>
  );
}
