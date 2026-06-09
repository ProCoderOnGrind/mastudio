# MA Studio — Project Viewer Polish

**Date:** 2026-06-09
**Status:** Approved (design); pending implementation plan
**Stack:** Next.js 16.2.7 (App Router), React 19, Tailwind v4, Vitest + Testing Library
**Branch:** `feature/viewer-polish` (off `master`)

## Goal

Make opening and moving through a project feel smoother: a clean fade + scale-up "appear" instead of the card→fullscreen morph, a phone photo layout that feels big and full instead of small with blank bands, and a "Next project" link at the end with a crossfade transition.

## Current state

- `components/viewer/ProjectViewer.tsx` — fullscreen dialog. **Open** = FLIP morph: the clicked card's hero image scales/translates from its rect to fullscreen (~1s) while the white backdrop + content fade in. **Close** = fade + scale-down 0.96. Uses `heroRef` + `rect` (from `ViewerContext`).
- `components/viewer/ProjectStrip.tsx` — horizontal swipe filmstrip (hero image, info column, remaining images, progress bar). Used by both `ProjectViewer` (with `heroRef`) and `ProjectPageView` (direct `/projects/[slug]` loads). On mobile, images are `object-contain` fit-to-width → small, centered, with large blank bands; the info column is a sparse extra panel.
- `components/viewer/ViewerContext.tsx` — `open(project, rect)`, `close()`, plus `OriginRect`.
- `data/projects.ts` — `nextProject(slug)` returns the next project, wrapping at the end (already unit-tested).

## Requirements & design

### 1. Open animation — fade + scale-up appear (desktop + mobile)

- Remove the card→fullscreen FLIP (`heroRef`/`rect`). On open, the white backdrop fades in (~400ms) while the stage scales from `0.94 → 1` and fades `0 → 1` (~500ms), easing `cubic-bezier(0.22, 1, 0.36, 1)` (the existing `EASE`). Close stays as the current fade + scale-down 0.96.
- `ProjectViewer` tracks the previously-shown slug so it can distinguish **first open** (appear) from a **project change** while open (crossfade — see §3).

### 2. Phone photo structure — keep the horizontal swipe, enlarge with a blurred fill

- Each image panel on mobile becomes **full viewport width** (`w-screen`) with a **blurred, dimmed fill** of the same image behind the crisp `object-contain` image:
  - fill: `<img aria-hidden>` absolutely covering the panel, `object-cover scale-110 blur-2xl brightness-[.45]`, `md:hidden`.
  - crisp image: `relative z-[1] object-contain` (whole composition), `md:h-full md:w-auto` on desktop.
  - panel: `overflow-hidden` to clip the scaled blur.
- The photo now feels full-bleed and bigger while the entire composition stays visible; no blank bands.
- **Meta on the hero, not a separate panel:** the standalone info column becomes `hidden md:flex` (desktop only). On mobile, the hero overlay shows the title, location, **and** a compact `Type · Year` line (`md:hidden`) so there's no sparse info screen to swipe past.
- **Desktop filmstrip is unchanged** (full-height `md:h-full md:w-auto` images, info column).

### 3. "Next project" link + crossfade

- Add a final **"Next project →"** panel at the end of the filmstrip showing `next.name`, where `next = nextProject(project.slug)`.
- `ProjectStrip` gains an optional `onNext?: () => void` prop:
  - **In the viewer** (`onNext` provided): the panel is a `<button onClick={onNext}>`. `ProjectViewer.goNext()` fades the stage to `0` (~200ms), then calls `open(next, …)`; the project-change branch fades the new stage back in (~280ms) — a crossfade, with the backdrop held. (Re-pushes history via `open`.)
  - **On the standalone page** (`onNext` absent): the panel is a `<Link href={'/projects/' + next.slug}>` (normal navigation).

### 4. Cleanup

- Drop the now-unused FLIP wiring: remove `rect`/`OriginRect` from `ViewerContext` (`open(project)` only) and the rect computation in `components/project/ProjectRow.tsx` (its click handler just calls `open(project)` and `preventDefault`s).
- `ProjectPageView.tsx` keeps rendering `ProjectStrip` (no `onNext`) so the "Next" panel is a link on direct loads.

## Files

| File | Change |
| --- | --- |
| `components/viewer/ProjectViewer.tsx` | Appear (fade+scale) open; crossfade `goNext`; pass `onNext`; remove FLIP/heroRef |
| `components/viewer/ProjectStrip.tsx` | Mobile blurred-fill panels; meta-on-hero (mobile); info column desktop-only; `onNext` prop + "Next project" end panel |
| `components/viewer/ViewerContext.tsx` | `open(project)` only; remove `rect`/`OriginRect` |
| `components/project/ProjectRow.tsx` | `open(project)`; remove rect computation/`imgWrap` |
| `components/viewer/ProjectPageView.tsx` | Unchanged behavior (renders `ProjectStrip` without `onNext`) |

## Testing

- **Unit:** keep all existing tests green. Add `test/projectstrip.test.tsx`: rendering `ProjectStrip` for a real project **without** `onNext` shows a "Next project" link whose `href` is `/projects/${nextProject(slug).slug}`; **with** `onNext`, clicking the "Next project" control calls the handler. (`nextProject` wrap-around is already covered in `test/projects.test.ts`.)
- **Visual (Playwright):** phone (390) + desktop (1440): open animation (smooth fade+scale, no morph jank); phone blurred-fill enlargement (photo big, no blank bands, meta on hero); "Next project" panel at the end; crossfade to the next project in the viewer; close still works.

## Out of scope

- Desktop layout redesign (filmstrip stays).
- A vertical mobile gallery (user chose to keep the horizontal swipe).
- New content; the standalone `/projects/[slug]` page's own entrance animation (it already fades via `template.tsx`).
