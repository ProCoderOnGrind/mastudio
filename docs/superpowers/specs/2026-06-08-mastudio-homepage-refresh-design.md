# MA Studio Homepage Refresh — Design

**Date:** 2026-06-08
**Status:** Approved (design); pending implementation plan
**Stack:** Next.js 16.2.7 (App Router, Turbopack), React 19, Tailwind v4, Framer Motion 12

## Goal

Refresh the MA Studio clone homepage with: a cleaner top navigation, a redesigned
inline search that absorbs the project categories, a one-time intro logo-loading
animation, tighter first-glance photo sizing, and a new CoFounders page.

## Current state (baseline)

- **Header** (`components/header/Header.tsx`): logo + hamburger `Menu` (Projects/About/Contact)
  on the left, center `CategoryTabs` → `Flyout` showing Residential · Hospitality · Culture ·
  Masterplan · Commercial, and a bordered `CommandMenu` "Search ⌘K" pill on the right.
- **Search** (`components/header/CommandMenu.tsx`): button opens a centered modal with an
  input + results list. Backed by `lib/search.ts` (`searchAll`) over `PROJECTS`.
- **Categories** (`data/categories.ts`): 5 categories; `categoryForType` maps a project's
  type string to a category key.
- **Homepage** (`app/page.tsx` → `ProjectList` → `ProjectRow`): each project is a
  `md:grid-cols-[1fr_2fr]` row, text label left, image right (`BlurImage`, ratio 16/9,
  `max-h-[46vh]`), inside `px-5` page padding. ~1.5 images are visible before scrolling.
- **No** intro animation; **no** CoFounders page.
- The header logo is `public/mastudio/logo-dark.png`: an orange ring with "Modelling
  Architecture" curved around it and "MA / Studio & Partners" in the center.

## Requirements & design

### 1. Header & navigation

- Desktop header: **logo (left) · Projects · About · Contact · CoFounders · [search] (right)**.
  The center category tabs and the desktop hamburger are removed.
- Mobile: a hamburger holds the same four links plus a search trigger.
- Routes: `Projects → /`, `About → /about`, `Contact → /contact`, `CoFounders → /cofounders`.
- New component `components/header/NavLinks.tsx` (the four links, responsive). `Menu.tsx`,
  `CategoryTabs.tsx`, and `Flyout.tsx` are removed once no longer referenced.

### 2. Search — inline expanding field with categories inside

- Replace the "Search ⌘K" pill with a **real slim text input** in the header (magnifier icon,
  placeholder "Search…"). New component `components/header/SearchBar.tsx` (replaces
  `CommandMenu` usage; `CommandMenu.tsx` removed).
- On focus, the field **widens** and a panel drops beneath it containing:
  - the **5 category chips** (Residential · Hospitality · Culture · Masterplan · Commercial), and
  - **live results** (`searchAll(q)`) — projects by name/location and the static pages.
- Keyboard: `⌘K` / `Ctrl+K` focuses the field; `Esc` blurs/closes; arrow/enter optional.
- **Category behavior:** clicking a chip navigates to the homepage filtered by that category
  via `/?category=<key>`. The homepage shows a small "Residential ✕" clear pill that links
  back to `/`. Search-result clicks still navigate to the project/page.

### 3. Intro logo-loading animation (once per session, skippable)

- On a fresh session, a **full-screen white overlay** covers the homepage with the emblem
  **centered**. New client component `components/intro/IntroOverlay.tsx`, mounted in
  `app/layout.tsx`; driven by Framer Motion.
- The emblem is recreated as two layers so the ring can move independently:
  - **Static center:** "MA" (large) + "Studio & Partners" (small), matching the logo.
  - **Spinning ring:** an SVG `textPath` circle of the brand wordmark
    ("MODELLING ARCHITECTURE · MA STUDIO & PARTNERS · ") in the accent orange, **rotating**
    like a loader (~2.5–3s, or until ready).
- Then the white layer **fades out** to reveal the homepage while the emblem **scales down and
  translates** to the header's logo slot, handing off to the real `logo-dark.png` so the final
  resting position is pixel-accurate.
- **Persistence:** `sessionStorage` flag — plays on a fresh session/tab, skipped on internal
  navigation. A click or scroll **skips** to the end immediately.
- **Accessibility:** `prefers-reduced-motion` → no spin/morph; overlay resolves instantly.
- Plays on the homepage only.

### 4. Homepage photos

- **One photo per glance:** the **first** project image is sized to fill the viewport minus the
  sticky header so the second project begins just below the fold. Subsequent rows keep current
  sizing. Implemented via a "hero-first" variant in `ProjectRow`/`ProjectList` (e.g. the first
  row's image height ≈ `calc(100svh - <header>)`).
- **Symmetric width:** widen the image so the gap on its **left** (to the text block) equals the
  gap on its **right** (to the screen edge). Tuned **by eye via screenshots**; **reverted if the
  crop or sharpness suffers** (per user instruction — quality wins over the rule).

### 5. CoFounders page (`/cofounders`)

- New route `app/cofounders/page.tsx`, styled like `app/about/page.tsx`: a `PageTitle` plus a
  grid of **two co-founder cards** — portrait placeholder (`BlurImage`), name, role, short bio.
- **Editable placeholder content only** — no invented real-person bios; the user supplies real
  names/photos/text later.

## Components touched

| File | Change |
| --- | --- |
| `components/header/Header.tsx` | New layout: logo · NavLinks · SearchBar |
| `components/header/NavLinks.tsx` | **New** — 4 responsive nav links + mobile hamburger |
| `components/header/SearchBar.tsx` | **New** — inline expanding search + category chips |
| `components/header/Menu.tsx`, `CategoryTabs.tsx`, `Flyout.tsx`, `CommandMenu.tsx` | Removed once unreferenced |
| `components/intro/IntroOverlay.tsx` | **New** — intro animation (Framer Motion) |
| `app/layout.tsx` | Mount `IntroOverlay` |
| `components/project/ProjectRow.tsx`, `ProjectList.tsx` | Hero-first sizing + symmetric width; category filter support |
| `app/page.tsx` | Read `?category` search param, filter list, render clear pill |
| `app/cofounders/page.tsx` | **New** page |
| `lib/search.ts` | Reused as-is (extend if needed for category results) |

## Out of scope

- Real co-founder names, photos, and bios (placeholders only).
- Re-cropping or replacing project imagery.
- Any change beyond the five features above.

## Risks / notes

- **Logo morph fidelity:** the recreated SVG emblem must visually match `logo-dark.png` closely
  enough that the hand-off to the header logo reads as seamless; verify with screenshots.
- **Header space:** the 4 links + inline search must fit without crowding at ~1280–1440px;
  collapse gracefully below `md`.
- **One-photo sizing** depends on the actual sticky-header height; measure and verify on the
  running app rather than assuming a fixed value.
