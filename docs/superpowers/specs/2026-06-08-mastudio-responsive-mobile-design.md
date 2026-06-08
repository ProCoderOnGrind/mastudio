# MA Studio — Responsive / Mobile Adaptation

**Date:** 2026-06-08
**Status:** Approved (design); pending implementation plan
**Stack:** Next.js 16.2.7 (App Router), React 19, Tailwind v4, Framer Motion 12, Vitest + Testing Library (jsdom)
**Branch:** new feature branch off `master`

## Goal

Make the whole site render nicely on phones as well as desktop. Desktop layouts stay as-is; mobile gets targeted fixes. Priority items: the full-screen homepage project photos (which over-crop on a portrait phone) and the intro/starter animation. Plus the project viewer, the mobile nav menu, and a responsive sweep of the remaining pages.

## Current mobile findings (from Playwright at 390×844)

- Header fits (logo + hamburger + search), no horizontal overflow.
- **Mobile nav menu** is a small dropdown anchored to the hamburger; it overlaps the page content and has tiny tap targets.
- Search panel on mobile fits (chips + results).
- **Homepage project images** use `h-[calc(100svh-140px)]` for all breakpoints → on a phone a wide photo renders as a 335×704 portrait slice (heavy crop).
- **Intro** centers correctly (the `body`-portal fix carries to mobile); the 260px emblem is fine at 390px but tight on smaller phones, and the morph scale uses a hard-coded 260.
- `CustomCursor` already disables on touch (`pointer: fine`).
- **Project viewer** (`ProjectStrip`) lays images out at full *height* (`h-full w-auto`) in a horizontal strip → on a portrait phone each landscape image is a very wide, full-height panel you can only see a vertical slice of.

## Requirements & design

### 1. Homepage project photos — `components/project/ProjectRow.tsx`

- **Mobile (`< md`):** full-width image at a landscape aspect so the whole composition shows; the name label stays stacked above (grid is already single-column below `md`).
- **Desktop (`≥ md`):** unchanged full-screen height.
- Implementation: change the image's `className` from `h-[calc(100svh-140px)]` to:
  `aspect-[16/10] md:aspect-auto md:h-[calc(100svh-140px)]`
  Keep `ratio={null}`, `priority={hero}` (first image only), `sizes="(max-width: 768px) 100vw, 80vw"`. `object-cover` is already applied by `BlurImage`. Verify the crop live; if a 16:9 source crops noticeably, switch the mobile aspect to `aspect-[16/9]`.

### 2. Project viewer filmstrip — `components/viewer/ProjectStrip.tsx`

- Keep the horizontal swipe filmstrip on mobile, but make panels **width-based** with images that **fit the width** (capped to the strip height) so a landscape photo roughly fills the screen.
- **Hero panel:** add mobile width + vertical centering; image fits width on mobile, full-height on desktop.
  - section: `relative flex h-full w-[88vw] shrink-0 items-center md:block md:w-auto` (keep `style={{ maxWidth: "min(88vw, 1100px)" }}`).
  - image: `h-auto w-full max-h-full object-contain md:h-full md:w-auto max-w-full`.
- **Other image panels:** section `relative flex h-full w-[88vw] shrink-0 items-center justify-center md:block md:w-auto`; image `h-auto w-full max-h-full object-contain md:h-full md:w-auto`.
- Info column `w-[clamp(220px,22vw,300px)]` is fine. Update the hint copy from "Scroll to move through the project — drag, use the wheel, or the arrow keys." to "Swipe through the project — or use the arrow keys." (drag/swipe works on touch already).

### 3. Mobile navigation menu — `components/header/NavLinks.tsx`

- Replace the cramped `absolute` dropdown with a **fixed full-width panel** below the header plus a backdrop:
  - hamburger: add `aria-expanded={open}`; it toggles open/closed.
  - when `open`: render a backdrop `fixed inset-x-0 top-[72px] bottom-0 z-[70] bg-black/20` (closes on tap) and a panel `fixed inset-x-0 top-[72px] z-[71] flex flex-col border-t border-hairline bg-white px-5 py-2` with each link as a large row (`py-3 text-[16px] border-b border-hairline/...`), closing on tap.
  - `top-[72px]` matches the measured header height; verify and adjust if needed.
- Desktop inline links (`hidden md:flex`) unchanged. The four `Link`s with correct hrefs remain in the DOM on desktop, so the existing NavLinks test (which matches links by name/href) still passes whether or not the mobile panel is open.

### 4. Intro animation — `components/intro/IntroOverlay.tsx`

- Make the emblem responsive: set the emblem box to `min(260px, 78vw)` (string inline style) so it never crowds small phones.
- Attach a ref to the emblem element and, in `finish()`, compute the fly-to-logo scale from the emblem's **actual** rendered width (`emblemRef.current?.offsetWidth ?? 260`) instead of the hard-coded `SIZE`, so the morph lands correctly at any size.
- Everything else (portal to `body`, ring text, green, once-per-session, reduced-motion) unchanged.

### 5. Responsive audit & polish

- Sweep at 360 / 390 / 414px: confirm **no horizontal scroll** and readable layout on:
  - **About** — `md:grid-cols-2/4` collapse to 1–2 cols; accordions full-width.
  - **CoFounders** — `md:grid-cols-2` → 1 col; FounderCard portrait + blur-reveal bio readable (bump bio text if cramped).
  - **Contact** — `md:grid-cols-3` → 1 col.
  - **Footer** — `md:grid-cols-4` → stacked accordions.
  - **Header search** (`SearchBar`) — ensure the collapsed (`w-[180px]`) and focused (`w-[320px] max-w-[60vw]`) field never overflow next to the logo + hamburger on a ~360px phone; if it does, reduce the mobile collapsed width (e.g. `w-[150px] md:w-[180px]`).
- Fix only what the sweep surfaces; no desktop redesigns.

## Files

| File | Change |
| --- | --- |
| `components/project/ProjectRow.tsx` | Mobile landscape aspect, desktop full-screen |
| `components/viewer/ProjectStrip.tsx` | Mobile width-fit panels; hint copy |
| `components/header/NavLinks.tsx` | Mobile full-width menu panel + backdrop |
| `components/intro/IntroOverlay.tsx` | Responsive emblem size; morph measures real width |
| `components/header/SearchBar.tsx` | Collapsed-width tweak only if it overflows on small phones |
| (audit) `app/about`, `app/cofounders`, `app/contact`, `components/footer/Footer.tsx` | Fix any overflow found; likely no change |

## Testing

- **Unit:** keep all existing tests green. The NavLinks test still passes (desktop links remain in the DOM). No new behavior tests required; changes are layout/CSS plus the menu's open state and the intro width measurement.
- **Visual (primary):** Playwright at **390×844 (phone)** and **1440×900 (desktop)** — screenshots of: homepage (mobile landscape photos + desktop full-screen unchanged), intro (both sizes), mobile menu open, project viewer opened (mobile fitted + desktop unchanged), About, CoFounders, Contact, Footer. Confirm no horizontal overflow at 360/390/414px.

## Out of scope

- New content or copy (beyond the viewer hint).
- Desktop layout redesigns.
- Tablet-specific tuning beyond what `md:` already provides.
- Real founder photos.
