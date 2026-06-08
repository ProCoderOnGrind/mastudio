# big.dk Frontend Replica — Design Spec

**Date:** 2026-06-08
**Status:** Approved
**Goal:** A faithful 1:1 reproduction of the **frontend experience** of [big.dk](https://big.dk) (Bjarke Ingels Group) — layout, design system, page structure, interactions, and animations — built on an equivalent stack, using original placeholder content so it is shareable.

---

## 1. Scope

**In scope**
- Every page *type* on big.dk, pixel-faithful in design + animation:
  - Projects index (home), Project detail, Category index, News (+ Events/Awards/Lectures), About, Sustainability, People, Careers, Contact.
- The **first 34 projects** as sample data (real names/locations/typologies, placeholder imagery + text).
- Global chrome: header + overlay menu, category flyouts, ⌘K command menu, footer accordions, custom cursor, blur-up images, scroll reveal.
- Responsive behaviour (desktop-first, adapting to tablet/mobile like the original).

**Out of scope**
- Real BIG photography and copy (replaced with original placeholders).
- The remaining ~270 projects beyond the first 34.
- Backend / CMS / database.
- Functional job-application or contact form submission (UI only).

---

## 2. Tech Stack

Matches the real site's stack (confirmed via inspection: `_next/static`, Turbopack, Tailwind v4 theme tokens, Vercel).

- **Next.js (App Router) + React + TypeScript**
- **Tailwind CSS v4** (theme-token driven, matching their token names where sensible)
- **`next/font`** for the typeface
- **`next/image`** for blur-up (LQIP) image loading
- **IntersectionObserver** (small custom hook) for scroll reveal
- Local **TypeScript data modules** under `/data` — no CMS
- Minimal client JS; animations favour CSS/Tailwind transitions to match the site's restrained, performant feel. (Optional: Framer Motion only if route transitions need it.)

### Route map
| Route | Page |
|---|---|
| `/` | Projects index (home) |
| `/projects/[slug]` | Project detail |
| `/projects/[category]` | Category index (architecture, interiors, landscape, planning, products) |
| `/news`, `/news/events`, `/news/awards`, `/news/lectures` | News list (tabbed) |
| `/about` | About |
| `/sustainability` | Sustainability |
| `/people` | People |
| `/careers` | Careers |
| `/contact` | Contact |

---

## 3. Design System

### Color (monochrome — color only from imagery)
- Background: `#ffffff`
- Primary text: `#000000`
- Secondary / meta text (locations, roles): `#898989` (their `--color-big-gray`)
- Hairline borders / dividers: `~#e5e7eb` (gray-200)

### Typography
- Single grotesque typeface via `next/font`.
- Everett is commercially licensed → use **Geist** (free, neutral Swiss grotesque, closest easy match). Alternatives noted: Hanken Grotesk, Inter.
- Weights: 400 (primary), 700 (occasional).
- Scale (derived from their Tailwind tokens):
  - Body: ~15px, line-height ~21px
  - Nav: 16px
  - Labels / meta: 11–12px, **UPPERCASE**
  - Links: 14px (often uppercase)
  - Page titles (ABOUT / PEOPLE / CAREERS / NEWS): very large, ~clamp up to ~100px, weight 400, tight line-height
- Heavy use of UPPERCASE for labels; generous whitespace; tight leading.

### Tokens / misc
- Default easing: `cubic-bezier(.4, 0, .2, 1)`
- Spacing base: `.25rem`
- `xl` breakpoint: 1440px
- Custom cursor assets (SVG): arrow-right, arrow-right-slide, pause (white variants), echoing their `--cursor-*` tokens.

---

## 4. Global Components

### Header
- BIG wordmark (top-left, links to `/`).
- Hamburger toggle → **overlay nav** (compact uppercase list, top-left): Projects, News, About, Sustainability, People, Careers, Contact.
- On the projects index: centered **category tabs** (Architecture, Interiors, Landscape, Planning, Products), each with a **hover flyout** revealing subcategories + "View all".
  - Architecture subs: culture, education, work, hospitality, residential, infrastructure, space, sports, health
  - Landscape subs: civic-spaces, parks, gardens, balconies-and-terraces
  - Planning subs: campus, city, region
  - Products subs: lighting, furniture, consumer-products, mobility, installations
- **Command Menu (⌘K)** at top-right: command-palette search to filter / jump to projects & pages.

### Footer (site-wide)
- Four expandable accordion columns, each toggled by a `+`:
  - **Email**: New Projects, Press, Lectures, Exhibitions (mailto links, placeholder addresses)
  - **Office**: office locations (Copenhagen, Barcelona, London, New York, Shanghai, Los Angeles, Zürich, Bhutan)
  - **Social**: Instagram, X, LinkedIn, Vimeo, Facebook, WeChat
  - **Legal**: policy links (placeholder), Whistleblower Policy
- Animated **"Back to top"** (smooth scroll).

### Shared building blocks
- `BlurImage` — `next/image` wrapper with LQIP blur-up + fade.
- `Reveal` — IntersectionObserver-based scroll reveal (fade/slide).
- `CustomCursor` — context-aware cursor over galleries/video.
- `Accordion`, `Flyout`, `CommandMenu`.

---

## 5. Page Layouts

- **Home (`/`)**: vertical flex list of 34 rows. Each row = small mono project icon + project name + location (left), project image (right, with the real varied aspect ratios). Category filter + ⌘K search. Blur-up + scroll reveal on images.
- **Project detail (`/projects/[slug]`)**: sticky left metadata column (name, location, year, client, typology, size, status) + large hero/media + body text + image gallery. Custom cursor over gallery.
- **Category (`/projects/[category]`)**: big category title + filtered list of matching projects (same row style as home).
- **News (`/news` + tabs)**: sub-tab nav (News / Events / Awards / Lectures), large "NEWS" title, list of `article` rows (date · image · headline · optional excerpt · "read more" expand-in-place).
- **About (`/about`)**: large "ABOUT" title + multi-column intro text (signed) + image gallery + further sections.
- **Sustainability (`/sustainability`)**: large title + featured image + content sections with section labels + "read more".
- **People (`/people`)**: large "PEOPLE" title + left filter sidebar (Partners / Associates-Directors / by office) + list of names with right-aligned roles; `+` expands an entry.
- **Careers (`/careers`)**: large title + multi-column intro + office image grid (labelled) + open-positions list.
- **Contact (`/contact`)**: minimal contact info (emails, offices) — mirrors footer content in page form.

---

## 6. Animations & Interactions (priority)

| Interaction | Behaviour |
|---|---|
| Image load | Blur-up from LQIP placeholder → full image, subtle fade |
| Scroll | Elements fade/slide in via IntersectionObserver |
| Hover (project row / image) | Subtle scale/opacity shift, `transition: all` with site easing |
| Hover (links) | Color / underline state |
| Menu | Open/close of overlay nav |
| Category tabs | Hover flyout of subcategories |
| Footer | Accordion expand/collapse with `+` / `−` |
| News "read more" | Expand excerpt in place |
| ⌘K | Command palette open/close + fuzzy filter |
| Cursor | Custom arrow/slide cursor over galleries, pause over video |
| Route change | Soft client-side transition (no full reload) |
| Back to top | Smooth scroll to top |

All easing uses `cubic-bezier(.4, 0, .2, 1)` to match the original.

---

## 7. Content / Data Approach

- **34 projects** carry **real names, locations, and typologies** (factual labels, e.g. "CopenHill · Copenhagen, Denmark · Infrastructure · 2019 · Completed") so the index reads like BIG. First-34 slugs (in order) captured from the live site:
  1. eve-music-hall · 2. not-a-hotel-setouchi · 3. gastronomy-open-ecosystem · 4. citywave · 5. tennessee-performing-arts-center · 6. east-side-coastal-resiliency · 7. the-plus · 8. bloomberg-student-center-at-johns-hopkins-university · 9. suzhou-museum-of-contemporary-art · 10. hamburg-state-opera · 11. sankt-lukas-hospice-and-lukashuset · 12. claremont-mckenna-college · 13. manresa-island · 14. big-hq · 15. gelephu-international-airport · 16. the-impact · 17. gowanus-175-third-street · 18. jinji-lake-pavilion · 19. athletics-las-vegas-ballpark · 20. the-drop · 21. gelephu-mindfulness-city · 22. solar-one-environmental-education-center · 23. hungarian-natural-history-museum · 24. new-dubai-masterplan · 25. ancient-future-bridging-bhutanese-tradition-and-innovation · 26. fira-barcelona-business-hub · 27. opera-and-ballet-theatre-of-kosovo · 28. copenhill · 29. one-high-line · 30. joint-research-center · 31. musee-atelier-audemars-piguet · 32. the-spiral · 33. lego-brand-house · 34. noma-2-0
- **Imagery**: original placeholders — tasteful grayscale/duotone gradient blocks at the real aspect ratios, with a faint geometric motif + project name. Real photos can be dropped in later by swapping the data layer. Blur-up effect retained.
- **Descriptions / body copy**: lorem-style placeholder text.
- **News / People / Careers**: realistic placeholder entries (generated names, dates, roles, offices).

---

## 8. Project Structure (intended)

```
/app
  layout.tsx            # Header + Footer + CustomCursor
  page.tsx              # Home (projects index)
  /projects/[slug]/page.tsx
  /projects/[category]/page.tsx
  /news/[[...tab]]/page.tsx
  /about/page.tsx
  /sustainability/page.tsx
  /people/page.tsx
  /careers/page.tsx
  /contact/page.tsx
/components
  Header.tsx  Menu.tsx  CategoryTabs.tsx  Flyout.tsx  CommandMenu.tsx
  Footer.tsx  Accordion.tsx  BackToTop.tsx
  BlurImage.tsx  Reveal.tsx  CustomCursor.tsx
  ProjectRow.tsx  ProjectMeta.tsx  Gallery.tsx
  NewsArticle.tsx  PeopleList.tsx  CareersPositions.tsx
/data
  projects.ts  news.ts  people.ts  offices.ts  categories.ts
/lib
  placeholder.ts        # deterministic gradient/LQIP generation
/public/cursors         # SVG cursor assets
```

---

## 9. Success Criteria

- Visiting the replica feels indistinguishable in **layout, typography, spacing, and motion** from big.dk (with placeholder media in place of real photos).
- All page types render and are navigable; the first 34 projects exist with detail pages.
- All listed animations/interactions work and use the matching easing.
- Responsive across desktop / tablet / mobile.
- Builds and runs cleanly (`next build` passes, no console errors).
