# MA Studio Responsive / Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the site render nicely on phones while leaving desktop layouts as-is — full-width landscape project photos on mobile, a fitted mobile project viewer, a proper mobile nav panel, a responsive intro emblem, and a responsive-overflow sweep.

**Architecture:** Almost entirely Tailwind responsive utilities (`md:`/`sm:` prefixes) layered onto existing components; one small state/markup change to the mobile menu and one measurement change to the intro morph. Desktop output is unchanged. Verification is primarily visual via Playwright at phone (390×844) and desktop (1440×900).

**Tech Stack:** Next.js 16.2.7 (App Router), React 19, Tailwind v4, Framer Motion 12, Vitest + Testing Library.

**Branch:** `feature/responsive-mobile` (already created).

---

## Key facts established during planning (do not re-derive)

- **jsdom does not apply Tailwind CSS.** Classes like `hidden`/`md:flex` have no effect in tests, so the existing `NavLinks` test finds the desktop links regardless of breakpoint or menu state — it stays green without changes.
- **The intro overlay is portaled to `document.body`** and centers correctly on mobile already; only the fixed `260` size and the morph's hard-coded `SIZE` need to become responsive/measured.
- **Header height is ~72px** on mobile (measured) — the mobile menu panel/backdrop anchor at `top-[72px]`.
- **`CustomCursor` already disables on touch** (`pointer: fine`) — no change.
- **Mobile breakpoint is `md` (768px)**; `sm` (640px) is also available (Tailwind v4 defaults; `md` is already used across the app).
- Test commands: `npm test`, `npx vitest run <file>`, `npm run lint`, `npm run build`. `@` → repo root.
- Existing tests must stay green; these are layout/CSS changes plus mobile-menu state and an intro measurement — no test rewrites needed.

---

## File structure

| File | Change |
| --- | --- |
| `components/project/ProjectRow.tsx` | Mobile landscape aspect; desktop full-screen unchanged |
| `components/viewer/ProjectStrip.tsx` | Mobile width-fit panels + hint copy |
| `components/header/NavLinks.tsx` | Mobile full-width menu panel + backdrop |
| `components/intro/IntroOverlay.tsx` | Responsive emblem size; morph measures real width |
| `components/header/SearchBar.tsx` | Narrower collapsed field on small phones |

---

## Task 1: Homepage project photos — responsive

**Files:** Modify `components/project/ProjectRow.tsx`

> Visual task — no new unit test; run the suite to guard against regressions.

- [ ] **Step 1: Make the image aspect responsive**

In `components/project/ProjectRow.tsx`, find the `<BlurImage>` and change its `className` line from:

```tsx
              className="h-[calc(100svh-140px)]"
```
to:
```tsx
              className="aspect-[16/10] md:aspect-auto md:h-[calc(100svh-140px)]"
```

Leave everything else (`ratio={null}`, `priority={hero}`, `sizes`) unchanged. (Mobile: full-width 16:10 landscape via `object-cover`. Desktop ≥768px: `aspect-auto` cancels the ratio and the fixed full-screen height applies.)

- [ ] **Step 2: Run the suite**

Run: `npm test`
Expected: PASS (no test targets ProjectRow directly).

- [ ] **Step 3: Commit**

```bash
git add components/project/ProjectRow.tsx
git commit -m "feat(mobile): full-width landscape project photos on phones; full-screen on desktop"
```

---

## Task 2: Project viewer filmstrip — mobile fit

**Files:** Modify `components/viewer/ProjectStrip.tsx`

> Visual task. Keep the horizontal filmstrip; on mobile make panels width-based with images fit-to-width (capped to strip height). Desktop unchanged.

- [ ] **Step 1: Update the hero panel**

In `components/viewer/ProjectStrip.tsx`, replace the hero `<section>` opening tag and its `<img>`:

Change:
```tsx
          <section className="relative h-full shrink-0" style={{ maxWidth: "min(88vw, 1100px)" }}>
            {images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={heroRef}
                src={images[0]}
                alt={project.name}
                className="h-full w-auto max-w-full object-contain"
                draggable={false}
              />
            )}
```
to:
```tsx
          <section className="relative flex h-full w-[88vw] shrink-0 items-center md:block md:w-auto" style={{ maxWidth: "min(88vw, 1100px)" }}>
            {images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={heroRef}
                src={images[0]}
                alt={project.name}
                className="h-auto max-h-full w-full max-w-full object-contain md:h-full md:w-auto"
                draggable={false}
              />
            )}
```

