# Mobile Search Fix, Contact Redesign & Viewer Open Animation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix mobile search category taps, rebuild the Contact page as an oversized-type layout, and make the project viewer's open animation an exact reverse of its close.

**Architecture:** Three independent changes to a Next.js 16 (App Router) + React 19 site. (1) `SearchBar` category chips navigate via `router.push` on `pointerdown` to beat the touch blur/keyboard-dismiss race. (2) `app/contact/page.tsx` is rewritten so the email/phone are the headline, with a socials row, using existing design tokens. (3) `ProjectViewer`'s first-open branch is retuned to mirror the 900ms close (scale `0.96 → 1`, same easing).

**Tech Stack:** Next.js 16.2.7, React 19, TypeScript, Tailwind v4, Vitest 4 + @testing-library/react (jsdom).

**Spec:** `docs/superpowers/specs/2026-06-09-mobile-search-contact-viewer-design.md`

**Conventions:**
- Run a single test file: `npx vitest run <path>`; a single test: `npx vitest run <path> -t "<name>"`; full suite: `npm test`.
- Lint: `npm run lint`.
- Every commit message ends with the trailer:
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  ```
- Work on the current `master` branch; one commit per task.

---

## Task 1: Mobile search — category chips navigate on `pointerdown` + bigger touch targets

**Files:**
- Modify: `test/setup.ts` (add a jsdom `PointerEvent` polyfill so pointer events can be fired)
- Modify: `test/searchbar.test.tsx` (mock `next/navigation`; add a pointerdown navigation test)
- Modify: `components/header/SearchBar.tsx:1-69` (use `useRouter`; navigate from `onPointerDown`; enlarge mobile chip padding/gap)

**Why:** On touch, tapping a chip dismisses the soft keyboard and blurs the input; the 120ms `close()` timer unmounts the dropdown before the chip's `click` lands (and iOS often swallows the first tap entirely). Navigating on `pointerdown` — which fires before blur — fixes it. Desktop keeps working via the chip's `href` (keyboard Enter) and the same pointerdown path (mouse).

- [ ] **Step 1: Add a PointerEvent polyfill to the test setup**

jsdom has no `PointerEvent`, so `fireEvent.pointerDown` would fail. Append to `test/setup.ts`:

```ts
// jsdom has no PointerEvent — SearchBar chips navigate on pointerdown.
if (typeof window.PointerEvent === "undefined") {
  // @ts-expect-error minimal test double extending MouseEvent
  window.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type: string, props: PointerEventInit = {}) {
      super(type, props);
    }
  };
}
```

- [ ] **Step 2: Write the failing test (mock the router, assert pointerdown navigation)**

Replace the entire contents of `test/searchbar.test.tsx` with:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// SearchBar now calls useRouter(); mock it before importing the component.
const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import SearchBar from "@/components/header/SearchBar";

describe("SearchBar", () => {
  beforeEach(() => push.mockClear());

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

  it("keeps the category chip href for keyboard/desktop", () => {
    render(<SearchBar />);
    fireEvent.focus(screen.getByLabelText("Search projects and categories"));
    const chip = screen.getByRole("link", { name: "Residential" });
    expect(chip.getAttribute("href")).toBe("/?category=residential");
  });

  it("navigates on pointerdown so taps land before the dropdown closes", () => {
    render(<SearchBar />);
    fireEvent.focus(screen.getByLabelText("Search projects and categories"));
    const chip = screen.getByRole("link", { name: "Residential" });
    fireEvent.pointerDown(chip, { button: 0 });
    expect(push).toHaveBeenCalledWith("/?category=residential");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run test/searchbar.test.tsx -t "navigates on pointerdown"`
Expected: FAIL — `push` was not called (current chips have no `onPointerDown`).

- [ ] **Step 4: Implement the SearchBar changes**

Replace the entire contents of `components/header/SearchBar.tsx` with:

```tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/data/categories";
import { searchAll } from "@/lib/search";

export default function SearchBar() {
  const router = useRouter();
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

  // Navigate from pointerdown (fires before the input blurs / iOS dismisses the
  // keyboard) so a touch tap on a chip is never swallowed by the close race.
  // Right/middle clicks fall through to the Link's default (e.g. open in new tab),
  // and keyboard Enter uses the href since no pointerdown fires.
  const goToCategory = (e: React.PointerEvent, href: string) => {
    if (e.button !== 0) return;
    e.preventDefault();
    close();
    router.push(href);
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 border-b border-black/70 px-1 py-1 transition-[width] duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
          focused ? "w-[320px] max-w-[60vw]" : "w-[150px] sm:w-[180px]"
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
          <div className="mb-3 flex flex-wrap gap-2.5 sm:gap-2">
            {CATEGORIES.map((c) => {
              const href = `/?category=${c.key}`;
              return (
                <Link
                  key={c.key}
                  href={href}
                  onPointerDown={(e) => goToCategory(e, href)}
                  onClick={(e) => {
                    // pointer click already navigated via pointerdown; let keyboard (detail 0) through
                    if (e.detail !== 0) e.preventDefault();
                  }}
                  className="label border border-hairline px-3 py-2.5 transition-colors hover:bg-black hover:text-white sm:px-2 sm:py-1"
                >
                  {c.label}
                </Link>
              );
            })}
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

Changes vs. original: added `useRouter` import + `const router`; added `goToCategory`; category chips now compute `href` once, add `onPointerDown`/`onClick`, and use mobile-first padding `px-3 py-2.5 … sm:px-2 sm:py-1`; chip container gap is `gap-2.5 sm:gap-2`. Everything else is unchanged.

- [ ] **Step 5: Run the SearchBar tests to verify they pass**

Run: `npx vitest run test/searchbar.test.tsx`
Expected: PASS — all four tests green.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors for `components/header/SearchBar.tsx` or the test files.

- [ ] **Step 7: Run the full suite (no regressions)**

Run: `npm test`
Expected: PASS — all test files green.

- [ ] **Step 8: Commit**

```bash
git add test/setup.ts test/searchbar.test.tsx components/header/SearchBar.tsx
git commit -m "$(cat <<'EOF'
fix(search): category chips navigate on pointerdown (mobile tap) + bigger touch targets

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Contact page — oversized-type layout (Direction A1)

**Files:**
- Modify: `app/globals.css:38` (add a `.contact-lead` type scale after `.page-title`)
- Create: `test/contact.test.tsx`
- Modify: `app/contact/page.tsx` (full rewrite)

**Why:** Replace the plain 3-column grid with an editorial layout where the email and phone are the headline. The global `<Footer>` (rendered site-wide in `app/layout.tsx`) still repeats this info in collapsed accordions — that is intentional and unchanged; the contact page is a natural-height block above it, so it must not be forced to full viewport height.

**Design notes baked in:** email/phone in black, accent `#ff6900` on hover only; studio label + address kept as a small secondary block at the top; socials as a wrapping uppercase row; `tel:` strips spaces (matches the footer); a dedicated `.contact-lead` clamp (slightly smaller than `.page-title`) guarantees the long email never overflows on a narrow phone.

- [ ] **Step 1: Add the `.contact-lead` type scale**

In `app/globals.css`, immediately after the `.page-title { … }` rule (ends at line 38), add:

```css
.contact-lead {
  font-size: clamp(28px, 6vw, 72px);
  line-height: 1.05;
  font-weight: 400;
  letter-spacing: -0.01em;
}
```

- [ ] **Step 2: Write the failing test**

Create `test/contact.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactPage from "@/app/contact/page";
import { OFFICES, SOCIALS } from "@/data/offices";

const office = OFFICES[0];

describe("ContactPage", () => {
  it("renders the email as a mailto link", () => {
    render(<ContactPage />);
    const link = screen.getByRole("link", { name: office.email });
    expect(link.getAttribute("href")).toBe(`mailto:${office.email}`);
  });

  it("renders the phone as a tel link with spaces stripped", () => {
    render(<ContactPage />);
    const link = screen.getByRole("link", { name: office.phone });
    expect(link.getAttribute("href")).toBe(`tel:${office.phone.replace(/\s/g, "")}`);
  });

  it("renders every social link opening in a new tab", () => {
    render(<ContactPage />);
    for (const s of SOCIALS) {
      const link = screen.getByRole("link", { name: s.label });
      expect(link.getAttribute("href")).toBe(s.href);
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    }
  });

  it("shows the studio label and the street address", () => {
    render(<ContactPage />);
    expect(screen.getByText(/MA Studio & Partners/)).toBeInTheDocument();
    expect(screen.getByText(office.address[0])).toBeInTheDocument();
  });

  // This is the assertion that DISTINGUISHES the new design from the old page:
  // the old page renders a <PageTitle>Contact</PageTitle> heading and plain-size
  // links; the new design has no "Contact" heading and the email/phone use the
  // oversized `.contact-lead` type. Drives the rewrite.
  it("makes email & phone the oversized headline (no separate Contact title)", () => {
    render(<ContactPage />);
    expect(screen.queryByRole("heading", { name: /^Contact$/i })).toBeNull();
    const email = screen.getByRole("link", { name: office.email });
    expect(email.className).toContain("contact-lead");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run test/contact.test.tsx`
