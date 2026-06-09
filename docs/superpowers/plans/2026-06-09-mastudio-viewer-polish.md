# MA Studio Project Viewer Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Smoother project viewer — a fade + scale-up "appear" open (no card morph), a full-bleed blurred-fill photo layout on phones (big, no blank bands), and a "Next project" link with a crossfade transition.

**Architecture:** `ProjectViewer` owns the open/close/crossfade animations on its backdrop + stage refs (no more FLIP). `ProjectStrip` is the shared content (viewer + standalone page); it gets mobile blurred-fill image panels, hero-overlaid meta, and a "Next project" end panel that's a button in the viewer (`onNext`) or a link on the standalone page. The FLIP `rect`/`OriginRect` wiring is removed.

**Tech Stack:** Next.js 16.2.7 (App Router), React 19, Tailwind v4, Vitest + Testing Library.

**Branch:** `feature/viewer-polish` (already created).

---

## Key facts established during planning (do not re-derive)

- `ProjectStrip` is rendered by **both** `ProjectViewer` (zoom dialog) and `ProjectPageView` (direct `/projects/[slug]` load). The "Next" control must therefore be a **button** when a handler is passed (viewer, in-place crossfade) and a **`<Link>`** otherwise (standalone, navigation).
- `nextProject(slug)` exists in `data/projects.ts` and wraps around (covered by `test/projects.test.ts`).
- `EASE = "cubic-bezier(0.22, 1, 0.36, 1)"` is already used in `ProjectViewer`; reuse it.
- Removing the FLIP makes `rect`/`OriginRect` (in `ViewerContext`) and the `imgWrap` rect logic (in `ProjectRow`) dead — remove them. `ProjectRow`'s click still `preventDefault`s and calls `open(project)`.
- jsdom ignores Tailwind, so responsive classes don't affect tests. The new `ProjectStrip` test asserts the "Next" link `href` / button handler, not layout.
- Test commands: `npm test`, `npx vitest run <file>`, `npm run lint`, `npm run build`. `@` → repo root.

---

## File structure

| File | Responsibility |
| --- | --- |
| `components/viewer/ViewerContext.tsx` | **Modify** — `open(project)` only; drop `rect`/`OriginRect` |
| `components/project/ProjectRow.tsx` | **Modify** — `open(project)`; remove `imgWrap`/rect |
| `components/viewer/ProjectStrip.tsx` | **Modify** — mobile blurred-fill panels, hero meta, `onNext` + "Next project" end panel |
| `components/viewer/ProjectViewer.tsx` | **Modify** — appear (fade+scale) open, crossfade `goNext`, pass `onNext`, remove FLIP |
| `test/projectstrip.test.tsx` | **Create** — "Next project" link/button behavior |

---

## Task 1: Remove FLIP wiring from ViewerContext + ProjectRow

**Files:** Modify `components/viewer/ViewerContext.tsx`, `components/project/ProjectRow.tsx`

> Simplify `open` to take just the project. (After this task the homepage still opens the viewer; the open animation is rebuilt in Task 4.)

- [ ] **Step 1: Replace `components/viewer/ViewerContext.tsx` entirely**

```tsx
"use client";
import { createContext, useCallback, useContext, useState } from "react";
import type { Project } from "@/data/projects";

interface ViewerState {
  project: Project | null;
  open: (project: Project) => void;
  close: () => void;
}

const ViewerCtx = createContext<ViewerState | null>(null);

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);

  const open = useCallback((p: Project) => {
    setProject(p);
    if (typeof window !== "undefined") {
      window.history.pushState({ viewer: p.slug }, "", `/projects/${p.slug}`);
    }
  }, []);

  const close = useCallback(() => setProject(null), []);

  return <ViewerCtx.Provider value={{ project, open, close }}>{children}</ViewerCtx.Provider>;
}

export function useViewer() {
  const ctx = useContext(ViewerCtx);
  if (!ctx) throw new Error("useViewer must be used within ViewerProvider");
  return ctx;
}
```