- [ ] **Step 2: Update the remaining image panels**

Change:
```tsx
          {images.slice(1).map((src, i) => (
            <section key={src} className="relative h-full shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${project.name} — ${i + 2}`} className="h-full w-auto object-contain" draggable={false} />
            </section>
          ))}
```
to:
```tsx
          {images.slice(1).map((src, i) => (
            <section key={src} className="relative flex h-full w-[88vw] shrink-0 items-center justify-center md:block md:w-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${project.name} — ${i + 2}`} className="h-auto max-h-full w-full object-contain md:h-full md:w-auto" draggable={false} />
            </section>
          ))}
```

- [ ] **Step 3: Update the hint copy for touch**

Change:
```tsx
              Scroll to move through the project — drag, use the wheel, or the arrow keys.
```
to:
```tsx
              Swipe through the project — or use the wheel and arrow keys.
```

- [ ] **Step 4: Run the suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/viewer/ProjectStrip.tsx
git commit -m "feat(mobile): fit project-viewer images to screen width on phones"
```

---

## Task 3: Mobile navigation menu

**Files:** Modify `components/header/NavLinks.tsx`

> Refactor the mobile menu into a full-width panel + backdrop. The existing `test/navlinks.test.tsx` is the regression guard (desktop links stay in the DOM, so it passes unchanged).

