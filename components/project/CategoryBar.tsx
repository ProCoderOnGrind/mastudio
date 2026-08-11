import Link from "next/link";
import { CATEGORIES, type CategoryKey } from "@/data/categories";

/**
 * The project filter row — the same directly-clickable chips the blog uses,
 * lifted out of the search dropdown and onto the page itself.
 *
 * Its height is pinned to `--filter-h` (app/globals.css) because `ProjectRow`
 * subtracts that number from the viewport to size the hero photo. A chip row
 * that grew with its content would push the first image below the fold.
 */
export default function CategoryBar({ active }: { active: CategoryKey | null }) {
  const chip =
    // py-2.5 on touch screens keeps the chip near a 40px tap target; the
    // desktop row tightens up. Both stay inside --filter-h.
    "label inline-flex shrink-0 items-center border px-3 py-2.5 transition-colors duration-200 md:py-1.5";
  const state = (on: boolean) =>
    on
      ? "border-black bg-black text-white"
      : "border-hairline hover:border-black hover:bg-black hover:text-white";

  return (
    <nav
      aria-label="Filter projects by category"
      className="no-scrollbar flex h-[var(--filter-h)] items-center gap-2 overflow-x-auto px-4 md:px-5"
    >
      <Link
        href="/"
        aria-current={!active ? "true" : undefined}
        className={`${chip} ${state(!active)}`}
      >
        All
      </Link>
      {CATEGORIES.map((c) => {
        const on = active === c.key;
        return (
          <Link
            key={c.key}
            href={`/?category=${c.key}`}
            aria-current={on ? "true" : undefined}
            className={`${chip} ${state(on)}`}
          >
            {c.label}
          </Link>
        );
      })}
    </nav>
  );
}
