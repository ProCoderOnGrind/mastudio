# TinaCMS Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a TinaCMS-powered admin so the owner can create/edit/delete projects (photos + all info) and edit site text/images by clicking them on the page — content staying as repo files, every save committing to `master`.

**Architecture:** Tina is added to the existing Next.js 16 app on pnpm. Content lives as JSON files Tina manages (`content/projects.json`, `content/about.json`, `content/cofounders.json`, `content/contact.json`). Rendering and tests read those files through **synchronous static imports** behind the unchanged `data/*.ts` public APIs (so static generation, the client-side ⌘K search, and the existing test suite keep working). Tina's `/admin` provides the dashboard; visual click-to-edit is layered onto pages via a Server-Component-fetch + Client-Component-`useTina` split with `tinaField` bindings.

**Tech Stack:** Next.js 16.2.7 (App Router, Turbopack), React 19.2.4, TypeScript, Tailwind v4, Vitest, **pnpm**, TinaCMS 3.x (Git-backed, local/no-cloud).

---

## Spec deviation (read first)

The spec (`docs/superpowers/specs/2026-06-10-tinacms-admin-design.md` §3/§5) proposed **one file per project** under `content/projects/`. During planning we found `lib/search.ts` imports `PROJECTS` into a **client** component (`SearchBar`), so `PROJECTS` must be a synchronous, browser-safe import. A multi-file collection cannot be aggregated synchronously client-side without codegen. **Resolution:** projects become a **single Tina document with a `projects` list** (`content/projects.json`) — identical in shape to today's `ma-projects.json`. All other spec decisions stand. Update the spec to match as part of Task 4.

---

## File Structure

**New files**
- `tina/config.ts` — Tina schema (collections, fields, media). Generates `tina/__generated__/` (git-ignored except where Tina requires).
- `content/projects.json` — single doc: `{ projects: [...] }` (migrated from `data/ma-projects.json`).
- `content/about.json`, `content/cofounders.json`, `content/contact.json` — singleton docs (Phases 3–4).
- `lib/projectHelpers.ts` — pure, source-agnostic functions over a `Project[]` (find/filter/next), unit-tested.
- `components/tina/*` — thin client `useTina` wrappers per editable page.
- `test/projectHelpers.test.ts` — unit tests for the pure helpers.

**Modified files**
- `package.json` — pnpm, Tina scripts.
- `data/projects.ts` — repoint import to `content/projects.json`; new fields; delegate helpers to `lib/projectHelpers.ts`.
- `data/about.ts`, `data/founders.ts`, `data/offices.ts` — repoint to `content/*.json` (Phases 3–4).
- `app/projects/[slug]/page.tsx`, `app/page.tsx`, `app/about/page.tsx`, `app/cofounders/page.tsx`, `app/contact/page.tsx` — server-fetch + client wrapper split.
- `components/project/ProjectMeta.tsx`, `components/viewer/ProjectPageView.tsx` — render new fields + `tinaField` bindings.
- `.gitignore` — Tina generated/admin build artifacts.

---

# Phase 1 — Foundation + Projects (delivers the core ask)

## Task 1: Switch the project to pnpm

**Files:**
- Modify: `package.json`
- Create: `pnpm-lock.yaml` (generated)
- Delete: `package-lock.json` (if present)

- [ ] **Step 1: Confirm pnpm is available**

Run: `pnpm --version`
Expected: a version prints (e.g. `9.x`). If "command not found", install with `npm i -g pnpm` first.

- [ ] **Step 2: Remove npm lockfile if present and install with pnpm**

```bash
git rm --cached package-lock.json 2>$null; Remove-Item package-lock.json -ErrorAction SilentlyContinue
pnpm install
```
Expected: `pnpm-lock.yaml` is created; `node_modules` repopulates.

- [ ] **Step 3: Verify the app still builds and tests pass under pnpm**

Run: `pnpm test`
Expected: existing Vitest suite passes (same as before).