- [ ] **Step 1: Replace the entire contents of `components/header/NavLinks.tsx`**

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

      {/* Mobile hamburger + full-width drop panel */}
      <div className="md:hidden">
        <button
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="relative z-[72] flex flex-col gap-[5px] p-1"
        >
          <span className="block h-[2px] w-6 bg-black" />
          <span className="block h-[2px] w-6 bg-black" />
          <span className="block h-[2px] w-6 bg-black" />
        </button>
        {open && (
          <>
            <div
              className="fixed inset-x-0 bottom-0 top-[72px] z-[70] bg-black/20"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <nav className="fixed inset-x-0 top-[72px] z-[71] flex flex-col border-t border-hairline bg-white px-5 py-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-hairline py-3 text-[16px] last:border-b-0 hover:text-accent"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Run the NavLinks test + full suite**

Run: `npx vitest run test/navlinks.test.tsx` then `npm test`
Expected: PASS (desktop links remain in the DOM; jsdom ignores the responsive classes).

- [ ] **Step 3: Commit**

```bash
git add components/header/NavLinks.tsx
git commit -m "feat(mobile): full-width nav panel with backdrop and large tap targets"
```

---

## Task 4: Intro emblem — responsive size + accurate morph

**Files:** Modify `components/intro/IntroOverlay.tsx`

> Visual task. Make the emblem shrink on small phones and keep the fly-to-logo morph accurate by measuring the emblem's real width.

- [ ] **Step 1: Add an emblem ref**

In `components/intro/IntroOverlay.tsx`, add `useRef` to the React import:

Change:
```tsx
import { useEffect, useLayoutEffect, useState } from "react";
```
to:
```tsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
```

Inside the component, after the `target` state declaration, add:
```tsx
  const emblemRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 2: Measure the real emblem width in `finish()`**

Change:
```tsx
      const r = logo.getBoundingClientRect();
      setTarget({
        x: r.left + r.width / 2 - window.innerWidth / 2,
        y: r.top + r.height / 2 - window.innerHeight / 2,
        scale: r.width / SIZE,
      });
```
to:
```tsx
      const r = logo.getBoundingClientRect();
      const size = emblemRef.current?.offsetWidth ?? SIZE;
      setTarget({
        x: r.left + r.width / 2 - window.innerWidth / 2,
        y: r.top + r.height / 2 - window.innerHeight / 2,
        scale: r.width / size,
      });
```

- [ ] **Step 3: Make the emblem box responsive + attach the ref**

Change the inner emblem `motion.div`:
```tsx
      <motion.div
        className="relative"
        style={{ width: SIZE, height: SIZE }}
        animate={
```
to:
```tsx
      <motion.div
        ref={emblemRef}
        className="relative"
        style={{ width: "min(260px, 78vw)", height: "min(260px, 78vw)" }}
        animate={
```

(The `SIZE` constant is still used as the fallback in `finish()` and the SVG `viewBox="0 0 260 260"` is unchanged — the SVG scales to whatever box size the emblem renders at.)

- [ ] **Step 4: Run the suite + lint**

Run: `npx vitest run test/introoverlay.test.tsx` then `npm run lint`
Expected: intro tests PASS (3); lint clean.

- [ ] **Step 5: Commit**

```bash
git add components/intro/IntroOverlay.tsx
git commit -m "feat(mobile): responsive intro emblem; morph measures real emblem width"
```

---

## Task 5: Header search — small-phone width

**Files:** Modify `components/header/SearchBar.tsx`

> Visual safeguard so the collapsed field never crowds the logo + hamburger on a ~360px phone.

- [ ] **Step 1: Narrow the collapsed width below `sm`**

In `components/header/SearchBar.tsx`, find the collapsed/focused width classes:
```tsx
          focused ? "w-[320px] max-w-[60vw]" : "w-[180px]"
```
Change to:
```tsx
          focused ? "w-[320px] max-w-[60vw]" : "w-[150px] sm:w-[180px]"
```

- [ ] **Step 2: Run the suite**

Run: `npm test`
Expected: PASS (the SearchBar tests assert chips/results, not width).

- [ ] **Step 3: Commit**

```bash
git add components/header/SearchBar.tsx
git commit -m "feat(mobile): narrower collapsed search field on small phones"
```

---

## Task 6: Final verification + responsive sweep

**Files:** none up front (controller applies any fixes the sweep surfaces)

- [ ] **Step 1: Full suite**

Run: `npm test`
Expected: PASS — all existing suites green.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Mobile + desktop visual sweep with Playwright**

At **390×844 (phone)** capture and confirm:
1. Homepage — each project image is full-width landscape (whole composition visible), label above; no horizontal scroll.
2. Intro — green emblem centered and sized to fit; fades + flies to the header logo.
3. Mobile menu — full-width panel below the header with large links + backdrop; doesn't overlap content; closes on tap/backdrop.
4. Project viewer — open a project; landscape images fit the screen width, swipeable; close works.
5. About / CoFounders / Contact / Footer — readable, single/▢-column, no overflow. CoFounders blur-reveal bio readable.

Then at **360px** and **414px** confirm **no horizontal scroll** on the homepage and header (search + hamburger fit).

At **1440×900 (desktop)** confirm the homepage full-screen photos, intro, menu (inline links), and viewer are **unchanged**.

- [ ] **Step 5: Fix anything the sweep surfaces**

If a page overflows or a layout breaks at mobile widths, apply the minimal Tailwind responsive fix (e.g., reduce a fixed width, add a `flex-wrap`, adjust padding) and re-verify. Commit:

```bash
git add -A
git commit -m "fix(mobile): responsive polish from visual sweep"
```
(Skip if the working tree is clean.)

---

## Self-review (completed by plan author)

- **Spec coverage:** homepage photos (Task 1) ✓ · project viewer (Task 2) ✓ · mobile menu (Task 3) ✓ · intro responsive + morph (Task 4) ✓ · header search width (Task 5) ✓ · responsive audit/sweep across About/CoFounders/Contact/Footer + overflow checks (Task 6) ✓.
- **Placeholder scan:** all steps contain concrete code/classes; the only open-ended part is the Task 6 sweep, which is explicitly a verify-and-fix-if-needed step with a concrete fix pattern.
- **Type/name consistency:** `emblemRef` defined (Task 4 Step 1) and used (Steps 2–3); `SIZE` retained as fallback; responsive classes use existing breakpoints (`md`, `sm`); desktop classes preserved so desktop output is unchanged.
- **Test safety:** no test rewrites; jsdom ignores Tailwind so NavLinks/SearchBar/intro tests stay green.
```
