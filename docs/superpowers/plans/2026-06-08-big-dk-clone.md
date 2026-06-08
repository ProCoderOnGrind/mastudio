# big.dk Frontend Replica — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a faithful 1:1 reproduction of big.dk's frontend — layout, design system, structure, and animations — in Next.js + React + Tailwind v4, using original placeholder content and the first 34 projects.

**Architecture:** Next.js App Router with a shared root layout (Header + Footer + CustomCursor). A small set of reusable primitives (`BlurImage`, `Reveal`, `Accordion`, `Flyout`, `CommandMenu`, `CustomCursor`) compose every page. All content comes from typed data modules in `/data`; imagery is deterministic, original placeholder gradients generated at the real aspect ratios. Animations use CSS/Tailwind transitions + IntersectionObserver to match the site's restrained motion.

**Tech Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · `next/font` (Geist) · `next/image` · Vitest + Testing Library (logic tests) · Playwright (visual verification, already available via MCP).

**Reference material:** Spec at `docs/superpowers/specs/2026-06-08-big-dk-clone-design.md`. Reference screenshots from the live site live at repo root: `big-01-homepage.png`, `big-02-project-detail.png`, `big-03-news.png`, `big-04-menu-open.png`, `big-05-about.png`, `big-06-sustainability.png`, `big-07-people.png`, `big-08-careers.png`. Compare against these during verification.

**Design tokens (use everywhere):** bg `#fff`, text `#000`, meta-gray `#898989`, hairline `#e5e7eb`. Easing `cubic-bezier(.4,0,.2,1)`. Body 15px/21, nav 16px, labels 11–12px UPPERCASE, page titles clamp(40px → ~100px). xl breakpoint 1440px.

---

## File Structure

```
/app
  layout.tsx               # html/body, fonts, Header, Footer, CustomCursor
  globals.css              # Tailwind v4 import + @theme tokens + base styles
  page.tsx                 # Home (projects index)
  /projects/[slug]/page.tsx
  /projects/[category]/page.tsx
  /news/page.tsx
  /news/[tab]/page.tsx     # events | awards | lectures
  /about/page.tsx
  /sustainability/page.tsx
  /people/page.tsx
  /careers/page.tsx
  /contact/page.tsx
  not-found.tsx
/components
  header/Header.tsx Menu.tsx CategoryTabs.tsx Flyout.tsx CommandMenu.tsx
  footer/Footer.tsx Accordion.tsx BackToTop.tsx
  media/BlurImage.tsx CustomCursor.tsx
  motion/Reveal.tsx
  project/ProjectRow.tsx ProjectList.tsx ProjectMeta.tsx Gallery.tsx
  news/NewsArticle.tsx NewsTabs.tsx
  people/PeopleList.tsx
  careers/CareersPositions.tsx
  PageTitle.tsx Filters.tsx
/data
  categories.ts projects.ts news.ts people.ts offices.ts
/lib
  placeholder.ts           # deterministic gradient + LQIP data-URI generation
  slug.ts                  # slug → display name helpers
  hooks/useScrollReveal.ts
  hooks/useCommandMenu.ts
/test
  *.test.ts(x)
/public/cursors            # arrow-right.svg, arrow-right-slide.svg, pause.svg
```

---

## Phase 0 — Scaffold & Configuration

### Task 0.1: Initialize the Next.js project

**Files:**
- Create: project scaffold at repo root (`C:\Users\User\OneDrive\Desktop\mastudio clone`)

- [ ] **Step 1: Scaffold Next.js into the current directory**

The directory already contains `docs/` and reference PNGs. Scaffold into it (use `.` as the target). Run from repo root:

```bash
npx create-next-app@latest . --ts --tailwind --app --eslint --src-dir=false --import-alias "@/*" --use-npm --no-turbopack
```

When prompted that the directory is non-empty, choose to continue (the generator keeps existing non-conflicting files). If it refuses, scaffold into a temp dir `tmp-app` and move its contents into the root.

- [ ] **Step 2: Verify it runs**

Run: `npm run dev`
Expected: dev server starts on http://localhost:3000, default Next page renders. Stop the server (Ctrl+C) after confirming.

- [ ] **Step 3: Initialize git and commit the scaffold**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js + TypeScript + Tailwind app"
```

### Task 0.2: Install dev/test dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Vitest + Testing Library**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

- [ ] **Step 3: Create `test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add test script to `package.json`**

Add to `"scripts"`: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 5: Verify the test runner works**

Run: `npm test`
Expected: "No test files found" (exit 0) — runner is wired up.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add vitest + testing-library"
```

### Task 0.3: Fonts, tokens, and global styles

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Configure Geist in `app/layout.tsx`**

Replace the font setup with Geist (ships with create-next-app via `next/font/google` is not needed — use the `geist` package). Install it:

```bash
npm install geist
```

Then set `app/layout.tsx` head section:

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import CustomCursor from "@/components/media/CustomCursor";

export const metadata: Metadata = {
  title: "BIG | Bjarke Ingels Group",
  description: "A frontend replica of big.dk built for study.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-white text-black antialiased">
        <CustomCursor />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

(Header/Footer/CustomCursor are created in later tasks; stub them as empty components now so the app compiles — see Step 3.)

- [ ] **Step 2: Replace `app/globals.css` with Tailwind v4 theme tokens**

```css
@import "tailwindcss";

