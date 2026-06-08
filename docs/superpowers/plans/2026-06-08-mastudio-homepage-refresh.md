# MA Studio Homepage Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the MA Studio homepage with a new top nav (Projects · About · Contact · CoFounders), an inline expanding search that absorbs the project categories, a once-per-session intro logo-loading animation, a one-photo-per-glance hero with symmetric image margins, and a new CoFounders page.

**Architecture:** Pure-logic units (category helpers, intro session gating) are unit-tested with Vitest/jsdom. Header/search/page components are tested with Testing Library where behavior is meaningful. Purely visual outcomes (intro animation morph, hero viewport-fill, symmetric image width) are verified on the running app with Playwright screenshots and tuned by eye — the spec says quality wins over the rule for the photo widening.

**Tech Stack:** Next.js 16.2.7 (App Router, Turbopack), React 19, Tailwind v4, Framer Motion 12, Vitest + Testing Library (jsdom).

**Branch:** `feature/homepage-refresh` (already created).

---

## Key facts established during planning (do not re-derive)

- **`searchParams` is async in Next 16.** A page that reads the query string must be `async` and `await searchParams` (it is a `Promise`, not `URLSearchParams`). Confirmed in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`.
- **jsdom lacks `IntersectionObserver` and `matchMedia`.** `components/motion/Reveal.tsx` → `lib/hooks/useScrollReveal.ts` uses `IntersectionObserver`; `IntroOverlay` uses `matchMedia`. Both must be polyfilled in `test/setup.ts` (Task 1) before the component tests will run.
- **Existing reusable APIs:** `lib/search.ts` `searchAll(q)`, `data/projects.ts` `projectsByCategory(cat)` and `PROJECTS`, `data/categories.ts` `CATEGORIES`, `components/media/BlurImage.tsx` (gradient placeholder when `src` is absent), `components/PageTitle.tsx`, `components/motion/Reveal.tsx`.
- **Test commands:** `npm test` (all), `npx vitest run <file>` (one file). `passWithNoTests` is on. `@` alias → repo root.
- **Files only `Header.tsx` references** and that will be deleted in Task 6: `components/header/Menu.tsx`, `CategoryTabs.tsx`, `Flyout.tsx`, `CommandMenu.tsx`.

---

## File structure

| File | Responsibility |
| --- | --- |
| `test/setup.ts` | **Modify** — add `IntersectionObserver` + `matchMedia` polyfills |
| `data/categories.ts` | **Modify** — add `isCategoryKey`, `categoryLabel` |
| `lib/intro.ts` | **Create** — sessionStorage gating for the intro |
| `components/header/NavLinks.tsx` | **Create** — 4 desktop links + mobile hamburger |
| `components/header/SearchBar.tsx` | **Create** — inline expanding search + category chips + live results |
| `components/header/Header.tsx` | **Modify** — logo (id `site-logo`) · NavLinks · SearchBar |
| `components/header/Menu.tsx`, `CategoryTabs.tsx`, `Flyout.tsx`, `CommandMenu.tsx` | **Delete** |
| `components/media/BlurImage.tsx` | **Modify** — allow `ratio={null}` (no aspect-ratio, height from className) |
| `components/project/ProjectRow.tsx` | **Modify** — `hero` prop, symmetric grid |
| `components/project/ProjectList.tsx` | **Modify** — pass `hero` to first row |
| `app/page.tsx` | **Modify** — async, read `?category`, filter, clear pill, mount IntroOverlay |
| `components/intro/IntroOverlay.tsx` | **Create** — intro animation (Framer Motion) |
| `data/founders.ts` | **Create** — placeholder co-founder data |
| `app/cofounders/page.tsx` | **Create** — CoFounders page |
| `test/categories.test.ts`, `test/intro.test.ts`, `test/navlinks.test.tsx`, `test/searchbar.test.tsx`, `test/introoverlay.test.tsx`, `test/cofounders.test.tsx` | **Create** — tests |

---

## Task 1: Test setup polyfills

**Files:**
- Modify: `test/setup.ts`

- [ ] **Step 1: Add jsdom polyfills for IntersectionObserver and matchMedia**

Replace the entire contents of `test/setup.ts` with:

```ts
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom has no IntersectionObserver — components using useScrollReveal (Reveal) need it.
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
// @ts-expect-error assigning a test double
globalThis.IntersectionObserver = IO;

