"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import manifest from "@/data/book.json";

const COUNT = manifest.pageCount;
const ASPECT = manifest.aspect; // single page width / height
const PAGE_W = 1000;
const PAGE_H = Math.round(PAGE_W / ASPECT);

const pageSrc = (n: number) => `/book/pages/${String(n).padStart(3, "0")}.webp`;
const thumbSrc = (n: number) => `/book/thumbs/${String(n).padStart(3, "0")}.webp`;
const pageAlt = (n: number) =>
  n === 1
    ? "MA Studio & Partners book cover"
    : `MA Studio & Partners book, page ${n} of ${COUNT}`;

// md breakpoint decides spread (two pages) vs single page.
function useTwoUp() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(min-width: 768px)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );
}

// The cover sits alone like a closed book; interior pages pair up as
// spreads (2-3, 4-5, ...). The last page falls alone when it has no pair.
function visiblePages(start: number, twoUp: boolean): number[] {
  if (!twoUp || start === 1) return [start];
  return start + 1 <= COUNT ? [start, start + 1] : [start];
}

export default function BookReader() {
  const twoUp = useTwoUp();
  const [nav, setNav] = useState<{ page: number; dir: "next" | "prev" }>({
    page: 1,
    dir: "next",
  });
  const [indexOpen, setIndexOpen] = useState(false);

  // Spreads start on even pages; re-align if the viewport mode changed.
  const start = twoUp && nav.page > 1 && nav.page % 2 === 1 ? nav.page - 1 : nav.page;
  const pages = visiblePages(start, twoUp);
  const last = pages[pages.length - 1];
  const canPrev = start > 1;
  const canNext = last < COUNT;

  const goNext = () =>
    canNext && setNav({ page: last + 1, dir: "next" });
  const goPrev = () =>
    canPrev &&
    setNav({
      page: twoUp ? (start <= 3 ? 1 : start - 2) : start - 1,
      dir: "prev",
    });

  // Keyboard paging. The index overlay owns the keyboard while open.
  useEffect(() => {
    if (indexOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Warm the cache one turn ahead and behind.
  useEffect(() => {
    for (const n of [last + 1, last + 2, start - 1, start - 2]) {
      if (n >= 1 && n <= COUNT) new Image().src = pageSrc(n);
    }
  }, [start, last]);

  // Swipe: distance or a quick flick turns the page.
  const touch = useRef<{ x: number; t: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" || touch.current) return;
    touch.current = { x: e.clientX, t: performance.now() };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!touch.current) return;
    const dx = e.clientX - touch.current.x;
    const velocity = Math.abs(dx) / (performance.now() - touch.current.t);
    touch.current = null;
    if (Math.abs(dx) < 24 && velocity < 0.3) return;
    if (Math.abs(dx) > 60 || velocity > 0.3) (dx < 0 ? goNext : goPrev)();
  };

  const ratio = ASPECT * pages.length; // width/height of the visible group
  const counter =
    pages.length === 2 ? `${pages[0]}-${pages[1]} / ${COUNT}` : `${pages[0]} / ${COUNT}`;

  return (
    <section aria-label="Book reader">
      {/* Page canvas — height-capped so the whole spread stays in view */}
      <div
        className="relative mx-auto touch-pan-y select-none"
        style={{
          width: `min(100%, calc(${ratio} * (100dvh - 300px)))`,
          minWidth: "min(100%, 280px)",
          aspectRatio: `${ratio}`,
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (touch.current = null)}
      >
        <div key={start} data-dir={nav.dir} className="book-turn flex h-full w-full">
          {pages.map((n) => (
            <div key={n} className="relative min-w-0 flex-1 border border-hairline bg-white">
              <img
                src={pageSrc(n)}
                alt={pageAlt(n)}
                width={PAGE_W}
                height={PAGE_H}
                className="h-full w-full object-contain"
                draggable={false}
              />
            </div>
          ))}
          {/* Gutter shading where the spread folds */}
          {pages.length === 2 && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/[0.06] to-transparent"
            />
          )}
        </div>

        {/* Invisible pointer-only click zones: left half back, right half
            forward. Keyboard and assistive tech use the labelled arrow
            buttons in the control row instead. */}
        {canPrev && (
          <button
            aria-hidden
            tabIndex={-1}
            onClick={goPrev}
            className="absolute inset-y-0 left-0 w-1/2"
          />
        )}
        {canNext && (
          <button
            aria-hidden
            tabIndex={-1}
            onClick={goNext}
            className="absolute inset-y-0 right-0 w-1/2"
          />
        )}
      </div>

      {/* Controls */}
      <div className="mx-auto mt-5 flex max-w-[900px] items-center justify-between border-t border-hairline pt-4">
        <div className="flex items-center gap-5">
          <button
            aria-label="Previous page"
            onClick={goPrev}
            disabled={!canPrev}
            className="label transition-colors hover:text-accent disabled:opacity-30 disabled:hover:text-black"
          >
            &larr;
          </button>
          <span className="label meta tabular-nums" aria-live="polite">
            {counter}
          </span>
          <button
            aria-label="Next page"
            onClick={goNext}
            disabled={!canNext}
            className="label transition-colors hover:text-accent disabled:opacity-30 disabled:hover:text-black"
          >
            &rarr;
          </button>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIndexOpen(true)}
            className="label transition-colors hover:text-accent"
          >
            Index
          </button>
          <a
            href={manifest.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="label transition-colors hover:text-accent"
          >
            Download PDF
          </a>
        </div>
      </div>

      {indexOpen && (
        <BookIndex
          current={pages}
          onSelect={(n) => {
            setNav({ page: n, dir: n >= start ? "next" : "prev" });
            setIndexOpen(false);
          }}
          onClose={() => setIndexOpen(false)}
        />
      )}
    </section>
  );
}

function BookIndex({
  current,
  onSelect,
  onClose,
}: {
  current: number[];
  onSelect: (n: number) => void;
  onClose: () => void;
}) {
  const currentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    currentRef.current?.scrollIntoView({ block: "center" });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Book index"
      className="book-index fixed inset-0 z-[80] overflow-y-auto bg-white"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-hairline bg-white px-5 py-4">
        <span className="label">
          Index <span className="meta">· {COUNT} pages</span>
        </span>
        <button onClick={onClose} className="label transition-colors hover:text-accent">
          Close
        </button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-x-3 gap-y-5 px-5 py-6">
        {Array.from({ length: COUNT }, (_, i) => i + 1).map((n) => {
          const active = current.includes(n);
          return (
            <button
              key={n}
              ref={active && n === current[0] ? currentRef : undefined}
              onClick={() => onSelect(n)}
              aria-current={active ? "page" : undefined}
              className="group text-left"
            >
              <img
                src={thumbSrc(n)}
                alt={pageAlt(n)}
                width={168}
                height={Math.round(168 / ASPECT)}
                loading="lazy"
                className={`w-full border transition-colors ${
                  active ? "border-accent" : "border-hairline group-hover:border-black"
                }`}
                draggable={false}
              />
              <span className={`label mt-1 block ${active ? "text-accent" : "meta"}`}>
                {n}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