Expected: FAIL on `"makes email & phone the oversized headline"` — the current page renders an `<h1>Contact</h1>` (via `PageTitle`) and the email link has no `contact-lead` class. (The mailto/tel/socials/address assertions may already pass against the old page; that is fine — they are regression guards. The headline test is the one that must be red before the rewrite.)

- [ ] **Step 4: Rewrite the contact page**

Replace the entire contents of `app/contact/page.tsx` with:

```tsx
import { OFFICES, SOCIALS } from "@/data/offices";

const office = OFFICES[0];

export default function ContactPage() {
  const telHref = `tel:${office.phone.replace(/\s/g, "")}`;

  return (
    <div className="px-5 pt-10 pb-16">
      {/* Studio label + address — small, secondary */}
      <div className="mb-16 md:mb-24">
        <div className="label">
          {office.label} — {office.city}
        </div>
        <div className="meta mt-1 text-[13px]">
          {office.address.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>

      {/* Hero — the contact info IS the headline */}
      <div>
        <div className="label meta mb-2">Write</div>
        <a
          href={`mailto:${office.email}`}
          className="contact-lead block break-words transition-colors hover:text-accent"
        >
          {office.email}
        </a>

        <div className="label meta mb-2 mt-10 md:mt-14">Call</div>
        <a href={telHref} className="contact-lead block transition-colors hover:text-accent">
          {office.phone}
        </a>
      </div>

      {/* Socials */}
      <div className="mt-16 border-t border-hairline pt-5 md:mt-24">
        <div className="label meta mb-3">Follow</div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="label transition-colors hover:text-accent"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run test/contact.test.tsx`
Expected: PASS — all four tests green.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors for `app/contact/page.tsx` (watch for the a11y rule on links — every `<a>` here has text content, so it should pass).

- [ ] **Step 7: Run the full suite (no regressions)**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/globals.css app/contact/page.tsx test/contact.test.tsx
git commit -m "$(cat <<'EOF'
feat(contact): oversized-type contact page (email/phone as headline)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Viewer open animation — mirror of the close

**Files:**
- Create: `test/projectviewer.test.tsx`
- Modify: `components/viewer/ProjectViewer.tsx:7-9` (add `OPEN_MS`), `:116` (add `data-testid`), `:31-48` (retune first-open branch)

**Why:** The current first-open is a quick 500ms scale-from-0.94. The user wants the open to be the close played in reverse: backdrop fades in while the stage scales `0.96 → 1` and fades in, same `easeOutQuint` curve, over the same 900ms as the close. The "Next project" crossfade and the close are unchanged.

- [ ] **Step 1: Write the failing test**

Create `test/projectviewer.test.tsx`. It freezes `requestAnimationFrame` so the stage stays at its appear-from state, then asserts the mirrored start scale:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewerProvider, useViewer } from "@/components/viewer/ViewerContext";
import ProjectViewer from "@/components/viewer/ProjectViewer";
import { PROJECTS } from "@/data/projects";

function OpenButton() {
  const { open } = useViewer();
  return <button onClick={() => open(PROJECTS[0])}>open</button>;
}