// jsdom has no matchMedia — IntroOverlay reads prefers-reduced-motion.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}
```

- [ ] **Step 2: Verify the existing suite still passes**

Run: `npm test`
Expected: PASS — existing `slug`, `placeholder`, `projects`, `search` tests still green (4 files).

- [ ] **Step 3: Commit**

```bash
git add test/setup.ts
git commit -m "test: polyfill IntersectionObserver and matchMedia for jsdom"
```

---

## Task 2: Category helpers (`isCategoryKey`, `categoryLabel`)

**Files:**
- Modify: `data/categories.ts`
- Test: `test/categories.test.ts`

- [ ] **Step 1: Write the failing test**

Create `test/categories.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { isCategoryKey, categoryLabel, CATEGORIES } from "@/data/categories";

describe("category helpers", () => {
  it("isCategoryKey accepts valid keys", () => {
    expect(isCategoryKey("residential")).toBe(true);
    expect(isCategoryKey("masterplan")).toBe(true);
  });
  it("isCategoryKey rejects unknown values", () => {
    expect(isCategoryKey("nope")).toBe(false);
    expect(isCategoryKey("")).toBe(false);
  });
  it("categoryLabel returns the human label", () => {
    expect(categoryLabel("residential")).toBe("Residential");
    expect(categoryLabel("masterplan")).toBe("Masterplan");
  });
  it("CATEGORIES has the five expected entries", () => {
    expect(CATEGORIES.map((c) => c.key)).toEqual([
      "residential",
      "hospitality",
      "culture",
      "masterplan",
      "commercial",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/categories.test.ts`
Expected: FAIL — `isCategoryKey`/`categoryLabel` are not exported.

- [ ] **Step 3: Add the helpers**

Append to `data/categories.ts` (after the existing `categoryForType` function):

```ts
export function isCategoryKey(value: string): value is CategoryKey {
  return CATEGORIES.some((c) => c.key === value);
}

export function categoryLabel(key: CategoryKey): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/categories.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add data/categories.ts test/categories.test.ts
git commit -m "feat: add isCategoryKey and categoryLabel helpers"
```

---

## Task 3: Intro session gating (`lib/intro.ts`)

**Files:**
- Create: `lib/intro.ts`
- Test: `test/intro.test.ts`

- [ ] **Step 1: Write the failing test**

Create `test/intro.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { hasPlayedIntro, markIntroPlayed } from "@/lib/intro";

describe("intro session gating", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("is false before the intro has played", () => {
    expect(hasPlayedIntro()).toBe(false);
  });
  it("is true after marking it played", () => {
    markIntroPlayed();
    expect(hasPlayedIntro()).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/intro.test.ts`
Expected: FAIL — `@/lib/intro` does not exist.

- [ ] **Step 3: Create the helper**

Create `lib/intro.ts`:

```ts
const KEY = "ma-intro-played";

export function hasPlayedIntro(): boolean {
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroPlayed(): void {
  try {
    window.sessionStorage.setItem(KEY, "1");
  } catch {
    /* sessionStorage unavailable (private mode / SSR) — ignore */
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/intro.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/intro.ts test/intro.test.ts
git commit -m "feat: add once-per-session intro gating helper"
```

---

## Task 4: NavLinks component

**Files:**
- Create: `components/header/NavLinks.tsx`
- Test: `test/navlinks.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `test/navlinks.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NavLinks from "@/components/header/NavLinks";

describe("NavLinks", () => {
  it("renders the four primary links with correct hrefs", () => {
    render(<NavLinks />);
    const expected: [string, string][] = [
      ["Projects", "/"],
      ["About", "/about"],
      ["Contact", "/contact"],
      ["CoFounders", "/cofounders"],
    ];
    for (const [label, href] of expected) {
      // desktop + mobile copies both exist; at least one must point to href
      const links = screen.getAllByRole("link", { name: label });
      expect(links.some((a) => a.getAttribute("href") === href)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/navlinks.test.tsx`
Expected: FAIL — `@/components/header/NavLinks` does not exist.

- [ ] **Step 3: Create the component**

Create `components/header/NavLinks.tsx`:

```tsx
"use client";
import Link from "next/link";
import { useState } from "react";

const NAV = [
  { label: "Projects", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "CoFounders", href: "/cofounders" },
];

export default function NavLinks() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Desktop links */}
      <nav className="hidden items-center gap-8 md:flex">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="label hover:text-accent transition-colors">
            {n.label}
          </Link>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <div className="relative md:hidden">
        <button aria-label="Menu" onClick={() => setOpen((o) => !o)} className="flex flex-col gap-[5px] p-1">
          <span className="block h-[2px] w-6 bg-black" />
          <span className="block h-[2px] w-6 bg-black" />
          <span className="block h-[2px] w-6 bg-black" />
        </button>
        <nav
          className="absolute left-0 top-full mt-3 flex flex-col gap-1 bg-white transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(-8px)",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="label hover:text-accent transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/navlinks.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add components/header/NavLinks.tsx test/navlinks.test.tsx
git commit -m "feat: add NavLinks (Projects/About/Contact/CoFounders + mobile menu)"
```

---

## Task 5: SearchBar component (inline expanding, categories + live results)

**Files:**
- Create: `components/header/SearchBar.tsx`
- Test: `test/searchbar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `test/searchbar.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "@/components/header/SearchBar";

describe("SearchBar", () => {
  it("reveals category chips when the field is focused", () => {
    render(<SearchBar />);
    const input = screen.getByLabelText("Search projects and categories");
    expect(screen.queryByText("Residential")).toBeNull();
    fireEvent.focus(input);
    expect(screen.getByText("Residential")).toBeInTheDocument();
    expect(screen.getByText("Masterplan")).toBeInTheDocument();
  });

  it("shows live results as you type", () => {
    render(<SearchBar />);
    const input = screen.getByLabelText("Search projects and categories");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "germia" } });
    expect(screen.getByText("Germia Concert Hall")).toBeInTheDocument();
  });

  it("links a category chip to its filtered homepage", () => {
    render(<SearchBar />);
    fireEvent.focus(screen.getByLabelText("Search projects and categories"));
    const chip = screen.getByRole("link", { name: "Residential" });
    expect(chip.getAttribute("href")).toBe("/?category=residential");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/searchbar.test.tsx`
Expected: FAIL — `@/components/header/SearchBar` does not exist.

- [ ] **Step 3: Create the component**

Create `components/header/SearchBar.tsx`. It uses `next/link` for all navigation (no `useRouter`, so no router mock needed). The panel renders only while focused; `onMouseDown` preventDefault on the panel keeps the input focused so chip/result clicks register before blur.

```tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { searchAll } from "@/lib/search";

export default function SearchBar() {
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

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 border-b border-black/70 px-1 py-1 transition-[width] duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
          focused ? "w-[320px] max-w-[60vw]" : "w-[180px]"
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
          <div className="mb-3 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.key}
                href={`/?category=${c.key}`}
                onClick={close}
                className="label border border-hairline px-2 py-1 transition-colors hover:bg-black hover:text-white"
              >
                {c.label}
              </Link>
            ))}
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/searchbar.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/header/SearchBar.tsx test/searchbar.test.tsx
git commit -m "feat: add inline expanding SearchBar with category chips and live results"
```

---

## Task 6: Wire Header; remove old header components

**Files:**
- Modify: `components/header/Header.tsx`
- Delete: `components/header/Menu.tsx`, `CategoryTabs.tsx`, `Flyout.tsx`, `CommandMenu.tsx`

- [ ] **Step 1: Replace Header contents**

Replace the entire contents of `components/header/Header.tsx` with:

```tsx
import Link from "next/link";
import Image from "next/image";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";

export default function Header() {
  return (
    <header className="sticky top-0 z-[80] flex items-center justify-between gap-6 bg-white/90 px-5 py-3 backdrop-blur">
      <div className="flex items-center gap-8">
        <Link id="site-logo" href="/" aria-label="MA Studio & Partners — home" className="shrink-0">
          <Image src="/mastudio/logo-dark.png" alt="MA Studio & Partners" width={48} height={48} priority />
        </Link>
        <NavLinks />
      </div>
      <SearchBar />
    </header>
  );
}
```

- [ ] **Step 2: Confirm the old components are now unreferenced**

Run: `git grep -n -E "Menu|CategoryTabs|Flyout|CommandMenu" -- "components/**" "app/**"`
Expected: no remaining imports of `./Menu`, `./CategoryTabs`, `./Flyout`, `./CommandMenu` (matches inside `NavLinks`'s "Menu" aria-label text are fine; ensure no `import` lines reference the four files).

- [ ] **Step 3: Delete the obsolete files**

```bash
git rm components/header/Menu.tsx components/header/CategoryTabs.tsx components/header/Flyout.tsx components/header/CommandMenu.tsx
```

- [ ] **Step 4: Verify the app compiles and the full test suite passes**

Run: `npm test`
Expected: PASS — all test files green (no test imported the deleted components).

- [ ] **Step 5: Visual check on the running app**

Ensure the dev server is running (`npm run dev`; it auto-selects a free port — note which one). With Playwright: navigate to the homepage, resize to 1440×900, and screenshot.
Expected: header shows **logo · Projects · About · Contact · CoFounders** on the left and the slim **Search…** field on the right; the old centered category tabs and the "Search ⌘K" pill are gone. Focusing the search expands it and drops the category chips + results panel.

- [ ] **Step 6: Commit**

```bash
git add components/header/Header.tsx
git commit -m "feat: rebuild Header with NavLinks + SearchBar; remove old nav/search components"
```

---

## Task 7: BlurImage optional ratio + hero/symmetric ProjectRow

**Files:**
- Modify: `components/media/BlurImage.tsx`
- Modify: `components/project/ProjectRow.tsx`
- Modify: `components/project/ProjectList.tsx`

> Visual task — verified with Playwright screenshots, tuned by eye. Per the spec, **revert the widening if it hurts the crop or sharpness.**

- [ ] **Step 1: Let BlurImage opt out of aspect-ratio**

In `components/media/BlurImage.tsx`, change the `ratio` prop type so `null` is allowed and only apply `aspectRatio` when a ratio is given.

Change the prop declaration line:

```tsx
  ratio = "4 / 3",
```
to:
```tsx
  ratio = "4 / 3" as string | null,
```

Change the type in the props interface from `ratio?: string;` to `ratio?: string | null;`.

Change the wrapper style:
```tsx
      style={{ aspectRatio: ratio }}
```
to:
```tsx
      style={ratio ? { aspectRatio: ratio } : undefined}
```

(When `ratio` is `null`, the wrapper takes its height from `className` instead. The `<Image fill>` child already fills the wrapper.)

- [ ] **Step 2: Add a hero variant + symmetric grid to ProjectRow**

Replace the entire contents of `components/project/ProjectRow.tsx` with:

```tsx
"use client";
import { useRef } from "react";
import Reveal from "@/components/motion/Reveal";
import BlurImage from "@/components/media/BlurImage";
import { useViewer } from "@/components/viewer/ViewerContext";
import type { Project } from "@/data/projects";

export default function ProjectRow({ project, hero = false }: { project: Project; hero?: boolean }) {
  const { open } = useViewer();
  const imgWrap = useRef<HTMLDivElement>(null);

  const handleOpen = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    const r = imgWrap.current?.getBoundingClientRect();
    open(project, r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null);
  };

  return (
    <Reveal>
      <a
        href={`/projects/${project.slug}`}
        onClick={handleOpen}
        className="group grid cursor-pointer grid-cols-1 gap-5 border-t border-hairline px-5 py-6 md:grid-cols-[14rem_1fr] md:items-center"
      >
        <div className="flex items-start gap-3">
          <span className="mt-1 inline-block h-6 w-6 shrink-0 bg-black" aria-hidden />
          <span>
            <span className="block text-[18px] leading-tight">{project.name}</span>
            <span className="label meta">{project.location}</span>
          </span>
        </div>
        <div ref={imgWrap} className="overflow-hidden">
          <div className="transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.02]">
            {hero ? (
              <BlurImage
                src={project.images[0]}
                label={project.name}
                ratio={null}
                priority
                className="h-[calc(100svh-180px)]"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            ) : (
              <BlurImage
                src={project.images[0]}
                label={project.name}
                ratio="16 / 9"
                className="max-h-[46vh]"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            )}
          </div>
        </div>
      </a>
    </Reveal>
  );
}
```

Notes on the symmetric width: the grid is now `[14rem_1fr]` with `gap-5` (20px) inside `px-5` (20px). That makes the gap between the text column and the image (20px) equal the gap between the image and the screen's right edge (20px). The image column (`1fr`) is wider than the old `2fr`.

- [ ] **Step 3: Mark the first row as the hero**

Replace the entire contents of `components/project/ProjectList.tsx` with:

```tsx
import ProjectRow from "./ProjectRow";
import type { Project } from "@/data/projects";

export default function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="flex flex-col">
      {projects.map((p, i) => (
        <ProjectRow key={p.slug} project={p} hero={i === 0} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Verify one-photo-per-glance and symmetric margins on the running app**

With Playwright at 1440×900: navigate to the homepage, screenshot the **viewport** (not full page).
Expected: only the **first** project image is visible above the fold; the second project sits below the fold. The first image's left gap (to the text) visually matches its right gap (to the screen edge).

Tune if needed:
- If the second project peeks in, increase the subtracted offset in `h-[calc(100svh-180px)]` (e.g. `-200px`).
- If there's empty space below the first image, decrease it (e.g. `-150px`).
- If `14rem` text column wraps the longest project name awkwardly, bump to `16rem`.
- **If widening degrades the image crop/sharpness, revert the grid change back toward `[1fr_2fr]` and note it** — quality wins (per spec).

- [ ] **Step 5: Run the suite (no behavior tests here, but guard against regressions)**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/media/BlurImage.tsx components/project/ProjectRow.tsx components/project/ProjectList.tsx
git commit -m "feat: one-photo-per-glance hero + symmetric image margins"
```

---

## Task 8: Homepage category filter (`?category=`)

**Files:**
- Modify: `app/page.tsx`

> Logic is already covered by `test/categories.test.ts` (`isCategoryKey`/`categoryLabel`) and `test/projects.test.ts` (`projectsByCategory`). This task wires them into the async page and is verified visually.

- [ ] **Step 1: Make the homepage read and filter by category**

Replace the entire contents of `app/page.tsx` with:

```tsx
import Link from "next/link";
import ProjectList from "@/components/project/ProjectList";
import IntroOverlay from "@/components/intro/IntroOverlay";
import { PROJECTS, projectsByCategory } from "@/data/projects";
import { isCategoryKey, categoryLabel } from "@/data/categories";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category && isCategoryKey(category) ? category : null;
  const projects = active ? projectsByCategory(active) : PROJECTS;

  return (
    <div className="pt-4">
      <IntroOverlay />
      {active && (
        <div className="px-5 pb-2">
          <Link
            href="/"
            className="label inline-flex items-center gap-2 border border-hairline px-3 py-1.5 transition-colors hover:bg-black hover:text-white"
          >
            {categoryLabel(active)} <span aria-hidden>✕</span>
          </Link>
        </div>
      )}
      <ProjectList projects={projects} />
    </div>
  );
}
```

> `IntroOverlay` is created in Task 9. If executing strictly in order, temporarily comment out the `IntroOverlay` import and its `<IntroOverlay />` usage, verify Step 2, then re-enable after Task 9. (Subagent-driven execution can do Task 9 first; either order is fine since they're independent edits to different files.)

- [ ] **Step 2: Verify filtering on the running app**

With Playwright: navigate to `http://localhost:<port>/?category=residential`.
Expected: only residential projects are listed; a **"Residential ✕"** clear pill appears above the list and links back to `/`. Navigating to `/?category=bogus` shows the full unfiltered list and **no** pill. Clicking a category chip in the search panel navigates here.

- [ ] **Step 3: Run the suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: filter homepage by ?category with a clear pill"
```

---

## Task 9: Intro logo-loading animation (`IntroOverlay`)

**Files:**
- Create: `components/intro/IntroOverlay.tsx`
- Test: `test/introoverlay.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `test/introoverlay.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import IntroOverlay from "@/components/intro/IntroOverlay";
import { markIntroPlayed } from "@/lib/intro";

describe("IntroOverlay", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("renders nothing once the intro has already played this session", () => {
    markIntroPlayed();
    const { container } = render(<IntroOverlay />);
    expect(container.querySelector('[data-intro="overlay"]')).toBeNull();
  });

  it("renders the overlay on a fresh session", () => {
    const { container } = render(<IntroOverlay />);
    expect(container.querySelector('[data-intro="overlay"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/introoverlay.test.tsx`
Expected: FAIL — `@/components/intro/IntroOverlay` does not exist.

- [ ] **Step 3: Create the component**

Create `components/intro/IntroOverlay.tsx`. It renders the overlay by default (so first paint is covered), then on mount: if the intro already played this session, or `prefers-reduced-motion`, it marks played and unmounts immediately; otherwise it spins the ring for ~2.6s, then fades the white layer out while the emblem scales/flies to the header logo (measured from `#site-logo`). A click skips to the finish.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { hasPlayedIntro, markIntroPlayed } from "@/lib/intro";

const RING_TEXT = "MODELLING ARCHITECTURE · MA STUDIO & PARTNERS · ";
const SIZE = 260; // px, intro emblem box

export default function IntroOverlay() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const target = useRef({ x: 0, y: 0, scale: 0.18 });

  const finish = () => {
    if (leaving) return;
    const logo = document.getElementById("site-logo");
    if (logo) {
      const r = logo.getBoundingClientRect();
      target.current = {
        x: r.left + r.width / 2 - window.innerWidth / 2,
        y: r.top + r.height / 2 - window.innerHeight / 2,
        scale: r.width / SIZE,
      };
    }
    markIntroPlayed();
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 1100);
  };

  useEffect(() => {
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (hasPlayedIntro() || reduce) {
      markIntroPlayed();
      setVisible(false);
      return;
    }
    const t = window.setTimeout(finish, 2600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      data-intro="overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
      onClick={finish}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
      style={{ cursor: leaving ? "default" : "pointer" }}
    >
      <motion.div
        className="relative"
        style={{ width: SIZE, height: SIZE }}
        animate={
          leaving
            ? { x: target.current.x, y: target.current.y, scale: target.current.scale }
            : { x: 0, y: 0, scale: 1 }
        }
        transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Spinning ring */}
        <motion.svg
          viewBox="0 0 260 260"
          className="absolute inset-0 h-full w-full"
          animate={{ rotate: leaving ? 0 : 360 }}
          transition={
            leaving
              ? { duration: 0.8, ease: "easeOut" }
              : { repeat: Infinity, ease: "linear", duration: 8 }
          }
        >
          <defs>
            <path id="introRing" d="M130,130 m-104,0 a104,104 0 1,1 208,0 a104,104 0 1,1 -208,0" />
          </defs>
          <circle cx="130" cy="130" r="104" fill="none" stroke="#ff6900" strokeWidth="1.5" />
          <text fill="#ff6900" fontSize="12.5" letterSpacing="3">
            <textPath href="#introRing">{RING_TEXT.repeat(2)}</textPath>
          </text>
        </motion.svg>

        {/* Static center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[44px] font-semibold leading-none text-black">MA</span>
          <span className="label meta mt-1">Studio &amp; Partners</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/introoverlay.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Ensure the homepage mounts it**

Confirm `app/page.tsx` imports `IntroOverlay` and renders `<IntroOverlay />` (added in Task 8). If it was temporarily commented out, re-enable it now.

- [ ] **Step 6: Verify the animation on the running app**

With Playwright: clear session storage, then navigate to the homepage fresh.
- `await page.evaluate(() => sessionStorage.clear())` then reload.
- Screenshot immediately: white overlay with the **MA / Studio & Partners** center and an **orange ring** of text around it.
- Wait ~3.5s, screenshot again: overlay gone, homepage visible, header logo in place.
- Reload (same session) and screenshot immediately: **no** intro (already played this session).

Tune if needed: ring `duration`, the 2600ms hold, the `letterSpacing`/`fontSize` so the ring text reads cleanly, and confirm the emblem lands near the header logo (adjust nothing in code unless it visibly misses — the target is measured from `#site-logo`).

- [ ] **Step 7: Commit**

```bash
git add components/intro/IntroOverlay.tsx test/introoverlay.test.tsx app/page.tsx
git commit -m "feat: once-per-session intro logo-loading animation"
```

---

## Task 10: CoFounders page

**Files:**
- Create: `data/founders.ts`
- Create: `app/cofounders/page.tsx`
- Test: `test/cofounders.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `test/cofounders.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CoFoundersPage from "@/app/cofounders/page";

describe("CoFounders page", () => {
  it("renders a card for every founder", () => {
    render(<CoFoundersPage />);
    expect(screen.getByText("Co-Founders")).toBeInTheDocument();
    expect(screen.getAllByText(/Founding Partner/).length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/cofounders.test.tsx`
Expected: FAIL — `@/app/cofounders/page` does not exist.

- [ ] **Step 3: Create the founder data (placeholders)**

Create `data/founders.ts`:

```ts
export interface Founder {
  name: string;
  role: string;
  bio: string;
  image?: string; // optional /public path; gradient placeholder used when absent
}

// Placeholder content — replace name/role/bio/image with the real co-founders.
export const FOUNDERS: Founder[] = [
  {
    name: "Co-Founder One",
    role: "Founding Partner — Architecture",
    bio: "Placeholder biography. Replace with a short paragraph about this co-founder's background, focus, and notable work.",
  },
  {
    name: "Co-Founder Two",
    role: "Founding Partner — Urban Planning",
    bio: "Placeholder biography. Replace with a short paragraph about this co-founder's background, focus, and notable work.",
  },
];
```

- [ ] **Step 4: Create the page**

Create `app/cofounders/page.tsx` (mirrors the About/Contact page structure):

```tsx
import PageTitle from "@/components/PageTitle";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";
import { FOUNDERS } from "@/data/founders";

export default function CoFoundersPage() {
  return (
    <div>
      <PageTitle>Co-Founders</PageTitle>
      <div className="grid gap-10 px-5 md:grid-cols-2">
        {FOUNDERS.map((f, i) => (
          <Reveal key={f.name} delay={i * 60}>
            <div className="border-t border-hairline pt-4">
              <BlurImage
                src={f.image}
                seed={f.name}
                label={f.name}
                ratio="3 / 4"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="mt-3 text-[18px] leading-tight">{f.name}</div>
              <div className="label meta">{f.role}</div>
              <p className="mt-2 text-[14px]">{f.bio}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run test/cofounders.test.tsx`
Expected: PASS (1 test). (Relies on the IntersectionObserver polyfill from Task 1 because of `Reveal`.)

- [ ] **Step 6: Verify on the running app**

With Playwright: navigate to `http://localhost:<port>/cofounders`.
Expected: "Co-Founders" title and two founder cards (placeholder portrait, name, role, bio). The header "CoFounders" link routes here.

- [ ] **Step 7: Commit**

```bash
git add data/founders.ts app/cofounders/page.tsx test/cofounders.test.tsx
git commit -m "feat: add CoFounders page with placeholder co-founder content"
```

---

## Task 11: Final verification

**Files:** none (verification + optional cleanup commit)

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: PASS — all suites green (existing 4 + new: categories, intro, navlinks, searchbar, introoverlay, cofounders).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors. Fix any (e.g., unused imports from the deleted components).

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds. Watch for: the async `searchParams` typing on `app/page.tsx`, and any "module not found" for the deleted header files.

- [ ] **Step 4: End-to-end visual pass with Playwright (1440×900)**

Verify each requirement on the running app and screenshot:
1. Fresh session homepage → intro plays (orange ring spins around MA), then fades and logo settles into the header.
2. Header shows logo · Projects · About · Contact · CoFounders · Search field. Old category tabs / "Search ⌘K" pill gone.
3. Focus search → expands, shows category chips + live results. Chip → `/?category=…` filtered list with clear pill.
4. Homepage first glance → exactly one photo; second project below the fold; image left/right gaps symmetric.
5. `/cofounders` → two placeholder founder cards.
6. Reload within session → no intro replay.

- [ ] **Step 5: Final commit if any tuning changed files**

```bash
git add -A
git commit -m "chore: final tuning for homepage refresh"
```

(Skip if the working tree is clean.)

---

## Self-review (completed by plan author)

- **Spec coverage:** Nav (Tasks 4, 6) ✓ · Search redesign + categories inside (Tasks 5, 6) + category filter (Tasks 2, 8) ✓ · Intro animation once-per-session + skippable + reduced-motion (Tasks 3, 9) ✓ · One-photo-per-glance + symmetric width with quality-first fallback (Task 7) ✓ · CoFounders page (Task 10) ✓ · Old components removed (Task 6) ✓.
- **Placeholder scan:** Co-founder copy is intentionally placeholder per spec; no plan-step placeholders. All code blocks are complete.
- **Type/name consistency:** `isCategoryKey`/`categoryLabel` (defined Task 2, used Task 8); `hasPlayedIntro`/`markIntroPlayed` (Task 3, used Task 9); `hero` prop (Task 7 producer + consumer); `#site-logo` id (Task 6 producer, Task 9 consumer); `data-intro="overlay"` (Task 9 component + test); `searchAll`/`CATEGORIES`/`projectsByCategory`/`PROJECTS` reused from existing modules.
- **Ordering note:** Tasks 8 and 9 cross-reference (`app/page.tsx` mounts `IntroOverlay`); the plan calls this out and both orders work.
```
