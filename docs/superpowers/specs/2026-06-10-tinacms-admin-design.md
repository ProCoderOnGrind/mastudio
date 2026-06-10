# TinaCMS Admin for MA Studio — Design Spec

**Date:** 2026-06-10
**Status:** Draft (awaiting user review)
**Goal:** Give the MA Studio site a WordPress-style admin where the owner can create/edit/delete projects (with photos and all info), and edit site text and images by clicking them on the page itself — backed by TinaCMS, with content staying as files in the repo and every save committing to `master`.

---

## 1. Scope

**In scope**
- Integrate **TinaCMS** into the existing Next.js 16 / React 19 app (on **pnpm**).
- **Tina admin dashboard** at `/admin` (collections, create/edit forms, media manager) — the "WordPress-like" admin.
- **Click-on-page visual editing**: an editable preview of the live site where clicking wired-up text/photos opens the field in a side panel and updates live.
- Content managed by Tina:
  - **Projects** — full create / edit / delete, photo upload + reorder, all fields.
  - **Richer project fields** beyond today's — description/body, client, status, size.
  - **About** page sections.
  - **Cofounders** page.
  - **Contact / Offices / Footer** info (offices, socials, services).
- Preserve **static generation** (`generateStaticParams`) and the existing public API of `data/projects.ts`.
- Migrate existing content (`ma-projects.json`, `about.ts`, `founders.ts`, `offices.ts`) into Tina-managed content files.