Run: `pnpm build`
Expected: `next build` completes with no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml .gitignore
git rm --cached package-lock.json 2>$null
git commit -m "chore: switch package manager to pnpm"
```

---

## Task 2: Install & initialize TinaCMS, validate /admin boots (validation gate)

This is a spike that de-risks the whole integration. Do not proceed to Task 3 until `/admin` loads locally.

**Files:**
- Create: `tina/config.ts` (minimal, replaced in Task 3)
- Modify: `package.json` (scripts), `.gitignore`

- [ ] **Step 1: Add Tina**

Run: `pnpm add tinacms @tinacms/cli`
Expected: both packages install. (Tina 3.x supports Next 16 / React 19.)

- [ ] **Step 2: Add a minimal `tina/config.ts`**

```ts
import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "master",
  clientId: null,   // local-only, no Tina Cloud
  token: null,
  build: { outputFolder: "admin", publicFolder: "public" },
  media: {
    tina: { mediaRoot: "", publicFolder: "public" }, // uploads land under /public
  },
  schema: {
    collections: [
      {
        name: "smoke",
        label: "Smoke Test",
        path: "content/smoke",
        format: "json",
        fields: [{ type: "string", name: "title", label: "Title" }],
      },
    ],
  },
});
```

- [ ] **Step 3: Add a smoke content file**

Create `content/smoke/hello.json`:
```json
{ "title": "hello tina" }
```

- [ ] **Step 4: Wire Tina-wrapped dev/build scripts in `package.json`**

Replace the `dev`, `build`, `start` scripts:
```json
"dev": "tinacms dev -c \"next dev\"",
"build": "tinacms build && next build",
"start": "next start"
```

- [ ] **Step 5: Ignore Tina build artifacts**

Add to `.gitignore`:
```
# TinaCMS
public/admin
tina/__generated__/*
!tina/__generated__/_graphql.json
!tina/__generated__/_schema.json
!tina/__generated__/_lookup.json
```
(If Tina's generated `database-client`/`types` are needed at build, adjust — verify against `node_modules/tinacms` docs during execution.)

- [ ] **Step 6: Boot and verify**

Run: `pnpm dev`
Open `http://localhost:3000/admin/index.html`.
Expected: Tina admin loads, shows the "Smoke Test" collection, and the `hello tina` document is editable. Editing + saving rewrites `content/smoke/hello.json`.

- [ ] **Step 7: Commit (keep smoke collection until Task 3 replaces it)**

```bash
git add package.json tina/config.ts content/smoke/hello.json .gitignore pnpm-lock.yaml
git commit -m "feat(tina): install TinaCMS and validate local /admin"
```

---

## Task 3: Define the Projects schema (single document + list)

**Files:**
- Modify: `tina/config.ts`
- Delete: `content/smoke/hello.json`

- [ ] **Step 1: Replace the smoke collection with the projects collection**

In `tina/config.ts`, replace the `collections` array with:
```ts
collections: [
  {
    name: "projects",
    label: "Projects",
    path: "content",
    format: "json",
    match: { include: "projects" }, // single file: content/projects.json
    ui: { allowedActions: { create: false, delete: false } }, // one singleton doc
    fields: [
      {
        type: "object",
        name: "projects",
        label: "Projects",
        list: true,
        ui: {
          itemProps: (item) => ({ label: item?.name || "Untitled project" }),
        },
        fields: [
          { type: "string", name: "name", label: "Name", required: true },
          { type: "string", name: "slug", label: "Slug", required: true },
          { type: "string", name: "type", label: "Type", required: true },
          { type: "number", name: "year", label: "Year", required: true },
          { type: "string", name: "location", label: "Location", required: true },
          {
            type: "image",
            name: "images",
            label: "Photos",
            list: true,
          },
        ],
      },
    ],
  },
],
```

- [ ] **Step 2: Remove the smoke content**

```bash
git rm content/smoke/hello.json
```

- [ ] **Step 3: Regenerate Tina types (validates schema)**

Run: `pnpm dev` (Tina regenerates on boot) then stop it, OR run `pnpm exec tinacms build`.
Expected: generation succeeds with no schema errors. (`content/projects.json` doesn't exist yet — created in Task 4; generation of the schema itself should still succeed.)

- [ ] **Step 4: Commit**

```bash
git add tina/config.ts
git rm content/smoke/hello.json
git commit -m "feat(tina): projects collection schema (single-doc list)"
```

---

## Task 4: Migrate project data and repoint the data module

**Files:**
- Create: `content/projects.json`
- Modify: `data/projects.ts`
- Modify: `docs/superpowers/specs/2026-06-10-tinacms-admin-design.md` (record the single-doc deviation)
- Test: existing `test/projects.test.ts` must stay green

- [ ] **Step 1: Create `content/projects.json` from the existing data**

Wrap the current `data/ma-projects.json` array under a `projects` key. Programmatically:

```bash
node -e "const a=require('./data/ma-projects.json');require('fs').writeFileSync('content/projects.json',JSON.stringify({projects:a},null,2))"
```
Expected: `content/projects.json` exists as `{ "projects": [ ...all projects... ] }`.

- [ ] **Step 2: Repoint `data/projects.ts` to the new file**

Change the import and mapping source (keep everything else — types, helpers, exports — identical for now):
```ts
import maData from "@/content/projects.json";
import { categoryForType, type CategoryKey } from "@/data/categories";

export interface Project {
  slug: string;
  name: string;
  type: string;
  year: number;
  location: string;
  category: CategoryKey;
  images: string[];
}

interface RawProject {
  slug: string;
  name: string;
  type: string;
  year: number;
  location: string;
  images: string[];
}

export const PROJECTS: Project[] = (maData.projects as RawProject[]).map((p) => ({
  slug: p.slug,
  name: p.name,
  type: p.type,
  year: p.year,
  location: p.location,
  category: categoryForType(p.type),
  images: p.images,
}));

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function projectsByCategory(cat: string): Project[] {
  return PROJECTS.filter((p) => p.category === cat);
}

export function nextProject(slug: string): Project {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  return PROJECTS[(i + 1) % PROJECTS.length];
}
```

- [ ] **Step 3: Ensure JSON import works (tsconfig)**

Confirm `tsconfig.json` has `"resolveJsonModule": true` (Next defaults include it). If a type error appears on `maData.projects`, add at top of `data/projects.ts`: `// @ts-expect-error JSON module shape` is NOT acceptable — instead cast: `(maData as { projects: RawProject[] }).projects`.

- [ ] **Step 4: Run the existing data tests**

Run: `pnpm test test/projects.test.ts`
Expected: PASS (same assertions, data unchanged — count ≥ 30, fields present, `germia-concert-hall` resolves, etc.).

- [ ] **Step 5: Delete the old data file and update the spec**

```bash
git rm data/ma-projects.json
```
In the spec, edit §3 (Layer 1) and §5 to state projects are a **single document `content/projects.json` with a `projects` list** (reason: client-bundled `PROJECTS` needs a synchronous import).

- [ ] **Step 6: Run the full suite + build**

Run: `pnpm test`
Expected: all tests pass.
Run: `pnpm build`
Expected: builds clean.

- [ ] **Step 7: Commit**

```bash
git add content/projects.json data/projects.ts docs/superpowers/specs/2026-06-10-tinacms-admin-design.md
git rm data/ma-projects.json
git commit -m "feat(tina): migrate projects to content/projects.json (single-doc list)"
```

---

## Task 5: Extract pure project helpers (TDD refactor)

Decouples find/filter/next logic from the data source so it's unit-testable and reused by both the static path and any Tina-fetched data.

**Files:**
- Create: `lib/projectHelpers.ts`
- Create: `test/projectHelpers.test.ts`
- Modify: `data/projects.ts`

- [ ] **Step 1: Write the failing test**

Create `test/projectHelpers.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { findProject, filterByCategory, getNextProject } from "@/lib/projectHelpers";
import type { Project } from "@/data/projects";

const P = (slug: string, category: Project["category"]): Project => ({
  slug, name: slug.toUpperCase(), type: "Residence", year: 2024,
  location: "Tirana, Albania", category, images: ["/mastudio/x/img-0.jpg"],
});

const list: Project[] = [P("a", "residential"), P("b", "culture"), P("c", "residential")];

describe("projectHelpers", () => {
  it("findProject returns the match or undefined", () => {
    expect(findProject(list, "b")?.slug).toBe("b");
    expect(findProject(list, "zzz")).toBeUndefined();
  });
  it("filterByCategory keeps only matching", () => {
    expect(filterByCategory(list, "residential").map((p) => p.slug)).toEqual(["a", "c"]);
  });
  it("getNextProject wraps around", () => {
    expect(getNextProject(list, "c")?.slug).toBe("a");
    expect(getNextProject(list, "a")?.slug).toBe("b");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test test/projectHelpers.test.ts`
Expected: FAIL — cannot resolve `@/lib/projectHelpers`.

- [ ] **Step 3: Implement the pure helpers**

Create `lib/projectHelpers.ts`:
```ts
import type { Project } from "@/data/projects";

export function findProject(projects: Project[], slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function filterByCategory(projects: Project[], cat: string): Project[] {
  return projects.filter((p) => p.category === cat);
}

export function getNextProject(projects: Project[], slug: string): Project | undefined {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) return undefined;
  return projects[(i + 1) % projects.length];
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test test/projectHelpers.test.ts`
Expected: PASS.

- [ ] **Step 5: Delegate `data/projects.ts` exports to the helpers**

Replace the three helper functions in `data/projects.ts` with delegations (keep signatures identical so existing callers/tests are unaffected):
```ts
import { findProject, filterByCategory, getNextProject } from "@/lib/projectHelpers";

export function getProject(slug: string): Project | undefined {
  return findProject(PROJECTS, slug);
}
export function projectsByCategory(cat: string): Project[] {
  return filterByCategory(PROJECTS, cat);
}
export function nextProject(slug: string): Project {
  return getNextProject(PROJECTS, slug)!; // PROJECTS is non-empty; preserves prior return type
}
```

- [ ] **Step 6: Run the full suite**

Run: `pnpm test`
Expected: `test/projects.test.ts` and `test/projectHelpers.test.ts` both pass.

- [ ] **Step 7: Commit**

```bash
git add lib/projectHelpers.ts test/projectHelpers.test.ts data/projects.ts
git commit -m "refactor(projects): extract pure find/filter/next helpers with tests"
```

---

## Task 6: Visual click-to-edit on the project detail page

Establishes the reusable Tina editing pattern (Server fetch + Client `useTina` + `tinaField`). Validate this pattern here before repeating it.

**Files:**
- Create: `components/tina/ProjectDetailEditable.tsx`
- Modify: `app/projects/[slug]/page.tsx`
- Reference: `node_modules/tinacms` (verify `useTina`/`tinaField` import paths during execution)

- [ ] **Step 1: Confirm the generated Tina client exists**

After `pnpm dev` (or `pnpm exec tinacms build`), confirm `tina/__generated__/client.ts` exports a `client` with `client.queries.projects(...)`. If the generated query name differs, use the actual name from `tina/__generated__/types.ts`.

- [ ] **Step 2: Create the client editable wrapper**

Create `components/tina/ProjectDetailEditable.tsx`:
```tsx
"use client";
import { useTina, tinaField } from "tinacms/dist/react";
import ProjectPageView from "@/components/viewer/ProjectPageView";
import type { Project } from "@/data/projects";
import { categoryForType } from "@/data/categories";

type TinaProps = { query: string; variables: object; data: any };

export default function ProjectDetailEditable(props: { slug: string; tina: TinaProps }) {
  const { data } = useTina(props.tina);
  const raw = (data.projects.projects as any[]).find((p) => p.slug === props.slug);
  if (!raw) return null;
  const project: Project = {
    slug: raw.slug, name: raw.name, type: raw.type, year: raw.year,
    location: raw.location, category: categoryForType(raw.type),
    images: raw.images ?? [],
  };
  // tinaField(raw, "name") etc. provides the click-to-edit binding target.
  return <ProjectPageView project={project} editTarget={raw} />;
}
```

- [ ] **Step 3: Add an optional `editTarget` prop to `ProjectPageView` and bind fields**

In `components/viewer/ProjectPageView.tsx` (and the `ProjectMeta` it renders), accept an optional `editTarget?: any` and spread `data-tina-field={editTarget && tinaField(editTarget, "name")}` onto the name element, `"location"` onto location, etc. When `editTarget` is undefined (normal static render) the attribute is omitted. Import `tinaField` from `tinacms/dist/react` in those client components only.

- [ ] **Step 4: Fetch via Tina in the page and mount the wrapper**

In `app/projects/[slug]/page.tsx`, for the project branch (not the category branch), fetch through Tina and render the editable wrapper:
```tsx
import { client } from "@/tina/__generated__/client";
// ...
const res = await client.queries.projects({ relativePath: "projects.json" });
return (
  <ProjectDetailEditable
    slug={slug}
    tina={{ query: res.query, variables: res.variables, data: res.data }}
  />
);
```
Keep `generateStaticParams` unchanged (it still enumerates slugs from `PROJECTS`).

- [ ] **Step 5: Verify static visitors still see the page**

Run: `pnpm dev`. Visit `/projects/<an existing slug>` directly (not via `/admin`).
Expected: page renders identically to before (no overlay, no errors in console).

- [ ] **Step 6: Verify click-to-edit works inside the admin preview**

In `/admin`, open the Projects document, use Tina's visual/preview editing for a project page, click the project name/location on the previewed page.
Expected: the corresponding field opens; typing updates the preview live; saving rewrites `content/projects.json`.

- [ ] **Step 7: Run tests + build**

Run: `pnpm test` → all pass. Run: `pnpm build` → clean.

- [ ] **Step 8: Commit**

```bash
git add components/tina/ProjectDetailEditable.tsx components/viewer/ProjectPageView.tsx components/project/ProjectMeta.tsx app/projects/[slug]/page.tsx
git commit -m "feat(tina): click-to-edit on project detail page"
```

---

## Task 7: Visual click-to-edit on the home / project list

**Files:**
- Create: `components/tina/ProjectListEditable.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create the home editable wrapper**

Create `components/tina/ProjectListEditable.tsx`:
```tsx
"use client";
import { useTina } from "tinacms/dist/react";
import ProjectList from "@/components/project/ProjectList";
import type { Project } from "@/data/projects";
import { categoryForType, isCategoryKey } from "@/data/categories";

type TinaProps = { query: string; variables: object; data: any };

export default function ProjectListEditable(props: { activeCategory: string | null; tina: TinaProps }) {
  const { data } = useTina(props.tina);
  const all: Project[] = (data.projects.projects as any[]).map((p) => ({
    slug: p.slug, name: p.name, type: p.type, year: p.year, location: p.location,
    category: categoryForType(p.type), images: p.images ?? [],
  }));
  const projects = props.activeCategory && isCategoryKey(props.activeCategory)
    ? all.filter((p) => p.category === props.activeCategory)
    : all;
  return <ProjectList projects={projects} />;
}
```

- [ ] **Step 2: Fetch via Tina in `app/page.tsx` and mount the wrapper**

Keep the `IntroOverlay` and the active-category chip markup. Replace the `<ProjectList projects={projects} />` line with a Tina fetch + `<ProjectListEditable .../>`, passing the resolved `active` category. (Render `ProjectList` only through the wrapper.)

- [ ] **Step 3: Verify**

Run: `pnpm dev`. Visit `/` and `/?category=residential`.
Expected: identical list to before; category filter still works.

- [ ] **Step 4: Run tests + build, then commit**

Run: `pnpm test` → pass. Run: `pnpm build` → clean.
```bash
git add components/tina/ProjectListEditable.tsx app/page.tsx
git commit -m "feat(tina): click-to-edit on home project list"
```

---

## Task 8: Manual acceptance — create a project with photos end-to-end

No code; a verification gate proving the core ask. Record results in the commit body if anything is adjusted.

- [ ] **Step 1: Create a project via the admin**

Run `pnpm dev` → `/admin` → Projects → add a list item: name "Test Pavilion", slug "test-pavilion", type "Culture", year 2026, location "Tirana, Albania". Upload 2 photos (they should save under `/public/...`). Save.

- [ ] **Step 2: Verify it appears on the site**

Expected: `content/projects.json` gains the new item; `/` lists "Test Pavilion"; `/projects/test-pavilion` renders with the uploaded photos; ⌘K search finds it. (A dev refresh/rebuild reflects it since `PROJECTS` reads the file.)

- [ ] **Step 3: Verify edit + delete**

Edit a field via click-to-edit on the page; remove the test item from the list. Confirm the site updates and `content/projects.json` reflects each change (each save is a commit-able diff).

- [ ] **Step 4: Commit any fixups discovered**

```bash
git add -A
git commit -m "test(tina): verify project create/edit/delete with photo upload"
```

---

# Phase 2 — Richer project fields

## Task 9: Add description/client/status/size to schema, type, and migration

**Files:**
- Modify: `tina/config.ts`, `data/projects.ts`, `lib/projectHelpers.ts` (type only), `content/projects.json`

- [ ] **Step 1: Extend the Tina schema**

In the `projects` object fields (Task 3), add after `images`:
```ts
{ type: "rich-text", name: "description", label: "Description" },
{ type: "string", name: "client", label: "Client" },
{ type: "string", name: "status", label: "Status" },
{ type: "string", name: "size", label: "Size" },
```

- [ ] **Step 2: Extend the `Project` and `RawProject` types**

In `data/projects.ts` add optional fields to both interfaces and the mapping:
```ts
// in Project and RawProject:
description?: unknown;   // Tina rich-text AST (rendered via TinaMarkdown)
client?: string;
status?: string;
size?: string;
```
Map them through in the `PROJECTS` `.map(...)`: `description: p.description, client: p.client, status: p.status, size: p.size,`.

- [ ] **Step 3: Update the data test to allow the new optional fields**

In `test/projects.test.ts` no change is required (new fields optional). Add one assertion to lock the type contract:
```ts
it("optional rich fields are absent or correctly typed", () => {
  for (const p of PROJECTS) {
    if (p.client !== undefined) expect(typeof p.client).toBe("string");
    if (p.size !== undefined) expect(typeof p.size).toBe("string");
  }
});
```

- [ ] **Step 4: Run tests + regenerate Tina**

Run: `pnpm test` → pass. Run: `pnpm exec tinacms build` → schema generates.

- [ ] **Step 5: Commit**

```bash
git add tina/config.ts data/projects.ts test/projects.test.ts
git commit -m "feat(projects): add description/client/status/size fields"
```

---

## Task 10: Render the new fields on the detail page (TDD)

**Files:**
- Modify: `components/project/ProjectMeta.tsx`, `components/viewer/ProjectPageView.tsx`
- Test: `test/projectmeta.test.tsx` (create)

- [ ] **Step 1: Write the failing render test**

Create `test/projectmeta.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectMeta from "@/components/project/ProjectMeta";
import type { Project } from "@/data/projects";

const base: Project = {
  slug: "x", name: "X", type: "Culture", year: 2026, location: "Tirana, Albania",
  category: "culture", images: ["/mastudio/x/img-0.jpg"],
  client: "City of Tirana", status: "Completed", size: "12,000 m²",
};

describe("ProjectMeta new fields", () => {
  it("renders client, status, and size when present", () => {
    render(<ProjectMeta project={base} />);
    expect(screen.getByText("City of Tirana")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("12,000 m²")).toBeInTheDocument();
  });
  it("omits fields when absent", () => {
    const { container } = render(<ProjectMeta project={{ ...base, client: undefined, status: undefined, size: undefined }} />);
    expect(container.textContent).not.toContain("Client");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test test/projectmeta.test.tsx`
Expected: FAIL — "City of Tirana" not found.

- [ ] **Step 3: Render the fields conditionally in `ProjectMeta`**

Add, after the existing `Field` rows, conditional rows using the existing `Field` component:
```tsx
{project.client && <Field label="Client" value={project.client} />}
{project.status && <Field label="Status" value={project.status} />}
{project.size && <Field label="Size" value={project.size} />}
```

- [ ] **Step 4: Render `description` body in `ProjectPageView`**

Where body copy belongs on the detail page, render the rich-text when present:
```tsx
import { TinaMarkdown } from "tinacms/dist/rich-text";
// ...
{project.description ? <div className="prose-body"><TinaMarkdown content={project.description as any} /></div> : null}
```
Use an existing text style class consistent with the page (check `app/globals.css`); do not introduce a new design system.

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm test test/projectmeta.test.tsx`
Expected: PASS.

- [ ] **Step 6: Full suite + build + commit**

Run: `pnpm test` → pass. Run: `pnpm build` → clean.
```bash
git add components/project/ProjectMeta.tsx components/viewer/ProjectPageView.tsx test/projectmeta.test.tsx
git commit -m "feat(projects): render client/status/size/description on detail page"
```

---

## Task 11: Bind the new fields for click-to-edit

**Files:**
- Modify: `components/project/ProjectMeta.tsx`, `components/viewer/ProjectPageView.tsx`

- [ ] **Step 1: Add `tinaField` bindings**

For each new editable element, add `data-tina-field={editTarget && tinaField(editTarget, "client")}` (and `"status"`, `"size"`, `"description"`) using the `editTarget` prop already threaded in Task 6.

- [ ] **Step 2: Verify in admin preview**

Run `pnpm dev` → `/admin` preview → click the client/status/size/description on a project page → correct field opens and edits live.

- [ ] **Step 3: Commit**

```bash
git add components/project/ProjectMeta.tsx components/viewer/ProjectPageView.tsx
git commit -m "feat(tina): click-to-edit for new project fields"
```

---

# Phase 3 — About + Cofounders

## Task 12: About schema + migration + repoint

**Files:**
- Modify: `tina/config.ts`, `data/about.ts`
- Create: `content/about.json`
- Test: `test/about.test.ts` (exists) must stay green

- [ ] **Step 1: Add the `about` singleton collection to `tina/config.ts`**

```ts
{
  name: "about",
  label: "About",
  path: "content",
  format: "json",
  match: { include: "about" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "object", name: "sections", label: "Sections", list: true,
      ui: { itemProps: (i) => ({ label: i?.title || "Section" }) },
      fields: [
        { type: "string", name: "title", label: "Title" },
        { type: "rich-text", name: "body", label: "Body" },
        { type: "string", name: "items", label: "Items", list: true },
        {
          type: "object", name: "subsections", label: "Subsections", list: true,
          ui: { itemProps: (i) => ({ label: i?.title || "Subsection" }) },
          fields: [
            { type: "string", name: "title", label: "Title" },
            { type: "rich-text", name: "body", label: "Body" },
          ],
        },
      ],
    },
  ],
},
```

- [ ] **Step 2: Generate `content/about.json` from `data/about.ts`**

Convert `ABOUT_SECTIONS` into `{ "sections": [...] }`. Each section's `body` paragraphs become a rich-text value. Simplest reliable conversion: store each paragraph as a rich-text document with one paragraph node per string. Write a one-off Node script that maps `body: string[]` → a rich-text root `{ type: "root", children: paragraphs.map(t => ({ type: "p", children:[{ type:"text", text:t }] })) }`; keep `items` and `subsections` as-is (subsection bodies converted the same way). Save to `content/about.json`.

- [ ] **Step 3: Repoint `data/about.ts`**

Replace the inlined `ABOUT_SECTIONS` constant with a read from `content/about.json`, preserving the exported type names. Because the page currently expects `body: string[]`, add an adapter that flattens rich-text paragraphs back to `string[]` for any component still using the old shape, OR update `AboutSections` to render rich-text (preferred — see Task 13). Keep `ABOUT_SECTIONS` exported so `test/about.test.ts` resolves.

- [ ] **Step 4: Keep `test/about.test.ts` green**

Run: `pnpm test test/about.test.ts`
Expected: PASS. If the test asserts `body` is `string[]`, either keep the adapter that yields `string[]`, or update the test to the rich-text shape — choose the adapter to minimize churn here; the render switch happens in Task 13.

- [ ] **Step 5: Commit**

```bash
git add tina/config.ts data/about.ts content/about.json
git commit -m "feat(tina): about content migrated to content/about.json"
```

---

## Task 13: About page click-to-edit

**Files:**
- Create: `components/tina/AboutEditable.tsx`
- Modify: `app/about/page.tsx`, `components/about/AboutSections.tsx`

- [ ] **Step 1: Fetch via Tina in `app/about/page.tsx`**

Mirror Task 6: `const res = await client.queries.about({ relativePath: "about.json" });` and render `<AboutEditable tina={{query,variables,data}} />`.

- [ ] **Step 2: Create `AboutEditable.tsx` using `useTina`**

Render `AboutSections` from `data.about.sections`, passing an `editTarget` for each section so `tinaField(section, "title")` / `"body"` bind. Render section `body` via `TinaMarkdown`.

- [ ] **Step 3: Update `AboutSections` to render rich-text body + accept edit targets**

Switch body rendering to `TinaMarkdown` (replacing the `string[]` paragraph map). Keep `items` and `subsections` rendering. Add optional `editTarget` props for `tinaField` bindings. Update `test/aboutsections.test.tsx` to the new rendering (assert section titles + that body text appears).

- [ ] **Step 4: Verify + test + build**

Run `pnpm dev` → `/admin` preview → click an About paragraph → edits live. Run `pnpm test` → pass. Run `pnpm build` → clean.

- [ ] **Step 5: Commit**

```bash
git add components/tina/AboutEditable.tsx app/about/page.tsx components/about/AboutSections.tsx test/aboutsections.test.tsx
git commit -m "feat(tina): click-to-edit on About page"
```

---

## Task 14: Cofounders schema + migration + repoint

**Files:**
- Modify: `tina/config.ts`, `data/founders.ts`
- Create: `content/cofounders.json`
- Test: `test/founders.test.ts` (exists) stays green

- [ ] **Step 1: Add the `cofounders` singleton collection**

```ts
{
  name: "cofounders",
  label: "Cofounders",
  path: "content",
  format: "json",
  match: { include: "cofounders" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "object", name: "founders", label: "Founders", list: true,
      ui: { itemProps: (i) => ({ label: i?.name || "Founder" }) },
      fields: [
        { type: "string", name: "name", label: "Name" },
        { type: "string", name: "role", label: "Role" },
        { type: "rich-text", name: "bio", label: "Bio" },
        { type: "image", name: "image", label: "Photo" },
      ],
    },
  ],
},
```

- [ ] **Step 2: Generate `content/cofounders.json` from `FOUNDERS`**

Map each founder; convert `bio: string[]` → rich-text (same paragraph conversion as Task 12). Save `{ "founders": [...] }`.

- [ ] **Step 3: Repoint `data/founders.ts`**

Read from `content/cofounders.json`, keep `Founder` type and `FOUNDERS` export. Provide a `string[]` bio adapter if needed to keep `test/founders.test.ts` green, mirroring Task 12 Step 4.

- [ ] **Step 4: Test + commit**

Run: `pnpm test test/founders.test.ts` → pass.
```bash
git add tina/config.ts data/founders.ts content/cofounders.json
git commit -m "feat(tina): cofounders content migrated to content/cofounders.json"
```

---

## Task 15: Cofounders page click-to-edit

**Files:**
- Create: `components/tina/CofoundersEditable.tsx`
- Modify: `app/cofounders/page.tsx`, `components/founder/FounderCard.tsx`

- [ ] **Step 1: Fetch via Tina in `app/cofounders/page.tsx`** (mirror Task 13 Step 1, `relativePath: "cofounders.json"`).

- [ ] **Step 2: `CofoundersEditable.tsx`** renders `FounderCard` per founder with `editTarget` bindings; bio via `TinaMarkdown`.

- [ ] **Step 3: Update `FounderCard`** to render rich-text bio + accept `editTarget`; update `test/foundercard.test.tsx` accordingly (assert name/role render and bio text appears).

- [ ] **Step 4: Verify + test + build + commit**

```bash
git add components/tina/CofoundersEditable.tsx app/cofounders/page.tsx components/founder/FounderCard.tsx test/foundercard.test.tsx
git commit -m "feat(tina): click-to-edit on Cofounders page"
```

---

# Phase 4 — Contact / Offices / Footer

## Task 16: Contact schema + migration + repoint

**Files:**
- Modify: `tina/config.ts`, `data/offices.ts`
- Create: `content/contact.json`
- Test: `test/contact.test.tsx` (exists) stays green

- [ ] **Step 1: Add the `contact` singleton collection**

```ts
{
  name: "contact",
  label: "Contact",
  path: "content",
  format: "json",
  match: { include: "contact" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "object", name: "offices", label: "Offices", list: true,
      ui: { itemProps: (i) => ({ label: i?.city || "Office" }) },
      fields: [
        { type: "string", name: "city", label: "City" },
        { type: "string", name: "label", label: "Label" },
        { type: "string", name: "address", label: "Address lines", list: true },
        { type: "string", name: "email", label: "Email" },
        { type: "string", name: "phone", label: "Phone" },
      ],
    },
    {
      type: "object", name: "socials", label: "Socials", list: true,
      ui: { itemProps: (i) => ({ label: i?.label || "Social" }) },
      fields: [
        { type: "string", name: "label", label: "Label" },
        { type: "string", name: "href", label: "URL" },
      ],
    },
    { type: "string", name: "services", label: "Services", list: true },
  ],
},
```

- [ ] **Step 2: Generate `content/contact.json` from `OFFICES`, `SOCIALS`, `SERVICES`**

Write `{ "offices":[...], "socials":[...], "services":[...] }` mirroring the current arrays exactly. Save to `content/contact.json`.

- [ ] **Step 3: Repoint `data/offices.ts`**

Read `OFFICES`, `SOCIALS`, `SERVICES` from `content/contact.json`; keep type exports identical.

- [ ] **Step 4: Test + commit**

Run: `pnpm test test/contact.test.tsx` → pass.
```bash
git add tina/config.ts data/offices.ts content/contact.json
git commit -m "feat(tina): contact/offices/socials migrated to content/contact.json"
```

---

## Task 17: Contact page + Footer click-to-edit

**Files:**
- Create: `components/tina/ContactEditable.tsx`
- Modify: `app/contact/page.tsx`, `components/footer/Footer.tsx`

- [ ] **Step 1: Fetch via Tina in `app/contact/page.tsx`** (`relativePath: "contact.json"`), render `<ContactEditable tina={...} />`.

- [ ] **Step 2: `ContactEditable.tsx`** renders the existing contact markup from `data.contact`, binding `tinaField` on email (the h1), phone, address lines, and socials.

- [ ] **Step 3: Footer** — the footer is site-wide (rendered in `layout.tsx`), so it cannot use a per-page Tina fetch without threading data through the layout. For v1, make the footer's office/social text read from the same `content/contact.json` static import (already repointed in Task 16) so edits show after rebuild; full live click-to-edit in the footer is deferred (note this in the commit body as a known limitation). Verify the footer still renders the migrated values.

- [ ] **Step 4: Verify + test + build**

Run `pnpm dev` → `/admin` preview → click the contact email/phone → edits live. Run `pnpm test` → pass. Run `pnpm build` → clean.

- [ ] **Step 5: Commit**

```bash
git add components/tina/ContactEditable.tsx app/contact/page.tsx components/footer/Footer.tsx
git commit -m "feat(tina): click-to-edit on Contact page; footer reads contact content"
```

---

## Final verification

- [ ] Run `pnpm test` — entire suite green.
- [ ] Run `pnpm build` — clean, no console errors.
- [ ] Manual: from `/admin`, create a project with photos, edit text via click-to-edit on Projects/About/Cofounders/Contact, confirm each save produces a `content/*.json` (and `/public` image) diff committable to `master`.
- [ ] Confirm normal visitors (not `/admin`) see every page render identically to pre-Tina, statically generated.

---

## Self-review notes (coverage vs spec)

- Spec §1 Projects CRUD + photos → Tasks 3–8. Richer fields → Tasks 9–11. About → 12–13. Cofounders → 14–15. Contact/Offices/Footer → 16–17.
- Spec §3 static-generation preserved → render path uses synchronous `content/*.json` imports behind unchanged `data/*` APIs; `generateStaticParams` untouched (Task 6 Step 4).
- Spec §2 pnpm → Task 1. Local-only/no-auth → no auth tasks; `clientId/token: null` (Task 2).
- Spec §6 category stays derived → `categoryForType` retained throughout; no category editor.
- **Known deviation:** single-doc projects list instead of one-file-per-project (reason: client-bundled `PROJECTS`); spec updated in Task 4 Step 5.
- **Known limitation:** footer live click-to-edit deferred (Task 17 Step 3); footer still reflects edited content after rebuild.
- **Execution risk to watch:** exact Tina import paths (`tinacms/dist/react`, `tinacms/dist/rich-text`), generated query names, and local (no-cloud) build data resolution — validated early in Task 2 and Task 6; adjust to the actual generated client if names differ.
