# Design: Mobile search fix, Contact redesign, Viewer open animation

**Date:** 2026-06-09
**Status:** Approved (pending spec review)

Three independent, focused changes to the MA Studio clone:

1. Fix mobile search category taps (+ bigger touch targets)
2. Redesign the Contact page (oversized-type direction)
3. Make the project opening animation a mirror of the closing animation

Each is small and self-contained; they share no state and can be implemented and reviewed independently.

---

## 1. Mobile search category tap fix

### Current behavior
`components/header/SearchBar.tsx` renders category chips as Next.js `<Link>`s inside a dropdown that is only mounted while the input is `focused`. Dismissal relies on the input's `onBlur` scheduling `close()` after 120ms, and the panel uses `onMouseDown={e => e.preventDefault()}` to keep focus on desktop.

`app/page.tsx` already reads `?category=<key>` and filters via `projectsByCategory` — the filtering target works; only the tap to get there fails on touch.

### Problem
On touch devices, tapping a chip dismisses the soft keyboard and blurs the input. The 120ms timer unmounts the dropdown before the chip's `click` lands, and on iOS the first tap after the keyboard is up is frequently consumed by the keyboard dismissal rather than activating the target. Net effect: the first tap does nothing.

### Desired behavior
Tapping a category chip on mobile reliably navigates to `/?category=<key>` and closes the dropdown, on the first tap. Desktop behavior is unchanged.

### Approach
- Drive category navigation from `onPointerDown` (which fires before blur and before the keyboard-dismiss consumes the tap) instead of relying on a post-blur `click`:
  - Use `useRouter()` from `next/navigation`.
  - On the chip: `onPointerDown={(e) => { e.preventDefault(); router.push(\`/?category=${c.key}\`); close(); }}`.
  - `e.preventDefault()` keeps the input from blurring mid-gesture so `close()` runs deterministically rather than racing the blur timer.
  - Keep the chips as anchors/`Link` for semantics and keyboard/desktop use, but the pointer handler is the reliable activation path. (Verify desktop click still works — pointerdown fires on mouse too, so a single handler can serve both; if a double-navigation is observed on desktop, gate the `Link`'s default click.)
- Bigger touch targets, mobile only (Tailwind responsive, desktop untouched):
  - Increase chip padding to a ~44px min tap height (e.g. `py-2.5 px-3` on mobile, current `px-2 py-1` retained at `sm:`/`md:`).
  - Slightly increase gap between chips on mobile for clearer separation.

### Files
- `components/header/SearchBar.tsx` (chip rendering + handler + responsive padding)

### Testing
- Unit/interaction test: chip `onPointerDown` calls `router.push` with the correct category href and calls `close()`. (Mock `next/navigation` `useRouter`.)
- Manual: on a mobile viewport, focus search → tap a category chip → projects filter and dropdown closes on first tap.

---

## 2. Contact page redesign — Direction A1 (oversized type)

### Current state
`app/contact/page.tsx` is a 3-column grid (Studio / Get in touch / Follow) built from `data/offices.ts` (`OFFICES[0]`, `SOCIALS`). Plain, symmetric, unremarkable.

### Desired design
The contact information itself is the headline — no "Contact" page title.

Layout (top → bottom), reusing site tokens (`.label`, `.meta`, `.page-title` scale, hairline `#e5e7eb`, accent `#ff6900`):

- **Top label block** — small uppercase: `MA Studio & Partners — Tirana`, with the street address (`office.address`) as a quiet secondary `.meta` line beneath it.
- **Hero** — vertically the focal point:
  - small uppercase `.label` `Write`, then **huge** `info@mastudio.al` at page-title scale (`clamp(40px, 8vw, 104px)` family, weight 400, tight letter-spacing), as a `mailto:` link.
  - small uppercase `.label` `Call`, then **huge** `+355 69 209 8818` at the same scale, as a `tel:` link (`tel:` value strips spaces, matching the current `replace(/\s/g, "")`).
  - Both are black, transitioning to accent `#ff6900` on hover/focus (consistent with the rest of the site; no permanent color).
- **Socials row** — a single horizontal, wrapping row of uppercase `.label` links (LinkedIn, Instagram, Facebook, YouTube, Pinterest, Twitter) from `SOCIALS`, separated from the hero by a hairline above. Each opens in a new tab (`target="_blank" rel="noopener noreferrer"`), accent on hover.

### Responsive
- Desktop: hero type at full clamp scale; comfortable left-aligned column with generous vertical rhythm; page roughly fills the viewport height with the label block at top and socials anchored near the bottom.
- Mobile: same vertical order; the clamp keeps the email/phone large but in-bounds (`8vw` scales down). Email/phone must not overflow horizontally — allow wrapping/break for the email if needed. Socials wrap to multiple lines.

### Data
No data changes. Continues to use `OFFICES[0]` and `SOCIALS` from `data/offices.ts`.

### Files
- `app/contact/page.tsx` (rewritten layout)
- Possibly a small contact-specific class in `app/globals.css` if the hero link scale needs a dedicated rule (reuse `.page-title` if it fits; only add if necessary).

### Testing
- Render test: page shows email (`mailto:`), phone (`tel:` with spaces stripped), all six social links with correct hrefs and `target="_blank"`, the studio label, and the address.
- Manual: visual check at desktop and mobile widths; confirm no horizontal overflow of the large email/phone on a narrow phone; hover turns links orange.

---

## 3. Project opening animation — mirror of the close

### Current behavior
`components/viewer/ProjectViewer.tsx`:
- **Open (first open):** backdrop fades in over 400ms; stage fades in + scales `0.94 → 1` over 500ms; easing `cubic-bezier(0.22, 1, 0.36, 1)` (easeOutQuint).
- **Close:** stage fades out + scales `1 → 0.96`; backdrop fades out; both over `CLOSE_MS = 900ms`, same easing.
- **Next project:** stage fades out 200ms, swaps project, crossfades the new stage in over 280ms. (Unchanged.)

### Desired behavior
The first-open animation becomes an exact reverse of the close: backdrop fades in and the stage scales **`0.96 → 1`** while fading in, using the same `easeOutQuint` curve, over **900ms** (matching `CLOSE_MS`).

### Approach
In the `firstOpen` branch of the `useLayoutEffect`:
- Backdrop: set `transition` to `opacity 900ms ${EASE}` (was 400ms), `opacity 0 → 1`.
- Stage: set initial `transform: scale(0.96)` (was `0.94`); transition `opacity 900ms ${EASE}, transform 900ms ${EASE}` (was 500ms); animate to `opacity 1`, `transform: scale(1)`.
- Keep `transformOrigin: center` and the `requestAnimationFrame` two-step (set initial state, then animate next frame) so the transition fires.
- Consider a shared constant (e.g. `OPEN_MS = 900`) alongside `CLOSE_MS` for clarity; reuse `EASE`.

The "Next project" crossfade path and the close path are unchanged.

### Files
- `components/viewer/ProjectViewer.tsx`

### Testing
- The existing viewer test suite (`test/`) must still pass (Next control links/handler).
- Manual: click a project from the list → backdrop and stage ease in together (scale up from 0.96), ~900ms, visibly the close run backward; Esc/Close still plays the 900ms close.

---

## Out of scope
- No changes to the search results list behavior, the home filter logic, or `projectsByCategory`.
- No changes to desktop search styling beyond what the shared chip markup requires.
- No new contact content (no contact form, no map, no additional offices).
- No change to the close or "Next project" animations.

## Implementation order
Independent; suggested order is small-to-large risk: (3) viewer animation → (1) search tap fix → (2) contact redesign. Each can be a separate commit.