@theme {
  --color-white: #ffffff;
  --color-black: #000000;
  --color-big-gray: #898989;
  --color-hairline: #e5e7eb;
  --breakpoint-xl: 1440px;
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

:root {
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
}

html { scroll-behavior: smooth; }

body {
  font-size: 15px;
  line-height: 21px;
  letter-spacing: 0;
}

/* shared utility classes */
.label {
  font-size: 11px;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.meta { color: var(--color-big-gray); }

/* page title: huge clamp */
.page-title {
  font-size: clamp(40px, 8vw, 104px);
  line-height: 1;
  font-weight: 400;
  letter-spacing: -0.01em;
}
```

- [ ] **Step 3: Create temporary stubs so the app compiles**

Create these files with minimal content (replaced in later tasks):

`components/header/Header.tsx`:
```tsx
export default function Header() { return null; }
```
`components/footer/Footer.tsx`:
```tsx
export default function Footer() { return null; }
```
`components/media/CustomCursor.tsx`:
```tsx
export default function CustomCursor() { return null; }
```

- [ ] **Step 4: Replace `app/page.tsx` with a placeholder**

```tsx
export default function Home() {
  return <div className="p-10">Home placeholder</div>;
}
```

- [ ] **Step 5: Verify build + dev**

Run: `npm run dev` → open http://localhost:3000 → confirm white page, "Home placeholder", Geist font. Stop server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: fonts, design tokens, global styles, layout shell"
```

---

## Phase 1 — Core utilities & primitives

### Task 1.1: Slug + display-name helpers (TDD)

**Files:**
- Create: `lib/slug.ts`
- Test: `test/slug.test.ts`

- [ ] **Step 1: Write the failing test** — `test/slug.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { slugToTitle } from "@/lib/slug";

describe("slugToTitle", () => {
  it("title-cases a slug and preserves known acronyms", () => {
    expect(slugToTitle("eve-music-hall")).toBe("EVE Music Hall");
    expect(slugToTitle("copenhill")).toBe("CopenHill");
    expect(slugToTitle("big-hq")).toBe("BIG HQ");
    expect(slugToTitle("noma-2-0")).toBe("Noma 2.0");
    expect(slugToTitle("via-57-west")).toBe("VIA 57 West");
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- slug`
Expected: FAIL — `slugToTitle` not found.

- [ ] **Step 3: Implement `lib/slug.ts`**

```ts
const OVERRIDES: Record<string, string> = {
  "eve-music-hall": "EVE Music Hall",
  copenhill: "CopenHill",
  "big-hq": "BIG HQ",
  "noma-2-0": "Noma 2.0",
  "via-57-west": "VIA 57 West",
  "not-a-hotel-setouchi": "NOT A HOTEL Setouchi",
  "one-high-line": "One High Line",
  "the-plus": "The Plus",
  "the-spiral": "The Spiral",
  "the-drop": "The Drop",
  "the-impact": "The Impact",
  "lego-brand-house": "LEGO Brand House",
};

const SMALL = new Set(["of", "and", "the", "at", "in", "to", "for", "a", "an"]);

export function slugToTitle(slug: string): string {
  if (OVERRIDES[slug]) return OVERRIDES[slug];
  return slug
    .split("-")
    .map((w, i) => {
      if (/^\d+$/.test(w)) return w;
      if (i > 0 && SMALL.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test -- slug`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/slug.ts test/slug.test.ts
git commit -m "feat: slug-to-title helper with overrides"
```

### Task 1.2: Deterministic placeholder generator (TDD)

**Files:**
- Create: `lib/placeholder.ts`
- Test: `test/placeholder.test.ts`

Purpose: produce (a) a CSS linear-gradient string and (b) a tiny blur data-URI, both deterministic from a seed string, so imagery is original, offline, and stable across renders.

- [ ] **Step 1: Write the failing test** — `test/placeholder.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { gradientFor, blurDataURL, hashString } from "@/lib/placeholder";

describe("placeholder", () => {
  it("hashes deterministically", () => {
    expect(hashString("copenhill")).toBe(hashString("copenhill"));
    expect(hashString("a")).not.toBe(hashString("b"));
  });
  it("returns a grayscale linear-gradient", () => {
    const g = gradientFor("copenhill");
    expect(g).toMatch(/^linear-gradient\(/);
  });
  it("returns a base64 svg data URL for blur", () => {
    expect(blurDataURL("copenhill")).toMatch(/^data:image\/svg\+xml;base64,/);
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- placeholder`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/placeholder.ts`**

```ts
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// Two close grayscale stops + an angle, derived from the seed.
export function gradientFor(seed: string): string {
  const h = hashString(seed);
  const base = 30 + (h % 50); // 30..79 lightness
  const delta = 12 + ((h >> 4) % 18);
  const angle = h % 180;
  const c1 = `hsl(0 0% ${base}%)`;
  const c2 = `hsl(0 0% ${Math.min(base + delta, 92)}%)`;
  return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
}

export function blurDataURL(seed: string): string {
  const h = hashString(seed);
  const l = 35 + (h % 40);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8">` +
    `<rect width="8" height="8" fill="hsl(0,0%,${l}%)"/></svg>`;
  const b64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${b64}`;
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test -- placeholder`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/placeholder.ts test/placeholder.test.ts
git commit -m "feat: deterministic original placeholder generator"
```

### Task 1.3: BlurImage primitive

**Files:**
- Create: `components/media/BlurImage.tsx`

A placeholder "image" that renders the deterministic gradient with a blur-up fade-in, at a given aspect ratio. (Because content is placeholder, we render a styled `div` rather than `next/image`, but keep the blur-up motion + name label.)

- [ ] **Step 1: Implement `components/media/BlurImage.tsx`**

```tsx
"use client";
import { useState } from "react";
import { gradientFor } from "@/lib/placeholder";

export default function BlurImage({
  seed,
  label,
  ratio = "4 / 3",
  className = "",
  showLabel = false,
}: {
  seed: string;
  label?: string;
  ratio?: string;
  className?: string;
  showLabel?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={`relative overflow-hidden bg-neutral-200 ${className}`}
      style={{ aspectRatio: ratio }}
      ref={(el) => {
        if (el && !loaded) requestAnimationFrame(() => setLoaded(true));
      }}
    >
      <div
        className="absolute inset-0 transition-[opacity,filter] duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{
          backgroundImage: gradientFor(seed),
          opacity: loaded ? 1 : 0,
          filter: loaded ? "blur(0)" : "blur(12px)",
        }}
      />
      {showLabel && label && (
        <span className="label absolute bottom-2 left-2 text-white/80 mix-blend-difference">
          {label}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles** (used on Home later)

Run: `npx tsc --noEmit`
Expected: no type errors in this file.

- [ ] **Step 3: Commit**

```bash
git add components/media/BlurImage.tsx
git commit -m "feat: BlurImage placeholder primitive with blur-up"
```

### Task 1.4: Scroll-reveal hook + Reveal component

**Files:**
- Create: `lib/hooks/useScrollReveal.ts`
- Create: `components/motion/Reveal.tsx`

- [ ] **Step 1: Implement `lib/hooks/useScrollReveal.ts`**

```ts
"use client";
import { useEffect, useRef, useState } from "react";

export function useScrollReveal<T extends HTMLElement>(rootMargin = "0px 0px -10% 0px") {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, rootMargin]);
  return { ref, shown };
}
```

- [ ] **Step 2: Implement `components/motion/Reveal.tsx`**

```tsx
"use client";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";

export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, shown } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(.4,0,.2,1)] ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(18px)",
      }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Verify compile**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add lib/hooks/useScrollReveal.ts components/motion/Reveal.tsx
git commit -m "feat: scroll-reveal hook and Reveal wrapper"
```

### Task 1.5: Custom cursor

**Files:**
- Create: `public/cursors/arrow-right.svg`, `public/cursors/pause.svg`
- Replace: `components/media/CustomCursor.tsx`

- [ ] **Step 1: Create `public/cursors/arrow-right.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23" fill="black"/><path d="M18 24h12m0 0-5-5m5 5-5 5" stroke="white" stroke-width="2" fill="none"/></svg>
```

- [ ] **Step 2: Create `public/cursors/pause.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23" fill="black"/><rect x="19" y="18" width="3.5" height="12" fill="white"/><rect x="25.5" y="18" width="3.5" height="12" fill="white"/></svg>
```

- [ ] **Step 3: Replace `components/media/CustomCursor.tsx`**

A circular custom cursor that follows the pointer and switches variant when hovering elements marked `data-cursor="arrow"` or `data-cursor="pause"`. Hidden on touch devices.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";

type Variant = "none" | "arrow" | "pause";

export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<Variant>("none");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: MouseEvent) => {
      if (dot.current) {
        dot.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      const target = (e.target as HTMLElement)?.closest("[data-cursor]") as HTMLElement | null;
      setVariant((target?.dataset.cursor as Variant) ?? "none");
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] -ml-6 -mt-6 transition-opacity duration-200"
      style={{ opacity: variant === "none" ? 0 : 1 }}
    >
      <img
        src={variant === "pause" ? "/cursors/pause.svg" : "/cursors/arrow-right.svg"}
        width={48}
        height={48}
        alt=""
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify** — `npm run dev`, move mouse over the page; cursor dot appears only over `data-cursor` elements (none yet — will show on galleries later). Stop server.

- [ ] **Step 5: Commit**

```bash
git add public/cursors components/media/CustomCursor.tsx
git commit -m "feat: context-aware custom cursor"
```

---

## Phase 2 — Data layer

### Task 2.1: Categories data

**Files:**
- Create: `data/categories.ts`

- [ ] **Step 1: Implement `data/categories.ts`**

```ts
export type CategoryKey =
  | "architecture" | "interiors" | "landscape" | "planning" | "products";

export interface Category {
  key: CategoryKey;
  label: string;
  subcategories: string[];
}

export const CATEGORIES: Category[] = [
  { key: "architecture", label: "Architecture", subcategories: ["culture","education","work","hospitality","residential","infrastructure","space","sports","health"] },
  { key: "interiors", label: "Interiors", subcategories: [] },
  { key: "landscape", label: "Landscape", subcategories: ["civic-spaces","parks","gardens","balconies-and-terraces"] },
  { key: "planning", label: "Planning", subcategories: ["campus","city","region"] },
  { key: "products", label: "Products", subcategories: ["lighting","furniture","consumer-products","mobility","installations"] },
];
```

- [ ] **Step 2: Commit**

```bash
git add data/categories.ts
git commit -m "feat: category taxonomy data"
```

### Task 2.2: Projects data (the 34) + integrity test

**Files:**
- Create: `data/projects.ts`
- Test: `test/projects.test.ts`

Projects are derived deterministically from the captured slug list plus parallel metadata arrays, so all 34 are produced by code (no hand-entry placeholders). `lorem` body text is generated.

- [ ] **Step 1: Write the failing test** — `test/projects.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { PROJECTS, getProject } from "@/data/projects";

describe("projects data", () => {
  it("has exactly 34 projects", () => {
    expect(PROJECTS).toHaveLength(34);
  });
  it("every project has required fields", () => {
    for (const p of PROJECTS) {
      expect(p.slug).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.location).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.year).toBeGreaterThan(1990);
      expect(["Completed", "In Progress", "Competition"]).toContain(p.status);
      expect(p.ratio).toMatch(/\d+ \/ \d+/);
    }
  });
  it("slugs are unique", () => {
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(34);
  });
  it("getProject finds by slug", () => {
    expect(getProject("copenhill")?.name).toBe("CopenHill");
    expect(getProject("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- projects`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `data/projects.ts`**

```ts
import { slugToTitle } from "@/lib/slug";
import type { CategoryKey } from "@/data/categories";

export type Status = "Completed" | "In Progress" | "Competition";

export interface Project {
  slug: string;
  name: string;
  location: string;
  category: CategoryKey;
  typology: string;
  year: number;
  client: string;
  size: string;
  status: Status;
  ratio: string;        // hero aspect ratio
  description: string[]; // paragraphs (placeholder)
  gallery: string[];     // gallery image ratios
}

// First 34 slugs, in the live-site order.
const SLUGS = [
  "eve-music-hall","not-a-hotel-setouchi","gastronomy-open-ecosystem","citywave",
  "tennessee-performing-arts-center","east-side-coastal-resiliency","the-plus",
  "bloomberg-student-center-at-johns-hopkins-university","suzhou-museum-of-contemporary-art",
  "hamburg-state-opera","sankt-lukas-hospice-and-lukashuset","claremont-mckenna-college",
  "manresa-island","big-hq","gelephu-international-airport","the-impact",
  "gowanus-175-third-street","jinji-lake-pavilion","athletics-las-vegas-ballpark","the-drop",
  "gelephu-mindfulness-city","solar-one-environmental-education-center",
  "hungarian-natural-history-museum","new-dubai-masterplan",
  "ancient-future-bridging-bhutanese-tradition-and-innovation","fira-barcelona-business-hub",
  "opera-and-ballet-theatre-of-kosovo","copenhill","one-high-line","joint-research-center",
  "musee-atelier-audemars-piguet","the-spiral","lego-brand-house","noma-2-0",
];

// Parallel metadata (kept terse; values are plausible, not from BIG).
const LOCATIONS = [
  "Čepin, Croatia","Sagishima, Japan","San Sebastián, Spain","Milan, Italy","Nashville, USA",
  "New York, USA","Hokksund, Norway","Baltimore, USA","Suzhou, China","Hamburg, Germany",
  "Hellerup, Denmark","Claremont, USA","Norwalk, USA","Copenhagen, Denmark","Gelephu, Bhutan",
  "Quito, Ecuador","New York, USA","Suzhou, China","Las Vegas, USA","Riva, Turkey",
  "Gelephu, Bhutan","New York, USA","Budapest, Hungary","Dubai, UAE","Thimphu, Bhutan",
  "Barcelona, Spain","Pristina, Kosovo","Copenhagen, Denmark","New York, USA","Brussels, Belgium",
  "Le Brassus, Switzerland","New York, USA","Billund, Denmark","Copenhagen, Denmark",
];

const CATS: CategoryKey[] = [
  "architecture","architecture","architecture","architecture","architecture",
  "landscape","architecture","architecture","architecture","architecture",
  "architecture","architecture","planning","interiors","architecture",
  "architecture","architecture","architecture","architecture","architecture",
  "planning","architecture","architecture","planning","architecture",
  "architecture","architecture","architecture","architecture","architecture",
  "architecture","architecture","architecture","interiors",
];

const TYPOLOGIES = [
  "Culture","Hospitality","Culture","Residential","Culture","Infrastructure","Sports",
  "Education","Culture","Culture","Health","Education","Region","Work","Infrastructure",
  "Residential","Residential","Culture","Sports","Hospitality","City","Education",
  "Culture","City","Culture","Work","Culture","Infrastructure","Residential","Work",
  "Culture","Work","Culture","Hospitality",
];

const STATUSES: Status[] = SLUGS.map((_, i) =>
  i % 3 === 0 ? "Completed" : i % 3 === 1 ? "In Progress" : "Competition"
);

// Varied but deterministic hero ratios (mix of landscape/portrait).
const RATIOS = ["16 / 9","3 / 2","4 / 3","2 / 3","1 / 1","21 / 9","5 / 4","3 / 4"];

function lorem(seed: number, paras = 3): string[] {
  const BANK = [
    "The project reframes its site as a continuous public landscape, folding program and circulation into a single legible gesture.",
    "A clear structural logic lets the building read as one form while accommodating a wide range of uses within.",
    "Materials are kept honest and few, allowing daylight, texture, and the surrounding context to carry the experience.",
    "Sustainability is treated as a design driver rather than an add-on, shaping massing, envelope, and energy strategy.",
    "The result is an architecture that feels both inevitable and surprising — pragmatic in plan, generous in section.",
  ];
  return Array.from({ length: paras }, (_, i) => BANK[(seed + i) % BANK.length]);
}

export const PROJECTS: Project[] = SLUGS.map((slug, i) => ({
  slug,
  name: slugToTitle(slug),
  location: LOCATIONS[i],
  category: CATS[i],
  typology: TYPOLOGIES[i],
  year: 2017 + (i % 9),
  client: `Client ${String.fromCharCode(65 + (i % 26))}`,
  size: `${5 + ((i * 7) % 90)},000 m²`,
  status: STATUSES[i],
  ratio: RATIOS[i % RATIOS.length],
  description: lorem(i),
  gallery: Array.from({ length: 4 + (i % 4) }, (_, g) => RATIOS[(i + g) % RATIOS.length]),
}));

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function projectsByCategory(cat: string): Project[] {
  return PROJECTS.filter((p) => p.category === cat);
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test -- projects`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add data/projects.ts test/projects.test.ts
git commit -m "feat: 34-project data layer derived from live slugs"
```

### Task 2.3: News, People, Offices data

**Files:**
- Create: `data/news.ts`, `data/people.ts`, `data/offices.ts`
- Test: `test/data-misc.test.ts`

- [ ] **Step 1: Write the failing test** — `test/data-misc.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { NEWS } from "@/data/news";
import { PEOPLE, PARTNERS } from "@/data/people";
import { OFFICES } from "@/data/offices";

describe("misc data", () => {
  it("news has items with date/title/category", () => {
    expect(NEWS.length).toBeGreaterThanOrEqual(12);
    for (const n of NEWS) {
      expect(n.date).toMatch(/\d{2}\.\d{2}\.\d{4}/);
      expect(n.title).toBeTruthy();
      expect(["news", "events", "awards", "lectures"]).toContain(n.category);
    }
  });
  it("people include partners with roles", () => {
    expect(PARTNERS.length).toBeGreaterThan(5);
    expect(PEOPLE.every((p) => p.name && p.role)).toBe(true);
  });
  it("offices have a city", () => {
    expect(OFFICES.map((o) => o.city)).toContain("Copenhagen");
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- data-misc`
Expected: FAIL.

- [ ] **Step 3: Implement `data/offices.ts`**

```ts
export interface Office {
  city: string;
  label: string;
  address: string[];
  email: string;
}
export const OFFICES: Office[] = [
  { city: "Copenhagen", label: "BIG Copenhagen", address: ["Bryghuspladsen 8", "1473 Copenhagen", "Denmark"], email: "cph@example.com" },
  { city: "Barcelona", label: "BIG Barcelona", address: ["Carrer d'Àvila 138", "08018 Barcelona", "Spain"], email: "bcn@example.com" },
  { city: "London", label: "BIG London", address: ["1 Finsbury Avenue", "London EC2M 2PF", "United Kingdom"], email: "lon@example.com" },
  { city: "New York", label: "BIG New York", address: ["45 Main Street", "Brooklyn, NY 11201", "USA"], email: "nyc@example.com" },
  { city: "Shanghai", label: "BIG Shanghai", address: ["No. 1 Suzhou Creek", "Shanghai", "China"], email: "sha@example.com" },
  { city: "Los Angeles", label: "BIG Los Angeles", address: ["500 S Santa Fe Ave", "Los Angeles, CA", "USA"], email: "la@example.com" },
  { city: "Zürich", label: "BIG Zürich", address: ["Bahnhofstrasse 1", "8001 Zürich", "Switzerland"], email: "zur@example.com" },
  { city: "Bhutan", label: "BIG Bhutan", address: ["Gelephu", "Bhutan"], email: "bhutan@example.com" },
];
```

- [ ] **Step 4: Implement `data/people.ts`**

```ts
export type PeopleGroup =
  | "Partners" | "Associates/Directors"
  | "BIG Copenhagen" | "BIG Barcelona" | "BIG London" | "BIG New York"
  | "BIG Shanghai" | "BIG Los Angeles" | "BIG Zürich" | "BIG Bhutan";

export interface Person { name: string; role: string; group: PeopleGroup; }

const FIRST = ["Bjarke","Sheela","Agustin","Andreas","Andy","Beat","Brian","Catherine","Daniel","Daria","David","Finn","Frederik","Giulia","Hanna","Jakob","Kai-Uwe","Leon","Maria","Nanna","Oliver","Pauline","Qing","Ravi","Sofia","Tomas","Ulla","Viktor","Wei","Ximena"];
const LAST = ["Ingels","Søgaard","Perez-Torres","Pedersen","Young","Schenk","Yang","Huang","Sundlin","Stark","Zahle","Nørkjær","Lyng","Frittoli","Johansson","Lange","Bauer","Costa","Rossi","Holm","Park","Lavie","Chen","Patel","Marin","Minör","Berg","Novak","Zhang","Reyes"];
const OFFICE_CODES = ["CPH","BCN","LON","NYC","SHA","LA","ZUR","BHU"];

function mk(group: PeopleGroup, count: number, roleFor: (i: number) => string): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`,
    role: roleFor(i),
    group,
  }));
}

export const PARTNERS: Person[] = [
  { name: "Bjarke Ingels", role: "Founder", group: "Partners" },
  { name: "Sheela Maini Søgaard", role: "CEO, Partner, CPH", group: "Partners" },
  ...mk("Partners", 16, (i) => `Partner, ${OFFICE_CODES[i % OFFICE_CODES.length]}`),
];

export const PEOPLE: Person[] = [
  ...PARTNERS,
  ...mk("Associates/Directors", 24, (i) => `Associate, ${OFFICE_CODES[i % OFFICE_CODES.length]}`),
];

export const PEOPLE_GROUPS: PeopleGroup[] = [
  "Partners","Associates/Directors","BIG Copenhagen","BIG Barcelona","BIG London",
  "BIG New York","BIG Shanghai","BIG Los Angeles","BIG Zürich","BIG Bhutan",
];
```

- [ ] **Step 5: Implement `data/news.ts`** (≥16 generated items across categories)

```ts
import { PROJECTS } from "@/data/projects";

export type NewsCategory = "news" | "events" | "awards" | "lectures";
export interface NewsItem {
  id: string;
  date: string;     // DD.MM.YYYY
  title: string;
  excerpt: string;
  category: NewsCategory;
  ratio: string;
}

const VERBS = ["UNVEILS","COMPLETES","WINS","BREAKS GROUND ON","REVEALS","TOPS OUT","OPENS","ANNOUNCES"];
const CATS: NewsCategory[] = ["news","events","awards","lectures"];

export const NEWS: NewsItem[] = PROJECTS.flatMap((p, i) => {
  const day = String(((i * 3) % 27) + 1).padStart(2, "0");
  const month = String((i % 12) + 1).padStart(2, "0");
  return [{
    id: `${p.slug}-news`,
    date: `${day}.${month}.2026`,
    title: `BIG ${VERBS[i % VERBS.length]} ${p.name.toUpperCase()} IN ${p.location.split(",").pop()!.trim().toUpperCase()}`,
    excerpt:
      "A milestone for the project as the design moves into its next phase. " +
      "The announcement was shared with collaborators, partners, and the local community.",
    category: CATS[i % CATS.length],
    ratio: i % 2 ? "3 / 2" : "16 / 9",
  }];
});

export function newsByCategory(cat: NewsCategory | "all"): NewsItem[] {
  return cat === "all" ? NEWS : NEWS.filter((n) => n.category === cat);
}
```

- [ ] **Step 6: Run test, verify pass**

Run: `npm test -- data-misc`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add data/news.ts data/people.ts data/offices.ts test/data-misc.test.ts
git commit -m "feat: news, people, offices placeholder data"
```

---

## Phase 3 — Header (menu, category tabs, flyouts, command menu)

### Task 3.1: Command-menu filter logic (TDD)

**Files:**
- Create: `lib/hooks/useCommandMenu.ts` (pure filter function exported separately for testing)
- Create: `lib/search.ts`
- Test: `test/search.test.ts`

- [ ] **Step 1: Write the failing test** — `test/search.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { searchAll } from "@/lib/search";

describe("searchAll", () => {
  it("returns project + page matches for a query", () => {
    const res = searchAll("copen");
    expect(res.some((r) => r.label === "CopenHill")).toBe(true);
  });
  it("matches static pages", () => {
    const res = searchAll("about");
    expect(res.some((r) => r.href === "/about")).toBe(true);
  });
  it("returns empty for gibberish", () => {
    expect(searchAll("zzzqqq").length).toBe(0);
  });
  it("is case-insensitive", () => {
    expect(searchAll("SPIRAL").some((r) => r.label === "The Spiral")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- search`
Expected: FAIL.

- [ ] **Step 3: Implement `lib/search.ts`**

```ts
import { PROJECTS } from "@/data/projects";

export interface SearchResult {
  label: string;
  href: string;
  group: "Pages" | "Projects";
  sub?: string;
}

const PAGES: SearchResult[] = [
  { label: "Projects", href: "/", group: "Pages" },
  { label: "News", href: "/news", group: "Pages" },
  { label: "About", href: "/about", group: "Pages" },
  { label: "Sustainability", href: "/sustainability", group: "Pages" },
  { label: "People", href: "/people", group: "Pages" },
  { label: "Careers", href: "/careers", group: "Pages" },
  { label: "Contact", href: "/contact", group: "Pages" },
];

export function searchAll(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return PAGES;
  const pages = PAGES.filter((p) => p.label.toLowerCase().includes(q));
  const projects: SearchResult[] = PROJECTS.filter(
    (p) => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
  ).map((p) => ({ label: p.name, href: `/projects/${p.slug}`, group: "Projects", sub: p.location }));
  return [...pages, ...projects];
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test -- search`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/search.ts test/search.test.ts
git commit -m "feat: command-menu search logic"
```

### Task 3.2: Command Menu component (⌘K)

**Files:**
- Create: `components/header/CommandMenu.tsx`

- [ ] **Step 1: Implement `components/header/CommandMenu.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/header/CommandMenu.tsx
git commit -m "feat: ⌘K command menu"
```

### Task 3.3: Menu overlay + Category tabs + Flyout + Header assembly

**Files:**
- Create: `components/header/Menu.tsx`, `components/header/Flyout.tsx`, `components/header/CategoryTabs.tsx`
- Replace: `components/header/Header.tsx`

- [ ] **Step 1: Implement `components/header/Menu.tsx`**

```tsx
"use client";
import { useState } from "react";
import Link from "next/link";

const NAV = [
  { label: "Projects", href: "/" },
  { label: "News", href: "/news" },
  { label: "About", href: "/about" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "People", href: "/people" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export default function Menu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button aria-label="Menu" onClick={() => setOpen((o) => !o)}
        className="flex flex-col gap-[5px] p-1">
        <span className="block h-[2px] w-6 bg-black" />
        <span className="block h-[2px] w-6 bg-black" />
        <span className="block h-[2px] w-6 bg-black" />
      </button>
      <nav
        className="absolute left-0 top-full mt-3 flex flex-col gap-1 transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
            className="label hover:text-big-gray transition-colors">
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 2: Implement `components/header/Flyout.tsx`**

```tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import type { Category } from "@/data/categories";

export default function Flyout({ category }: { category: Category }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Link href={`/projects/${category.key}`} className="label hover:text-big-gray transition-colors">
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
```

- [ ] **Step 3: Implement `components/header/CategoryTabs.tsx`**

```tsx
import { CATEGORIES } from "@/data/categories";
import Flyout from "./Flyout";

export default function CategoryTabs() {
  return (
    <div className="hidden items-center gap-8 md:flex">
      {CATEGORIES.map((c) => <Flyout key={c.key} category={c} />)}
    </div>
  );
}
```

- [ ] **Step 4: Replace `components/header/Header.tsx`**

```tsx
import Link from "next/link";
import Menu from "./Menu";
import CategoryTabs from "./CategoryTabs";
import CommandMenu from "./CommandMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-[80] flex items-center justify-between gap-6 bg-white/90 px-5 py-4 backdrop-blur">
      <div className="flex items-center gap-5">
        <Link href="/" className="text-xl font-bold tracking-tight">BIG</Link>
        <Menu />
      </div>
      <CategoryTabs />
      <CommandMenu />
    </header>
  );
}
```

- [ ] **Step 5: Verify visually**

Run: `npm run dev`. On http://localhost:3000 confirm: BIG logo + hamburger (opens nav list), centered category tabs with hover flyouts, ⌘K opens the command menu and filters. Take a Playwright screenshot and compare header against `big-04-menu-open.png`. Stop server.

- [ ] **Step 6: Commit**

```bash
git add components/header
git commit -m "feat: header with menu, category flyouts, command menu"
```

---

## Phase 4 — Footer

### Task 4.1: Accordion + BackToTop + Footer

**Files:**
- Create: `components/footer/Accordion.tsx`, `components/footer/BackToTop.tsx`
- Replace: `components/footer/Footer.tsx`

- [ ] **Step 1: Implement `components/footer/Accordion.tsx`**

```tsx
"use client";
import { useState } from "react";

export default function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-hairline py-3">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between">
        <span className="text-[15px]">{title}</span>
        <span className="text-[18px] leading-none transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0)" }}>+</span>
      </button>
      <div className="grid transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement `components/footer/BackToTop.tsx`**

```tsx
"use client";
export default function BackToTop() {
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="label mt-8 hover:text-big-gray transition-colors">
      Back to top ↑
    </button>
  );
}
```

- [ ] **Step 3: Replace `components/footer/Footer.tsx`**

```tsx
import Accordion from "./Accordion";
import BackToTop from "./BackToTop";
import { OFFICES } from "@/data/offices";

const SOCIAL = [
  ["Instagram", "https://instagram.com"], ["X", "https://x.com"],
  ["LinkedIn", "https://linkedin.com"], ["Vimeo", "https://vimeo.com"],
  ["Facebook", "https://facebook.com"], ["WeChat", "#"],
];
const LEGAL = ["Privacy Policy", "Anti-Slavery Statement", "Sustainability Report", "Whistleblower Policy"];

export default function Footer() {
  return (
    <footer className="mt-24 px-5 pb-10">
      <div className="grid gap-x-10 md:grid-cols-4">
        <Accordion title="Email">
          {[["NEW PROJECTS","newbiz@example.com"],["PRESS","press@example.com"],
            ["LECTURES","lectures@example.com"],["EXHIBITIONS","exhibitions@example.com"]].map(([k,v]) => (
            <div key={k}><div className="label meta">{k}</div>
              <a href={`mailto:${v}`} className="text-[14px] hover:text-big-gray">{v}</a></div>
          ))}
        </Accordion>
        <Accordion title="Office">
          {OFFICES.map((o) => (
            <div key={o.city} className="mb-2">
              <div className="label">{o.label}</div>
              <div className="meta text-[13px]">{o.address.join(", ")}</div>
            </div>
          ))}
        </Accordion>
        <Accordion title="Social">
          {SOCIAL.map(([k, href]) => (
            <a key={k} href={href} className="text-[14px] hover:text-big-gray">{k}</a>
          ))}
        </Accordion>
        <Accordion title="Legal">
          {LEGAL.map((l) => <a key={l} href="#" className="text-[14px] hover:text-big-gray">{l}</a>)}
        </Accordion>
      </div>
      <BackToTop />
      <p className="meta label mt-6">Frontend study replica — not affiliated with BIG.</p>
    </footer>
  );
}
```

- [ ] **Step 4: Verify** — `npm run dev`, scroll to footer, expand each accordion (+ rotates to ×), "Back to top" smooth-scrolls. Stop server.

- [ ] **Step 5: Commit**

```bash
git add components/footer
git commit -m "feat: footer with accordions and back-to-top"
```

---

## Phase 5 — Home (projects index)

### Task 5.1: ProjectRow + ProjectList + Home page

**Files:**
- Create: `components/project/ProjectRow.tsx`, `components/project/ProjectList.tsx`, `components/PageTitle.tsx`
- Replace: `app/page.tsx`

- [ ] **Step 1: Implement `components/PageTitle.tsx`**

```tsx
export default function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="page-title px-5 pt-10 pb-8">{children}</h1>;
}
```

- [ ] **Step 2: Implement `components/project/ProjectRow.tsx`**

```tsx
import Link from "next/link";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";
import type { Project } from "@/data/projects";

export default function ProjectRow({ project }: { project: Project }) {
  return (
    <Reveal>
      <Link href={`/projects/${project.slug}`}
        className="group grid grid-cols-1 gap-3 border-t border-hairline px-5 py-6 md:grid-cols-[1fr_2fr] md:items-center">
        <div className="flex items-start gap-3">
          <span className="mt-1 inline-block h-6 w-6 shrink-0 bg-black" aria-hidden />
          <span>
            <span className="block text-[18px] leading-tight">{project.name}</span>
            <span className="label meta">{project.location}</span>
          </span>
        </div>
        <div className="overflow-hidden">
          <div className="transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.03]">
            <BlurImage seed={project.slug} ratio={project.ratio} />
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
```

- [ ] **Step 3: Implement `components/project/ProjectList.tsx`**

```tsx
import ProjectRow from "./ProjectRow";
import type { Project } from "@/data/projects";

export default function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="flex flex-col">
      {projects.map((p) => <ProjectRow key={p.slug} project={p} />)}
    </div>
  );
}
```

- [ ] **Step 4: Replace `app/page.tsx`**

```tsx
import ProjectList from "@/components/project/ProjectList";
import { PROJECTS } from "@/data/projects";

export default function Home() {
  return (
    <div className="pt-4">
      <ProjectList projects={PROJECTS} />
    </div>
  );
}
```

- [ ] **Step 5: Verify** — `npm run dev`, confirm the 34-row index with blur-up images that reveal on scroll, image scales on row hover. Playwright screenshot vs `big-01-homepage.png`. Stop server.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx components/project components/PageTitle.tsx
git commit -m "feat: home projects index with scroll-reveal rows"
```

---

## Phase 6 — Project detail

### Task 6.1: ProjectMeta + Gallery + detail page

**Files:**
- Create: `components/project/ProjectMeta.tsx`, `components/project/Gallery.tsx`
- Create: `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Implement `components/project/ProjectMeta.tsx`**

```tsx
import type { Project } from "@/data/projects";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <div className="label meta">{label}</div>
      <div className="label">{value}</div>
    </div>
  );
}

export default function ProjectMeta({ project }: { project: Project }) {
  return (
    <aside className="md:sticky md:top-24 md:self-start">
      <span className="mb-4 inline-block h-8 w-8 bg-black" aria-hidden />
      <h1 className="mb-1 text-[20px]">{project.name}</h1>
      <div className="label meta mb-6">{project.location}</div>
      <Field label="Year" value={String(project.year)} />
      <Field label="Client" value={project.client} />
      <Field label="Type" value={project.typology} />
      <Field label="Size" value={project.size} />
      <Field label="Status" value={project.status} />
    </aside>
  );
}
```

- [ ] **Step 2: Implement `components/project/Gallery.tsx`**

```tsx
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";

export default function Gallery({ seed, ratios }: { seed: string; ratios: string[] }) {
  return (
    <div className="flex flex-col gap-6" data-cursor="arrow">
      {ratios.map((r, i) => (
        <Reveal key={i}>
          <BlurImage seed={`${seed}-${i}`} ratio={r} />
        </Reveal>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Implement `app/projects/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { getProject, PROJECTS } from "@/data/projects";
import ProjectMeta from "@/components/project/ProjectMeta";
import Gallery from "@/components/project/Gallery";
import BlurImage from "@/components/media/BlurImage";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <article className="px-5 py-8">
      <div className="mb-6" data-cursor="arrow">
        <BlurImage seed={project.slug} ratio={project.ratio} />
      </div>
      <div className="grid gap-10 md:grid-cols-[260px_1fr]">
        <ProjectMeta project={project} />
        <div>
          <div className="mb-10 max-w-[60ch] space-y-4 text-[15px]">
            {project.description.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <Gallery seed={project.slug} ratios={project.gallery} />
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Verify** — visit `/projects/copenhill`: sticky meta sidebar, hero, body text, gallery; custom arrow cursor over images. Compare vs `big-02-project-detail.png`. Stop server.

- [ ] **Step 5: Commit**

```bash
git add components/project/ProjectMeta.tsx components/project/Gallery.tsx app/projects
git commit -m "feat: project detail page with sticky meta and gallery"
```

---

## Phase 7 — Category pages

### Task 7.1: Category index

**Files:**
- Create: `app/projects/[category]/page.tsx`

Note: This route and `[slug]` both sit under `/projects`. Since `[slug]` is `app/projects/[slug]`, a sibling `[category]` dynamic segment collides. Resolve by handling categories inside the same `[slug]` route: if the param matches a category key, render the category list; else render the project. Implement by **replacing** `app/projects/[slug]/page.tsx` to branch.

- [ ] **Step 1: Create `components/project/CategoryView.tsx`**

```tsx
import ProjectList from "./ProjectList";
import PageTitle from "@/components/PageTitle";
import { projectsByCategory } from "@/data/projects";
import { CATEGORIES } from "@/data/categories";

export default function CategoryView({ categoryKey }: { categoryKey: string }) {
  const cat = CATEGORIES.find((c) => c.key === categoryKey)!;
  return (
    <div>
      <PageTitle>{cat.label}</PageTitle>
      <ProjectList projects={projectsByCategory(categoryKey)} />
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/projects/[slug]/page.tsx` to branch on category**

Add near the top of the component, after resolving `slug`:

```tsx
import { CATEGORIES } from "@/data/categories";
import CategoryView from "@/components/project/CategoryView";
// ...
  const isCategory = CATEGORIES.some((c) => c.key === slug);
  if (isCategory) return <CategoryView categoryKey={slug} />;
```

And update `generateStaticParams` to include category keys:

```tsx
export function generateStaticParams() {
  return [
    ...PROJECTS.map((p) => ({ slug: p.slug })),
    ...CATEGORIES.map((c) => ({ slug: c.key })),
  ];
}
```

- [ ] **Step 3: Verify** — visit `/projects/architecture`, `/projects/interiors`: big title + filtered list. Category tab links and flyout "View all" navigate correctly. Stop server.

- [ ] **Step 4: Commit**

```bash
git add app/projects components/project/CategoryView.tsx
git commit -m "feat: category index pages via /projects/[slug] branch"
```

---

## Phase 8 — News

### Task 8.1: NewsArticle + NewsTabs + pages

**Files:**
- Create: `components/news/NewsArticle.tsx`, `components/news/NewsTabs.tsx`
- Create: `app/news/page.tsx`, `app/news/[tab]/page.tsx`

- [ ] **Step 1: Implement `components/news/NewsArticle.tsx`**

```tsx
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
```

- [ ] **Step 2: Implement `components/news/NewsTabs.tsx`**

```tsx
import Link from "next/link";

const TABS = [
  { label: "News", href: "/news" },
  { label: "Events", href: "/news/events" },
  { label: "Awards", href: "/news/awards" },
  { label: "Lectures", href: "/news/lectures" },
];

export default function NewsTabs({ active }: { active: string }) {
  return (
    <div className="flex flex-col gap-1 px-5">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href}
          className={`label ${active === t.label.toLowerCase() ? "text-black" : "meta"} hover:text-black`}>
          {active === t.label.toLowerCase() ? "■ " : ""}{t.label}
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Implement `app/news/page.tsx`**

```tsx
import PageTitle from "@/components/PageTitle";
import NewsTabs from "@/components/news/NewsTabs";
import NewsArticle from "@/components/news/NewsArticle";
import { newsByCategory } from "@/data/news";

export default function NewsPage() {
  return (
    <div>
      <PageTitle>News</PageTitle>
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <NewsTabs active="news" />
        <div className="px-5">
          {newsByCategory("news").map((n) => <NewsArticle key={n.id} item={n} />)}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement `app/news/[tab]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import PageTitle from "@/components/PageTitle";
import NewsTabs from "@/components/news/NewsTabs";
import NewsArticle from "@/components/news/NewsArticle";
import { newsByCategory, type NewsCategory } from "@/data/news";

const VALID: NewsCategory[] = ["events", "awards", "lectures"];

export function generateStaticParams() {
  return VALID.map((tab) => ({ tab }));
}

export default async function NewsTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  if (!VALID.includes(tab as NewsCategory)) notFound();
  const title = tab.charAt(0).toUpperCase() + tab.slice(1);
  return (
    <div>
      <PageTitle>{title}</PageTitle>
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <NewsTabs active={tab} />
        <div className="px-5">
          {newsByCategory(tab as NewsCategory).map((n) => <NewsArticle key={n.id} item={n} />)}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify** — `/news`, `/news/events`, `/news/awards`, `/news/lectures`: tabs switch, "Read more" expands. Compare vs `big-03-news.png`. Stop server.

- [ ] **Step 6: Commit**

```bash
git add components/news app/news
git commit -m "feat: news list with tabs and read-more expand"
```

---

## Phase 9–13 — Content pages (About, Sustainability, People, Careers, Contact)

### Task 9.1: About

**Files:**
- Create: `app/about/page.tsx`

- [ ] **Step 1: Implement `app/about/page.tsx`**

```tsx
import PageTitle from "@/components/PageTitle";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";

export default function AboutPage() {
  return (
    <div>
      <PageTitle>About</PageTitle>
      <div className="grid gap-8 px-5 md:grid-cols-2">
        <p className="text-[15px]">
          BIG is a frontend study replica. This page mirrors the structure of the original
          About page: an opening statement set in two columns, signed by the founder,
          followed by a gallery of studio imagery.
        </p>
        <p className="text-[15px]">
          The practice is described as a collective spanning architecture, landscape,
          engineering, product design, and planning. The text here is placeholder copy
          standing in for the original.
        </p>
      </div>
      <p className="label px-5 pt-6">Bjarke Ingels — Founder &amp; Creative Director</p>
      <div className="mt-12 grid grid-cols-2 gap-4 px-5 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Reveal key={i} delay={i * 40}><BlurImage seed={`about-${i}`} ratio="4 / 3" /></Reveal>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify** vs `big-05-about.png`. Commit:

```bash
git add app/about
git commit -m "feat: about page"
```

### Task 10.1: Sustainability

**Files:**
- Create: `app/sustainability/page.tsx`

- [ ] **Step 1: Implement `app/sustainability/page.tsx`**

```tsx
import PageTitle from "@/components/PageTitle";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";

const SECTIONS = ["Sustainable Manufacturing", "Material Health", "Energy & Carbon", "Biodiversity"];

export default function SustainabilityPage() {
  return (
    <div>
      <PageTitle>Sustainability</PageTitle>
      <div className="mx-auto max-w-[900px] px-5">
        <BlurImage seed="sustainability-hero" ratio="16 / 9" />
        {SECTIONS.map((s, i) => (
          <Reveal key={s}>
            <section className="border-t border-hairline py-10">
              <div className="label meta mb-3">{s}</div>
              <p className="max-w-[60ch] text-[15px]">
                Placeholder copy describing BIG&apos;s approach to {s.toLowerCase()},
                treated as a design driver shaping massing, envelope, and material choices.
              </p>
              <button className="label mt-3 hover:text-big-gray">Read more +</button>
              {i === 0 && <div className="mt-6"><BlurImage seed={`sus-${i}`} ratio="3 / 2" /></div>}
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify** vs `big-06-sustainability.png`. Commit:

```bash
git add app/sustainability
git commit -m "feat: sustainability page"
```

### Task 11.1: People (filterable)

**Files:**
- Create: `components/people/PeopleList.tsx`
- Create: `app/people/page.tsx`

- [ ] **Step 1: Implement `components/people/PeopleList.tsx`**

```tsx
"use client";
import { useState } from "react";
import { PEOPLE, PEOPLE_GROUPS, type Person, type PeopleGroup } from "@/data/people";

export default function PeopleList() {
  const [group, setGroup] = useState<PeopleGroup>("Partners");
  const list: Person[] = PEOPLE.filter((p) => p.group === group);
  return (
    <div className="grid gap-8 md:grid-cols-[220px_1fr]">
      <div className="flex flex-col gap-1 px-5">
        {PEOPLE_GROUPS.map((g) => (
          <button key={g} onClick={() => setGroup(g)}
            className={`label text-left ${g === group ? "text-black" : "meta"} hover:text-black`}>
            {g === group ? "■ " : ""}{g}
          </button>
        ))}
      </div>
      <div className="px-5">
        <div className="label meta mb-4">{group}</div>
        {list.map((p) => (
          <div key={p.name + p.role}
            className="flex items-center justify-between border-t border-hairline py-2">
            <span className="text-[16px]"><span className="meta">+ </span>{p.name}</span>
            <span className="label meta uppercase">{p.role}</span>
          </div>
        ))}
        {list.length === 0 && <p className="meta text-[14px]">No people in this office yet.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement `app/people/page.tsx`**

```tsx
import PageTitle from "@/components/PageTitle";
import PeopleList from "@/components/people/PeopleList";

export default function PeoplePage() {
  return (
    <div>
      <PageTitle>People</PageTitle>
      <PeopleList />
    </div>
  );
}
```

- [ ] **Step 3: Verify** vs `big-07-people.png` — filter switches list; roles right-aligned. Commit:

```bash
git add components/people app/people
git commit -m "feat: people page with group filter"
```

### Task 12.1: Careers

**Files:**
- Create: `components/careers/CareersPositions.tsx`
- Create: `app/careers/page.tsx`

- [ ] **Step 1: Implement `components/careers/CareersPositions.tsx`**

```tsx
import { OFFICES } from "@/data/offices";

const ROLES = ["Architect", "Senior Architect", "Landscape Architect", "BIM Specialist", "Communications Manager", "Project Leader"];

export default function CareersPositions() {
  const positions = ROLES.map((r, i) => ({ role: r, office: OFFICES[i % OFFICES.length].label }));
  return (
    <div className="px-5">
      <div className="label meta mb-4">Open Positions</div>
      {positions.map((p) => (
        <a key={p.role} href="#"
          className="flex items-center justify-between border-t border-hairline py-3 hover:text-big-gray">
          <span className="text-[16px]">{p.role}</span>
          <span className="label meta">{p.office}</span>
        </a>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Implement `app/careers/page.tsx`**

```tsx
import PageTitle from "@/components/PageTitle";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";
import CareersPositions from "@/components/careers/CareersPositions";
import { OFFICES } from "@/data/offices";

export default function CareersPage() {
  return (
    <div>
      <PageTitle>Careers</PageTitle>
      <div className="grid gap-8 px-5 md:grid-cols-2">
        <p className="text-[15px]">Placeholder intro describing the studio&apos;s journey across global offices and its culture of collaboration.</p>
        <p className="text-[15px]">Over the past decades the practice has grown organically; this copy stands in for the original careers statement.</p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-4 px-5 md:grid-cols-3">
        {OFFICES.slice(0, 3).map((o, i) => (
          <Reveal key={o.city} delay={i * 60}>
            <BlurImage seed={`careers-${o.city}`} ratio="3 / 2" label={o.label.toUpperCase()} showLabel />
          </Reveal>
        ))}
      </div>
      <div className="mt-16"><CareersPositions /></div>
    </div>
  );
}
```

- [ ] **Step 3: Verify** vs `big-08-careers.png`. Commit:

```bash
git add components/careers app/careers
git commit -m "feat: careers page with offices and positions"
```

### Task 13.1: Contact + not-found

**Files:**
- Create: `app/contact/page.tsx`, `app/not-found.tsx`

- [ ] **Step 1: Implement `app/contact/page.tsx`**

```tsx
import PageTitle from "@/components/PageTitle";
import { OFFICES } from "@/data/offices";

export default function ContactPage() {
  return (
    <div>
      <PageTitle>Contact</PageTitle>
      <div className="grid gap-8 px-5 md:grid-cols-3">
        {OFFICES.map((o) => (
          <div key={o.city} className="border-t border-hairline pt-3">
            <div className="label">{o.label}</div>
            <div className="meta text-[14px]">{o.address.join(", ")}</div>
            <a href={`mailto:${o.email}`} className="text-[14px] hover:text-big-gray">{o.email}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement `app/not-found.tsx`**

```tsx
import Link from "next/link";
export default function NotFound() {
  return (
    <div className="px-5 py-24">
      <h1 className="page-title">404</h1>
      <Link href="/" className="label hover:text-big-gray">Back to projects</Link>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/contact app/not-found.tsx
git commit -m "feat: contact and not-found pages"
```

---

## Phase 14 — Polish: responsive, route transitions, final verification

### Task 14.1: Responsive pass

**Files:**
- Modify: component classNames as needed.

- [ ] **Step 1: Audit at widths 375, 768, 1440** using Playwright `browser_resize`. Confirm: header collapses (category tabs hidden < md, menu still works), project rows stack, page titles clamp down, footer columns stack. Fix any overflow with Tailwind responsive classes.

- [ ] **Step 2: Verify** no horizontal scroll at 375px on every route.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: responsive adjustments across breakpoints"
```

### Task 14.2: Soft route transitions

**Files:**
- Create: `app/template.tsx`

- [ ] **Step 1: Implement `app/template.tsx`** (fades each route in)

```tsx
"use client";
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-[fadein_.4s_cubic-bezier(.4,0,.2,1)]">
      {children}
      <style>{`@keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
```

- [ ] **Step 2: Verify** — navigating between pages fades content in. Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/template.tsx
git commit -m "feat: soft client-side route transitions"
```

### Task 14.3: Full verification

- [ ] **Step 1: Run all unit tests**

Run: `npm test`
Expected: all suites PASS (slug, placeholder, projects, data-misc, search).

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build succeeds, all routes (including 34 project pages + 5 categories + news tabs) listed, no type errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Visual parity sweep** — `npm start`, then with Playwright screenshot each page at 1440px and compare side-by-side with the eight reference PNGs. Note any deviations and fix.

- [ ] **Step 5: Console check** — confirm no errors in the browser console on each route.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final verification pass for big.dk replica"
```

---

## Self-Review (completed by plan author)

**Spec coverage:** All spec sections map to tasks — stack/tokens (0.x), fonts (0.3), primitives BlurImage/Reveal/CustomCursor (1.x), data incl. 34 projects (2.x), header+menu+flyouts+⌘K (3.x), footer accordions+back-to-top (4.x), home (5), project detail (6), categories (7), news+tabs (8), about/sustainability/people/careers/contact (9–13), animations/responsive/transitions/verification (14). Custom cursor wired to galleries (6.2, data-cursor). Blur-up + scroll reveal used throughout.

**Placeholder scan:** No "TODO/TBD/handle edge cases" left; all code steps contain complete code; the 34 projects are produced by deterministic code, not hand-entry.

**Type consistency:** `Project`, `Person`, `NewsItem`, `Office`, `Category`, `SearchResult`, `CategoryKey` used consistently; `getProject`/`projectsByCategory`/`newsByCategory`/`searchAll` signatures match across producer and consumer tasks. `BlurImage` props (`seed`, `ratio`, `label`, `showLabel`) consistent across all usages. `/projects/[slug]` handles both project slugs and category keys (Phase 7) — no route collision.