- [ ] **Step 2: Replace `components/project/ProjectRow.tsx` entirely**

```tsx
"use client";
import Reveal from "@/components/motion/Reveal";
import BlurImage from "@/components/media/BlurImage";
import { useViewer } from "@/components/viewer/ViewerContext";
import type { Project } from "@/data/projects";

export default function ProjectRow({ project, hero = false }: { project: Project; hero?: boolean }) {
  const { open } = useViewer();

  const handleOpen = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    open(project);
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
        <div className="overflow-hidden">
          <div className="transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.02]">
            <BlurImage
              src={project.images[0]}
              label={project.name}
              ratio={null}
              priority={hero}
              className="aspect-[16/10] md:aspect-auto md:h-[calc(100svh-140px)]"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        </div>
      </a>
    </Reveal>
  );
}
```

- [ ] **Step 3: Run the suite**

Run: `npm test`
Expected: PASS. (Existing tests don't touch `rect`. `ProjectViewer` still imports nothing removed — it uses `rect` though, so it will be rebuilt in Task 4; if TypeScript/build is run now it would error in ProjectViewer, but `npm test` (vitest) doesn't type-check the whole app. Tasks 1→4 are committed in sequence; the app build is verified in Task 5.)

- [ ] **Step 4: Commit**

```bash
git add components/viewer/ViewerContext.tsx components/project/ProjectRow.tsx
git commit -m "refactor(viewer): drop FLIP rect wiring; open takes just the project"
```

---

## Task 2: ProjectStrip — mobile blurred-fill + hero meta + Next panel

**Files:** Modify `components/viewer/ProjectStrip.tsx`

> Replace the file. Adds: `onNext`/`next` ("Next project" end panel), mobile full-bleed blurred-fill image panels, hero-overlaid meta on mobile, info column desktop-only. All scroll/drag/wheel logic is preserved.

- [ ] **Step 1: Replace `components/viewer/ProjectStrip.tsx` entirely**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { nextProject, type Project } from "@/data/projects";

/**
 * Horizontal "filmstrip" project view (big.dk-style): a fixed-height row of
 * panels where wheel/drag input maps to horizontal scroll with smoothing.
 * On mobile each image panel is full-bleed with a blurred fill behind the
 * contained image. The final panel links to the next project.
 *
 * `onNext`, when provided (viewer), makes the Next panel a button (in-place
 * crossfade). Without it (standalone page) the Next panel is a link.
 */