describe("ProjectViewer — open animation", () => {
  beforeEach(() => {
    // Freeze rAF so the stage holds its appear-from state for assertion.
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0);
  });
  afterEach(() => vi.restoreAllMocks());

  it("mounts the stage at the mirrored appear-from scale (0.96)", () => {
    render(
      <ViewerProvider>
        <OpenButton />
        <ProjectViewer />
      </ViewerProvider>
    );
    fireEvent.click(screen.getByText("open"));
    const stage = screen.getByTestId("viewer-stage");
    expect(stage.style.transform).toBe("scale(0.96)");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run test/projectviewer.test.tsx`
Expected: FAIL — `getByTestId("viewer-stage")` throws (no such test id yet), or the transform is `scale(0.94)`.

- [ ] **Step 3: Add the `OPEN_MS` constant**

In `components/viewer/ProjectViewer.tsx`, find (lines 7-8):

```tsx
const CLOSE_MS = 900; // fade + slight scale-down, reveals homepage
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"; // easeOutQuint
```

Change to:

```tsx
const CLOSE_MS = 900; // fade + slight scale-down, reveals homepage
const OPEN_MS = 900; // open is the close reversed: fade + scale-up from 0.96
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"; // easeOutQuint
```

- [ ] **Step 4: Retune the first-open branch**

In the same file, replace the `if (firstOpen) { … }` block (currently lines 31-49) with:

```tsx
    if (firstOpen) {
      if (b) {
        b.style.transition = "none";
        b.style.opacity = "0";
      }
      s.style.transition = "none";
      s.style.opacity = "0";
      s.style.transformOrigin = "center";
      s.style.transform = "scale(0.96)";
      const id = requestAnimationFrame(() => {
        if (b) {
          b.style.transition = `opacity ${OPEN_MS}ms ${EASE}`;
          b.style.opacity = "1";
        }
        s.style.transition = `opacity ${OPEN_MS}ms ${EASE}, transform ${OPEN_MS}ms ${EASE}`;
        s.style.opacity = "1";
        s.style.transform = "scale(1)";
      });
      return () => cancelAnimationFrame(id);
    } else {
```

Changes vs. original: initial `scale(0.94)` → `scale(0.96)`; backdrop transition `opacity 400ms` → `opacity ${OPEN_MS}ms`; stage transition `500ms` → `${OPEN_MS}ms` (both opacity and transform). The `else` crossfade branch below is unchanged.

- [ ] **Step 5: Add the `data-testid` to the stage element**

In the same file, find the stage div (currently line 116):

```tsx
      <div ref={stage} className="relative z-[2] flex h-full flex-col will-change-[transform,opacity]">
```

Change to:

```tsx
      <div ref={stage} data-testid="viewer-stage" className="relative z-[2] flex h-full flex-col will-change-[transform,opacity]">
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run test/projectviewer.test.tsx`
Expected: PASS — stage transform is `scale(0.96)`.

- [ ] **Step 7: Run the full suite (no regressions)**

Run: `npm test`
Expected: PASS — including the existing `test/projectstrip.test.tsx`.

- [ ] **Step 8: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 9: Manual verification**

Run `npm run dev`, open the homepage, click a project tile. Confirm: the white backdrop fades in while the project scales up from ~0.96 and fades in over ~0.9s with a smooth (decelerating) easing — visibly the closing animation in reverse. Press Esc/Close and confirm the close is unchanged. Open a project and click "Next project" and confirm that crossfade is unchanged.

- [ ] **Step 10: Commit**

```bash
git add components/viewer/ProjectViewer.tsx test/projectviewer.test.tsx
git commit -m "$(cat <<'EOF'
feat(viewer): open animation mirrors the close (scale 0.96->1, 900ms)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Final verification

- [ ] Run `npm test` — entire suite green.
- [ ] Run `npm run lint` — clean.
- [ ] Manual mobile check (devtools device mode or a phone): focus search → tap a category chip → projects filter and dropdown closes on the first tap; chips are comfortably tappable.
- [ ] Manual contact check at desktop + 375px widths: email/phone are large with no horizontal overflow; hover turns them orange; all six socials present; address shows under the studio label.
- [ ] Manual viewer check: open animation is the close reversed.

---

## Notes / decisions captured

- **Chip stays a `<Link>`** (not a `<button>`): preserves `href` for keyboard Enter, right/middle-click, and the existing href test. `pointerdown` is the reliable touch/mouse activation path; the `onClick` `detail !== 0` guard prevents a double-navigation from the synthetic pointer click while letting keyboard activation through.
- **Global Footer is unchanged** and still surfaces contact/socials site-wide; the redesigned contact page intentionally restates email/phone/socials as the page's own content.
- **No address removal:** the user chose to keep the address as a small secondary line.
- **Animation is value-only:** no new branch/logic; the frozen-rAF test pins the mirrored start scale, and the existing viewer/strip tests guard the rest.