**Out of scope (for this build)**
- **Authentication** — editing is **local-only** (`tina dev` on the owner's machine). No login, no Tina Cloud, no Git remote required. Edits commit to local `master`.
- Deployed/public editing (would later need Tina Cloud or self-hosted Tina auth + a Git remote).
- A bespoke admin UI that visually mimics WordPress. Tina's admin *works* like WordPress (collections, forms, media) but *looks* like Tina. Light theming only.
- Categories remain **derived** from project `type` via `categoryForType()` (no per-project category editor in v1; see §6).

---

## 2. Tech & Constraints

- **Stack:** Next.js `16.2.7` (App Router, Turbopack), React `19.2.4`, TypeScript, Tailwind v4, Vitest.
- **CMS:** TinaCMS 3.x (Git-backed). Confirmed to support Next.js 16 + React 19 with visual click-to-edit.
- **Package manager:** **switch to pnpm** (Tina recommends pnpm ≥ its 2.7.3 release to avoid npm module-resolution issues). Generate `pnpm-lock.yaml`; remove npm lockfile if present; update scripts.
- **Dev command:** Tina wraps Next dev — `tinacms dev -c "next dev"` (exposes the local content GraphQL server + `/admin`). `start`/`build` gain a `tinacms build` step.
- **Editing model:** local-only, open admin (no auth). Each save = a Git commit to `master`, consistent with this project's existing workflow.
- **AGENTS.md constraint:** this Next.js may differ from training data — consult `node_modules/next/dist/docs/` before writing route/build code.

---

## 3. Architecture (4 layers)

### Layer 1 — Content files (source of truth, in repo)
- Projects: `ma-projects.json` → **single document `content/projects.json` with a `projects` list** (Tina collection, single document). Note: a multi-file collection cannot be used here because `PROJECTS` is bundled into the client by `lib/search.ts` (used by the `SearchBar` client component), requiring a synchronous static JSON import — which a multi-file collection cannot provide without codegen.
- About: `data/about.ts` → `content/about/index.json` (single document; nested sections modeled as object/list fields).
- Cofounders: `data/founders.ts` → `content/cofounders/index.json` (list of founders).
- Contact/Offices: `data/offices.ts` → `content/contact/index.json` (offices, socials, services).
- Images continue to live in `/public`. Tina media store points at `/public` (e.g. `mediaRoot` configured so uploads land under `/public/mastudio/...` or `/public/uploads`).

### Layer 2 — Tina schema (`tina/config.ts`)
- Defines collections, fields, and the media folder. Generates a typed client + GraphQL API into `tina/__generated__/`.
- Collections: `projects` (single doc — `content/projects.json` with a `projects` list), `about` / `cofounders` / `contact` (single-doc singletons).

### Layer 3 — Data-access shim (isolation boundary)
- `data/projects.ts` keeps its **exact public API**: the `Project` interface and `getProject`, `projectsByCategory`, `nextProject`, plus `PROJECTS`. Internally it sources from Tina's generated content instead of a static JSON import.
- `category` continues to be derived via `categoryForType(type)`.
- Because content is files on disk at build time, `generateStaticParams` still enumerates slugs → **the site stays statically generated**; the rest of the app changes minimally.
- Analogous thin shims back `about.ts` / `founders.ts` / `offices.ts` so consuming components keep their current imports/types where practical.

### Layer 4 — Pages split for visual editing
Editable pages become **Server Component (Tina fetch) + Client Component (`useTina` wrapper)**, with editable elements tagged (`data-tina-field`) for click-to-edit overlays:
- `app/page.tsx` (home / project list)
- `app/projects/[slug]/page.tsx` (project detail) + `ProjectMeta`, `Gallery`
- `app/about/page.tsx` + `AboutSections`
- `app/cofounders/page.tsx` + `FounderCard`
- `app/contact/page.tsx`

The static (non-edit) render path must remain unchanged for normal visitors; Tina overlays activate only inside the admin/edit context.

---

## 4. Collection Schemas

### `projects` (single document `content/projects.json` with a `projects` list — full CRUD)
| Field | Type | Notes |
|---|---|---|
| `name` | string | required; project title |
| `slug` | string | doc filename; used in `/projects/[slug]` |
| `type` | string | drives derived category (e.g. "Residence", "Retail") |
| `year` | number | |
| `location` | string | |
| `images` | list of image | upload/reorder; first image = card/hero |
| `description` | rich-text | **new** — body copy on detail page (Tina rich-text for clean click-to-edit; rendered as paragraphs) |
| `client` | string | **new**, optional |
| `status` | string | **new**, optional (e.g. Completed / In progress) |
| `size` | string | **new**, optional (e.g. "12,000 m²") |

`ProjectMeta` and `ProjectPageView` extended to render `description`, `client`, `status`, `size` when present (graceful when absent, so existing projects don't break).

### `about` (single document)
Models the existing nested structure: list of `sections`, each with `title`, optional `body` (rich-text), optional `items` (string list), optional `subsections` (`title` + `body` rich-text). This is the most complex schema; build/verify it carefully.

### `cofounders` (single document)
List of founders: `name`, `role`, `bio` (rich-text), optional `image`.

### `contact` (single document)
- `offices`: list of `{ city, label, address[], email, phone }`.
- `socials`: list of `{ label, href }`.
- `services`: string list.

---

## 5. Migration

One-time conversion (scriptable), each verified against current rendered output:
1. `ma-projects.json` → **`content/projects.json`** (single document with a `projects` list; new fields default empty/absent). Multi-file per-project is not viable because `PROJECTS` must be a synchronous static import for `lib/search.ts` / `SearchBar` (client component).
2. `about.ts` → `content/about/index.json`.
3. `founders.ts` → `content/cofounders/index.json`.
4. `offices.ts` → `content/contact/index.json`.
5. Repoint `data/*.ts` modules to read Tina content (or expose the same shapes from generated content).
6. Update any **Vitest** tests that import the data modules directly if shapes/paths shift; keep public APIs stable to minimize churn.

---

## 6. Known Risks & Decisions

- **Admin look:** Tina's admin is its own UI, not a WordPress skin. Confirmed acceptable; light theming only.
- **Page-split refactor** touches home, project detail, about, cofounders, contact (+ their child components) and may require test updates. Largest source of churn.
- **Nested About schema** is the trickiest Tina model (lists of objects with optional sub-lists). Treat as its own milestone.
- **pnpm switch** changes the project's package manager and lockfile.
- **Category derivation:** kept automatic (`categoryForType`). If a new project's `type` doesn't match a rule it falls to `commercial`. A manual category override field is a possible later addition, not v1.
- **Tina + Next 16 Turbopack dev wrapping** should be validated early (smoke-test `tinacms dev -c "next dev"` boots `/admin` and serves the site).

---

## 7. Build Phases (sequenced; one spec)

- **Phase 1 — Foundation + Projects:** pnpm switch; install Tina; `tina/config.ts` with `projects` collection + media; migrate projects; data-shim; split home + project detail for visual editing; `/admin` CRUD + photo upload/reorder + click-to-edit working. **Delivers the core ask.**
- **Phase 2 — Richer project fields:** add `description`, `client`, `status`, `size`; render on detail page.
- **Phase 3 — About + Cofounders:** schemas, migration, page splits, click-to-edit.
- **Phase 4 — Contact / Offices / Footer:** schema, migration, page split, click-to-edit.

---

## 8. Success Criteria

- Running `pnpm dev` (Tina-wrapped) serves the site **and** an open `/admin` locally.
- From `/admin`, the owner can **create a new project**, fill all fields, **upload and reorder photos**, save — and the project appears on the site (home list + its own detail page) after the static rebuild/refresh.
- Existing projects, About, Cofounders, and Contact render identically to today after migration (no visual regression).
- On the editable preview, **clicking a project's text or a photo, an About paragraph, a founder bio, and contact info** opens the matching field and updates live.
- Each save produces a **Git commit** with the changed content/image files.
- `next build` (with `tinacms build`) passes; no console errors; existing Vitest suite green (updated where shapes changed).
- The site remains **statically generated** for normal visitors; no auth required for local editing.