export default function ProjectStrip({
  project,
  onNext,
}: {
  project: Project;
  onNext?: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const raf = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  // smooth scroll loop toward target
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    target.current = el.scrollLeft;

    const max = () => el.scrollWidth - el.clientWidth;
    const tick = () => {
      const cur = el.scrollLeft;
      const diff = target.current - cur;
      if (Math.abs(diff) > 0.5) {
        el.scrollLeft = cur + diff * 0.18;
        raf.current = requestAnimationFrame(tick);
      } else {
        el.scrollLeft = target.current;
        raf.current = null;
      }
      setProgress(max() > 0 ? el.scrollLeft / max() : 0);
    };
    const kick = () => {
      if (raf.current == null) raf.current = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;
      e.preventDefault();
      target.current = Math.max(0, Math.min(max(), target.current + delta));
      kick();
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        target.current = Math.min(max(), target.current + el.clientWidth * 0.8);
        kick();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        target.current = Math.max(0, target.current - el.clientWidth * 0.8);
        kick();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [project.slug]);

  // pointer drag — only engages once the pointer actually moves.
  const start = useRef<{ x: number; left: number; id: number } | null>(null);
  const moved = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const el = scroller.current;
    if (!el) return;
    start.current = { x: e.clientX, left: el.scrollLeft, id: e.pointerId };
    moved.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = scroller.current;
    if (!el || !start.current) return;
    const dx = e.clientX - start.current.x;
    if (!moved.current && Math.abs(dx) > 4) {
      moved.current = true;
      el.setPointerCapture(start.current.id);
    }
    if (moved.current) {
      el.scrollLeft = start.current.left - dx;
      target.current = el.scrollLeft;
    }
  };
  const onPointerUp = () => {
    start.current = null;
  };

  const images = project.images;
  const next = nextProject(project.slug);

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scroller}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="no-scrollbar flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
        data-cursor="arrow"
      >
        <div className="flex h-full flex-nowrap items-stretch gap-8 px-5 md:gap-16 md:px-10">
          {/* Hero panel */}
          <section className="relative flex h-full w-screen shrink-0 items-center justify-center overflow-hidden md:block md:w-auto" style={{ maxWidth: "min(100vw, 1100px)" }}>
            {images[0] && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[0]} aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-[.45] md:hidden" draggable={false} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[0]} alt={project.name} className="relative z-[1] h-auto max-h-full w-full max-w-full object-contain md:h-full md:w-auto" draggable={false} />
              </>
            )}
            <div className="absolute bottom-0 left-0 z-[2] p-6">
              <h1 className="text-[clamp(28px,4vw,56px)] uppercase leading-none text-white mix-blend-difference">
                {project.name}
              </h1>
              <div className="label mt-2 text-white mix-blend-difference">{project.location}</div>
              <div className="label mt-1 text-white mix-blend-difference md:hidden">
                {project.type} · {project.year}
              </div>
            </div>
          </section>

          {/* Info column — desktop only */}
          <section className="hidden h-full w-[clamp(220px,22vw,300px)] shrink-0 flex-col justify-center md:flex">
            <Meta label="Project" value={project.type} />
            <Meta label="Year" value={String(project.year)} />
            <Meta label="Location" value={project.location} />
            <Meta label="Studio" value="MA Studio & Partners" />
            <p className="meta mt-6 text-[14px] leading-relaxed">
              Swipe through the project — or use the wheel and arrow keys.
            </p>
          </section>

          {/* Remaining images */}
          {images.slice(1).map((src, i) => (
            <section key={src} className="relative flex h-full w-screen shrink-0 items-center justify-center overflow-hidden md:block md:w-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-[.45] md:hidden" draggable={false} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${project.name} — ${i + 2}`} className="relative z-[1] h-auto max-h-full w-full object-contain md:h-full md:w-auto" draggable={false} />
            </section>
          ))}

          {/* Next project panel */}
          <section className="flex h-full w-screen shrink-0 flex-col justify-center px-5 md:w-[40vw] md:px-0">
            {onNext ? (
              <button type="button" onClick={onNext} className="group/next text-left" aria-label={`Next project: ${next.name}`}>
                <div className="label meta mb-3">Next project</div>
                <div className="text-[clamp(28px,4vw,56px)] uppercase leading-none transition-colors group-hover/next:text-accent">
                  {next.name} →
                </div>
                <div className="label meta mt-2">{next.location}</div>
              </button>
            ) : (
              <Link href={`/projects/${next.slug}`} className="group/next" aria-label={`Next project: ${next.name}`}>
                <div className="label meta mb-3">Next project</div>
                <div className="text-[clamp(28px,4vw,56px)] uppercase leading-none transition-colors group-hover/next:text-accent">
                  {next.name} →
                </div>
                <div className="label meta mt-2">{next.location}</div>
              </Link>
            )}
          </section>
        </div>
      </div>

      {/* progress bar */}
      <div className="h-[3px] w-full bg-hairline">
        <div className="h-full bg-accent transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 border-t border-hairline pt-2">
      <div className="label meta">{label}</div>
      <div className="label">{value}</div>
    </div>
  );
}
```

- [ ] **Step 2: Run the suite**

Run: `npm test`
Expected: PASS (no existing test renders `ProjectStrip`; the dedicated test is added in Task 3).

- [ ] **Step 3: Commit**

```bash
git add components/viewer/ProjectStrip.tsx
git commit -m "feat(viewer): full-bleed blurred-fill mobile panels, hero meta, Next project panel"
```

---

## Task 3: ProjectStrip — test the "Next project" control

**Files:** Create `test/projectstrip.test.tsx`

- [ ] **Step 1: Write the test**

Create `test/projectstrip.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProjectStrip from "@/components/viewer/ProjectStrip";
import { PROJECTS, nextProject } from "@/data/projects";

const project = PROJECTS[0];
const next = nextProject(project.slug);

describe("ProjectStrip — Next project control", () => {
  it("links to the next project on the standalone page (no onNext)", () => {
    render(<ProjectStrip project={project} />);
    const link = screen.getByRole("link", { name: `Next project: ${next.name}` });
    expect(link.getAttribute("href")).toBe(`/projects/${next.slug}`);
  });

  it("calls onNext (no navigation) when used in the viewer", () => {
    const onNext = vi.fn();
    render(<ProjectStrip project={project} onNext={onNext} />);
    const btn = screen.getByRole("button", { name: `Next project: ${next.name}` });
    fireEvent.click(btn);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run test/projectstrip.test.tsx`
Expected: PASS (2 tests). (`ProjectStrip` mounts in jsdom; the wheel/pointer effects attach listeners harmlessly. The accessible name comes from the `aria-label` on the link/button.)

- [ ] **Step 3: Run the full suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add test/projectstrip.test.tsx
git commit -m "test(viewer): Next project control links/handler"
```

---

## Task 4: ProjectViewer — appear open + crossfade Next (remove FLIP)

**Files:** Modify `components/viewer/ProjectViewer.tsx`

- [ ] **Step 1: Replace `components/viewer/ProjectViewer.tsx` entirely**

```tsx
"use client";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useViewer } from "./ViewerContext";
import ProjectStrip from "./ProjectStrip";
import { nextProject } from "@/data/projects";

const CLOSE_MS = 900; // fade + slight scale-down, reveals homepage
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"; // easeOutQuint

export default function ProjectViewer() {
  const { project, open, close } = useViewer();
  const stage = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const prevSlug = useRef<string | null>(null);
  const busy = useRef(false);

  // OPEN: fade backdrop in + scale-up the stage (appear). On a project change
  // while open (Next), crossfade the stage back in (goNext faded it out first).
  useLayoutEffect(() => {
    if (!project) {
      prevSlug.current = null;
      return;
    }
    busy.current = false;
    const b = bg.current;
    const s = stage.current;
    const firstOpen = prevSlug.current === null;
    prevSlug.current = project.slug;
    if (!s) return;

    if (firstOpen) {
      if (b) {
        b.style.transition = "none";
        b.style.opacity = "0";
      }
      s.style.transition = "none";
      s.style.opacity = "0";
      s.style.transformOrigin = "center";
      s.style.transform = "scale(0.94)";
      const id = requestAnimationFrame(() => {
        if (b) {
          b.style.transition = `opacity 400ms ${EASE}`;
          b.style.opacity = "1";
        }
        s.style.transition = `opacity 500ms ${EASE}, transform 500ms ${EASE}`;
        s.style.opacity = "1";
        s.style.transform = "scale(1)";
      });
      return () => cancelAnimationFrame(id);
    } else {
      // crossfade-in (the outgoing stage was faded to 0 by goNext)
      s.style.transition = "none";
      s.style.opacity = "0";
      s.style.transform = "none";
      const id = requestAnimationFrame(() => {
        s.style.transition = `opacity 280ms ${EASE}`;
        s.style.opacity = "1";
      });
      return () => cancelAnimationFrame(id);
    }
  }, [project]);

  const finish = useCallback(() => {
    close();
    if (typeof window !== "undefined" && window.history.state?.viewer) window.history.back();
  }, [close]);

  const doClose = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    const b = bg.current;
    const s = stage.current;
    if (!b || !s) {
      finish();
      return;
    }
    s.style.transition = `opacity ${CLOSE_MS}ms ${EASE}, transform ${CLOSE_MS}ms ${EASE}`;
    s.style.transformOrigin = "center";
    s.style.transform = "scale(0.96)";
    s.style.opacity = "0";
    b.style.transition = `opacity ${CLOSE_MS}ms ${EASE}`;
    b.style.opacity = "0";
    window.setTimeout(finish, CLOSE_MS + 60);
  }, [finish]);

  const goNext = useCallback(() => {
    const s = stage.current;
    if (!s || !project) return;
    const next = nextProject(project.slug);
    s.style.transition = `opacity 200ms ${EASE}`;
    s.style.opacity = "0";
    window.setTimeout(() => open(next), 210);
  }, [open, project]);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") doClose();
    };
    const onPop = () => close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
      document.body.style.overflow = "";
    };
  }, [project, close, doClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal>
      <div ref={bg} className="absolute inset-0 z-[1] bg-white" />
      <div ref={stage} className="relative z-[2] flex h-full flex-col will-change-[transform,opacity]">
        <div className="flex items-center justify-between px-5 py-4 md:px-10">
          <span className="label">{project.name}</span>
          <button onClick={doClose} aria-label="Close" className="label transition-colors hover:text-accent">
            Close ✕
          </button>
        </div>
        <div className="h-[calc(100%-56px)]">
          <ProjectStrip project={project} onNext={goNext} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run the suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/viewer/ProjectViewer.tsx
git commit -m "feat(viewer): fade+scale appear open and crossfade Next; remove FLIP"
```

---

## Task 5: Final verification + visual sweep

**Files:** none up front (controller applies any fixes the sweep surfaces)

- [ ] **Step 1: Full suite**

Run: `npm test`
Expected: PASS — existing suites + `test/projectstrip.test.tsx`.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors. (Watch for unused imports left from the FLIP removal.)

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds. (This type-checks the app — confirms `rect`/`OriginRect` removal is consistent across `ViewerContext`, `ProjectRow`, `ProjectViewer`.)

- [ ] **Step 4: Visual sweep with Playwright**

**Desktop (1440×900):**
1. Click a project → it **appears** (fade + gentle scale-up, no card morph).
2. Filmstrip unchanged (full-height images, info column); scroll to the end → **"Next project"** panel.
3. Click "Next project" → **crossfade** to the next project (stays in viewer; header name updates).
4. Close (✕ / Esc) still fades + scales down.

**Phone (390×844):**
5. Open a project → appears; each image is **full-bleed** with a blurred fill behind it (big, no blank bands); the hero shows title · location · Type · Year.
6. Swipe to the end → "Next project" → crossfade to next.
7. No horizontal page overflow; close works.

- [ ] **Step 5: Fix anything the sweep surfaces**

Apply minimal fixes (e.g., blur amount/brightness, panel widths, timing) and re-verify. Commit:

```bash
git add -A
git commit -m "fix(viewer): polish from visual sweep"
```
(Skip if the working tree is clean.)

---

## Self-review (completed by plan author)

- **Spec coverage:** fade+scale appear open (Task 4) ✓ · remove FLIP/`rect` (Tasks 1, 4) ✓ · mobile blurred-fill + hero meta + desktop-only info column (Task 2) ✓ · "Next project" link/button (Task 2) + test (Task 3) + crossfade transition (Task 4) ✓ · verification incl. type-checking build (Task 5) ✓.
- **Placeholder scan:** all steps contain complete code; the Task 5 sweep is an explicit verify-and-fix step with a concrete fix pattern.
- **Type/name consistency:** `open(project)` (single arg) defined in Task 1 and called in `ProjectRow` (Task 1) and `goNext` (Task 4); `onNext` prop defined on `ProjectStrip` (Task 2), passed by `ProjectViewer` (Task 4), tested (Task 3); `nextProject` imported where used; `ProjectPageView` already calls `ProjectStrip` without `onNext` (link mode) — no change needed.
- **Sequencing note:** Tasks 1–2 leave `ProjectViewer` referencing the old `rect`/`heroRef` until Task 4; `npm test` (vitest, no full type-check) stays green through the sequence, and Task 5's `npm run build` confirms the whole app type-checks once `ProjectViewer` is rebuilt.
```
