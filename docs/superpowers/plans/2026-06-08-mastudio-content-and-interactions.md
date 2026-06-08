# MA Studio Content + Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the intro animation (ring text + brand green + positioning), make every homepage project image full-screen, add an interactive blur-reveal to the CoFounders cards with the real founder bios, and add condensed/SEO company sections to the About page.

**Architecture:** Content lives in typed data modules (`data/founders.ts`, `data/about.ts`); presentation lives in focused client components (`FounderCard`, `AboutSections`) that reuse existing primitives (`BlurImage`, `Accordion`, `Reveal`). Pure/data and component behavior are unit-tested with Vitest + Testing Library; purely visual outcomes (intro, full-screen scroll, blur-reveal) are verified live with Playwright by the controller.

**Tech Stack:** Next.js 16.2.7 (App Router), React 19, Tailwind v4, Framer Motion 12, Vitest + Testing Library (jsdom).

**Branch:** `feature/content-and-interactions` (already created).

---

## Key facts established during planning (do not re-derive)

- **`components/intro/IntroOverlay.tsx` already has an uncommitted edit** — the orange→green recolor (`LOGO_GREEN = "#94c52d"`, sampled from `public/mastudio/logo-dark.png`). Task 1 commits it together with the ring-text and positioning fixes. Do **not** revert it.
- **The intro overlay positioning bug:** `app/template.tsx` wraps every page in `<div className="animate-[fadein_.4s...]">`, whose 0.4s `transform` makes it the containing block for `position: fixed` descendants. With `fixed inset-0`, the overlay's `bottom:0` resolves to the document height (huge) and mis-centers. Fix = size by viewport units instead: `fixed inset-x-0 top-0 h-screen` (height is `100vh`, viewport-relative, independent of the containing block). The fly-to-logo morph runs at ~2.6s, after the template transform is gone, so it's unaffected.
- **jsdom polyfills** for `IntersectionObserver` (used by `Reveal`/`useScrollReveal`) and `matchMedia` are already in `test/setup.ts`.
- **Reuse, don't rebuild:** `components/media/BlurImage.tsx` (gradient placeholder when `src` is absent; accepts `ratio={null}` to size by height), `components/footer/Accordion.tsx` (`{ title, children }`, collapsible, content stays in the DOM — SEO-safe), `components/motion/Reveal.tsx`, `components/PageTitle.tsx`.
- **The repo stores non-ASCII as literal UTF-8** (e.g. `data/offices.ts` has `Frashëri`). Write the accented names/quotes/dashes in this plan as literal characters.
- **Test commands:** `npm test` (all), `npx vitest run <file>` (one), `npm run lint`, `npm run build`. `@` alias → repo root.
- **Existing `test/cofounders.test.tsx` will break** in Task 5 (it asserts `/Founding Partner/`, which the new roles drop) — Task 5 updates it.

---

## File structure

| File | Responsibility |
| --- | --- |
| `components/intro/IntroOverlay.tsx` | **Modify** — ring text, keep green, `inset-0`→`inset-x-0 top-0 h-screen`, export `RING_TEXT` |
| `components/project/ProjectRow.tsx` | **Modify** — every row full-screen; `priority` only when `hero` |
| `data/founders.ts` | **Modify** — real Ervin & Klodiana; `bio: string[]` |
| `components/founder/FounderCard.tsx` | **Create** — portrait + name + click blur-reveal bio |
| `app/cofounders/page.tsx` | **Modify** — render `FounderCard` |
| `data/about.ts` | **Create** — typed sections 2–10 content |
| `components/about/AboutSections.tsx` | **Create** — render sections as Accordions |
| `app/about/page.tsx` | **Modify** — fix intro date, render `AboutSections` |
| `test/introoverlay.test.tsx` | **Modify** — add ring-text assertion |
| `test/founders.test.ts`, `test/foundercard.test.tsx`, `test/about.test.ts`, `test/aboutsections.test.tsx` | **Create** |
| `test/cofounders.test.tsx` | **Modify** — assert real names instead of "Founding Partner" |

---

## Task 1: Intro fixes (ring text + green + positioning)

**Files:**
- Modify: `components/intro/IntroOverlay.tsx`
- Test: `test/introoverlay.test.tsx`

> The file already contains the uncommitted green recolor. This task adds the ring-text and positioning fixes and commits all three together.

- [ ] **Step 1: Add the failing ring-text test**

In `test/introoverlay.test.tsx`, add `RING_TEXT` to the existing import from the component and append this test inside the `describe("IntroOverlay", ...)` block:

Change the import line:
```tsx
import IntroOverlay from "@/components/intro/IntroOverlay";
```
to:
```tsx
import IntroOverlay, { RING_TEXT } from "@/components/intro/IntroOverlay";
```

Add this test:
```tsx
  it("spins the real logo wording on the ring", () => {
    expect(RING_TEXT).toContain("MODELLING ARCHITECTURE");
    expect(RING_TEXT).not.toContain("STUDIO");
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run test/introoverlay.test.tsx`
Expected: FAIL — `RING_TEXT` is not exported (and currently includes "STUDIO").

- [ ] **Step 3: Apply the three edits in `components/intro/IntroOverlay.tsx`**

(a) Export the constant and change its value. Change:
```tsx
const RING_TEXT = "MODELLING ARCHITECTURE · MA STUDIO & PARTNERS · ";
```
to:
```tsx
export const RING_TEXT = "MODELLING ARCHITECTURE · ";
```

(b) Fill the circle with more repeats. Change:
```tsx
            <textPath href="#introRing">{RING_TEXT.repeat(2)}</textPath>
```
to:
```tsx
            <textPath href="#introRing">{RING_TEXT.repeat(3)}</textPath>
```

(c) Make the overlay viewport-sized regardless of the template transform. Change the overlay's className:
```tsx
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
```
to:
```tsx
      className="fixed inset-x-0 top-0 z-[100] flex h-screen items-center justify-center bg-white"
```

Make no other changes (leave the `LOGO_GREEN` recolor as-is).

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run test/introoverlay.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Run the full suite and lint**

Run: `npm test` then `npm run lint`
Expected: all tests pass; lint clean.

- [ ] **Step 6: Commit (includes the green recolor already in the working tree)**

```bash
git add components/intro/IntroOverlay.tsx test/introoverlay.test.tsx
git commit -m "fix(intro): real ring wording, brand-green emblem, viewport-anchored overlay"
```

---

## Task 2: Full-screen project images

**Files:**
- Modify: `components/project/ProjectRow.tsx`

> Visual task — no new unit test; run the suite to guard against regressions. `ProjectList.tsx` is unchanged (it still passes `hero={i === 0}`, now used only to set `priority`).

- [ ] **Step 1: Replace the entire contents of `components/project/ProjectRow.tsx`**

```tsx
"use client";
import { useRef } from "react";
import Reveal from "@/components/motion/Reveal";
import BlurImage from "@/components/media/BlurImage";
import { useViewer } from "@/components/viewer/ViewerContext";
import type { Project } from "@/data/projects";

export default function ProjectRow({ project, hero = false }: { project: Project; hero?: boolean }) {
  const { open } = useViewer();
  const imgWrap = useRef<HTMLDivElement>(null);

  const handleOpen = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    const r = imgWrap.current?.getBoundingClientRect();
    open(project, r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null);
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
        <div ref={imgWrap} className="overflow-hidden">
          <div className="transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.02]">
            <BlurImage
              src={project.images[0]}
              label={project.name}
              ratio={null}
              priority={hero}
              className="h-[calc(100svh-140px)]"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        </div>
      </a>
    </Reveal>
  );
}
```

- [ ] **Step 2: Run the suite**

Run: `npm test`
Expected: PASS (no regressions; no test targets ProjectRow directly).

- [ ] **Step 3: Commit**

```bash
git add components/project/ProjectRow.tsx
git commit -m "feat: every homepage project image is full-screen (priority on first only)"
```

---

## Task 3: Real founder data

**Files:**
- Modify: `data/founders.ts`
- Test: `test/founders.test.ts`

- [ ] **Step 1: Write the failing test**

Create `test/founders.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { FOUNDERS } from "@/data/founders";

describe("founders data", () => {
  it("has the two real co-founders in order", () => {
    expect(FOUNDERS.map((f) => f.name)).toEqual(["Ervin Taçi", "Klodiana Emiri Taçi"]);
  });
  it("each founder has a role and a non-empty multi-paragraph bio", () => {
    for (const f of FOUNDERS) {
      expect(f.role).toBeTruthy();
      expect(Array.isArray(f.bio)).toBe(true);
      expect(f.bio.length).toBeGreaterThanOrEqual(1);
      expect(f.bio.every((p) => p.length > 0)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run test/founders.test.ts`
Expected: FAIL — current `FOUNDERS` are placeholders and `bio` is a string, not an array.

- [ ] **Step 3: Replace the entire contents of `data/founders.ts`**

```ts
export interface Founder {
  name: string;
  role: string;
  bio: string[]; // paragraphs
  image?: string; // optional /public path; gradient placeholder used when absent
}

export const FOUNDERS: Founder[] = [
  {
    name: "Ervin Taçi",
    role: "Co-Founder — Architect & Urban Designer",
    bio: [
      "Ervin Taçi grew up in an artistic family, developing an early sensitivity to art and design. In 2000 he co-founded DEA Studio and led the practice for 20 years, and in 2020 co-founded MA Studio & Partners. He is recognized for innovative, ambitious projects that challenge traditional architectural conventions and scales—consistently integrating sustainable, socially responsive concepts while balancing playful expression with practical functionality.",
      "A guest professor at the Architecture Faculty in Tirana and a member of the Leading Board of the Albanian Architecture Association (AAA), he is widely recognized as an urban designer and architect through an extensive portfolio of award-winning competitions and commissioned projects.",
    ],
  },
  {
    name: "Klodiana Emiri Taçi",
    role: "Co-Founder — Architect & Urban Planner · Technical Director",
    bio: [
      "Klodiana Emiri (Taçi) is an architect and urban planner and a co-founder of DEA Studio (2002) and MA Studio & Partners (2020). She has taught at several esteemed academic institutions in Albania and is currently a lecturer at the Architecture Faculty of Tirana.",
      "From 2008 to 2012 she served as Secretary-General of the Albanian Architecture Association (AAA), representing Albanian architects at the Union of International Architects. As Technical Director of MA Studio & Partners, she leads the development of complex, high-profile projects—ensuring design excellence, technical rigor, and a clear architectural vision across the studio's work.",
    ],
  },
];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run test/founders.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add data/founders.ts test/founders.test.ts
git commit -m "feat: real co-founder data (Ervin Taçi, Klodiana Emiri Taçi)"
```

---

## Task 4: FounderCard component (blur-reveal)

**Files:**
- Create: `components/founder/FounderCard.tsx`
- Test: `test/foundercard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `test/foundercard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FounderCard from "@/components/founder/FounderCard";
import type { Founder } from "@/data/founders";

const sample: Founder = {
  name: "Test Founder",
  role: "Co-Founder — Tester",
  bio: ["First paragraph about the founder.", "Second paragraph."],
};

describe("FounderCard", () => {
  it("shows the name, role, and bio text", () => {
    render(<FounderCard founder={sample} />);
    expect(screen.getByText("Test Founder")).toBeInTheDocument();
    expect(screen.getByText("Co-Founder — Tester")).toBeInTheDocument();
    expect(screen.getByText(/First paragraph/)).toBeInTheDocument();
  });
  it("toggles the reveal when the portrait is clicked", () => {
    render(<FounderCard founder={sample} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run test/foundercard.test.tsx`
Expected: FAIL — `@/components/founder/FounderCard` does not exist.

- [ ] **Step 3: Create `components/founder/FounderCard.tsx`**

```tsx
"use client";
import { useState } from "react";
import BlurImage from "@/components/media/BlurImage";
import type { Founder } from "@/data/founders";

export default function FounderCard({ founder }: { founder: Founder }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="border-t border-hairline pt-4">
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        aria-expanded={revealed}
        aria-label={revealed ? `Hide ${founder.name}'s bio` : `Read ${founder.name}'s bio`}
        className="relative block w-full cursor-pointer overflow-hidden text-left"
      >
        {/* Portrait — blurs when revealed */}
        <div
          className="transition-[filter,transform] duration-500 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none"
          style={{
            filter: revealed ? "blur(8px)" : "blur(0px)",
            transform: revealed ? "scale(1.04)" : "scale(1)",
          }}
        >
          <BlurImage
            src={founder.image}
            seed={founder.name}
            label={founder.name}
            ratio="3 / 4"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        {/* Bio overlay — fades in over the blurred portrait */}
        <div
          className="absolute inset-0 flex flex-col gap-3 overflow-auto bg-black/55 p-5 text-white transition-opacity duration-500 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none"
          style={{ opacity: revealed ? 1 : 0, pointerEvents: revealed ? "auto" : "none" }}
        >
          {founder.bio.map((p, i) => (
            <p key={i} className="text-[13px] leading-relaxed">{p}</p>
          ))}
        </div>
      </button>
      <div className="mt-3 text-[18px] leading-tight">{founder.name}</div>
      <div className="label meta">{founder.role}</div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run test/foundercard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/founder/FounderCard.tsx test/foundercard.test.tsx
git commit -m "feat: FounderCard with click-to-reveal blurred-portrait bio"
```

---

## Task 5: Wire the CoFounders page to FounderCard

**Files:**
- Modify: `app/cofounders/page.tsx`
- Modify: `test/cofounders.test.tsx`

- [ ] **Step 1: Update the page test to the new content**

Replace the entire contents of `test/cofounders.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CoFoundersPage from "@/app/cofounders/page";

describe("CoFounders page", () => {
  it("renders a card for each co-founder", () => {
    render(<CoFoundersPage />);
    expect(screen.getByText("Co-Founders")).toBeInTheDocument();
    expect(screen.getByText("Ervin Taçi")).toBeInTheDocument();
    expect(screen.getByText("Klodiana Emiri Taçi")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run test/cofounders.test.tsx`
Expected: FAIL — the current page renders `f.bio` as a string and the names appear, but this is the point where we confirm the page still renders the names through the new component path; if it already passes, proceed (the real switch happens in Step 3). If it fails because the old page shows the bio string, that's expected.

- [ ] **Step 3: Replace the entire contents of `app/cofounders/page.tsx`**

```tsx
import PageTitle from "@/components/PageTitle";
import Reveal from "@/components/motion/Reveal";
import FounderCard from "@/components/founder/FounderCard";
import { FOUNDERS } from "@/data/founders";

export default function CoFoundersPage() {
  return (
    <div>
      <PageTitle>Co-Founders</PageTitle>
      <div className="grid gap-10 px-5 md:grid-cols-2">
        {FOUNDERS.map((f, i) => (
          <Reveal key={f.name} delay={i * 60}>
            <FounderCard founder={f} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run test/cofounders.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add app/cofounders/page.tsx test/cofounders.test.tsx
git commit -m "feat: CoFounders page uses interactive FounderCard"
```

---

## Task 6: About sections data

**Files:**
- Create: `data/about.ts`
- Test: `test/about.test.ts`

- [ ] **Step 1: Write the failing test**

Create `test/about.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ABOUT_SECTIONS } from "@/data/about";

describe("about sections data", () => {
  it("lists sections 2–10 in order", () => {
    expect(ABOUT_SECTIONS.map((s) => s.title)).toEqual([
      "Profile & Philosophy",
      "Company Profile",
      "International Collaborations",
      "Achievements",
      "Awards",
      "International Conferences",
      "Company Expertise",
      "Sustainability",
      "Office Structure",
    ]);
  });
  it("keeps collaborator and project names as list items", () => {
    const collab = ABOUT_SECTIONS.find((s) => s.title === "International Collaborations");
    expect(collab?.items).toContain("MVRDV");
    const profile = ABOUT_SECTIONS.find((s) => s.title === "Company Profile");
    expect(profile?.items?.some((i) => i.includes("Tirana Olympic Park"))).toBe(true);
  });
  it("Company Expertise has the six disciplines", () => {
    const exp = ABOUT_SECTIONS.find((s) => s.title === "Company Expertise");
    expect(exp?.subsections?.map((s) => s.title)).toEqual([
      "Workplace Consultancy",
      "Project Management",
      "Urban Design",
      "Architecture",
      "Engineering",
      "Interior Design",
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run test/about.test.ts`
Expected: FAIL — `@/data/about` does not exist.

- [ ] **Step 3: Create `data/about.ts`**

```ts
export interface AboutSubsection {
  title: string;
  body: string[];
}

export interface AboutSection {
  title: string;
  body?: string[];
  items?: string[];
  subsections?: AboutSubsection[];
}

export const ABOUT_SECTIONS: AboutSection[] = [
  {
    title: "Profile & Philosophy",
    body: [
      "MA Studio & Partners Ltd. was established in February 2020 as the continuation of the renowned design office DEA Studio Ltd (2000–2020), founded by partners Ervin Taçi and Klodiana Emiri Taçi. National and international experience meets new design challenges under one constant “open-mind” philosophy. From the start, both partners were drawn to the interplay between scales of thinking—the city and the dwelling, the abstract and the real. Rather than forcing these into a fixed dogma, the studio explores them through distinct concepts and concrete projects. Continuous research is not about definitive answers but about raising the questions that move society forward.",
    ],
  },
  {
    title: "Company Profile",
    body: [
      "Building on the legacy of DEA Studio (2000–2020), MA Studio & Partners has delivered 200+ commissioned projects for Albanian and international public institutions and private clients, with 160+ realized works spanning masterplanning, public buildings, culture, hospitality, and large-scale residential design (700,000+ m²). Selected realized works:",
    ],
    items: [
      "General Local Plans of Vlora, Saranda, Himara, Konispol, Libohova, Delvina & Finiq",
      "Kashar Masterplan (240 ha)",
      "Tirana Olympic Park Masterplan",
      "Durana — Tirana–Durrës Economic Corridor (Lot 3)",
      "Lushnja city-center revitalization",
      "Qeparo, Dhërmi, Jala & Livadh waterfronts",
      "Saranda coastal promenade",
      "“Feti Borova” Sports Palace",
      "Albanian Olympic Committee building",
      "Maliqi Theater",
      "Medieval Museum of Korça",
      "Korça historical bazaar restoration",
      "“Andon Zako Çajupi” Theater, Korça",
      "“Jan Kukuzeli” Art School & “Jusuf Puka” High School, Durrës",
      "Gjirokastra historical bazaar restoration",
      "Germia Concert Hall & Prishtina Arena, Kosovo",
      "Zvernec Masterplan (500 ha)",
      "“Univers City” Masterplan (45 ha)",
      "LIDL Balkan hub, Porto Romano",
      "Ebolowa Education Masterplan (220 ha), “Bantu” Museum & University of Art, Cameroon",
      "Shkodra Cultural Center",
      "“Reiffeisen” Administrative Center",
      "“Downtown 1” tower (40 floors), Tirana",
      "Porto Romano Hydrocarbons Terminal",
      "Hotel Hilton (200 rooms), Tirana",
      "Hotel Intercontinental (150 rooms), Riga",
      "“Turgut Özal” College & Memorial International School of Tirana",
    ],
  },
  {
    title: "International Collaborations",
    body: [
      "MA Studio & Partners carries the know-how of its founders' collaborations with leading international practices:",
    ],
    items: [
      "Hijjas Kasturi Architects",
      "MVRDV",
      "HLT",
      "Studio Gang",
      "Oppenheim Architecture",
      "Sauerbruch Hutton",
      "Bolles+Wilson",
      "l'AUC",
      "JDS Architects",
      "Atena Studio",
      "TPA",
      "NOA",
    ],
  },
  {
    title: "Achievements",
    body: [
      "First prize in 18 national and international open competitions, including the “Durana — Tirana–Durrës Economic Corridor” and the “Borea Ski Resort” in Peja, Kosovo. Further placements: 2nd — Germia Concert Hall, Prishtina; 2nd — Prishtina Arena; 3rd — New Parliamentary Complex of Albania; 3rd — Tirana Train Station Towers.",
    ],
  },
  {
    title: "Awards",
    body: [
      "Honors carried from the founders include the BIG SEE Architecture Award 2019 and the ICONIC Award 2019 (Innovative Architecture) for Tirana Olympic Park; two nominations for the EU Mies van der Rohe Award 2019; an Architizer A+ Award 2019 nomination (Tirana Olympic Park); and a Grand Prix nomination for the Korça Medieval Art Museum (Culture, 2018).",
    ],
  },
  {
    title: "International Conferences",
    items: [
      "“Tirana Olympic Park” — SHARE Forum, Tirana 2018",
      "“Tirana Olympic Park” — SHARE Forum, Budapest 2018",
      "“Ebolowa Education Campus Masterplan” — SHARE Forum, Bucharest 2022",
    ],
  },
  {
    title: "Company Expertise",
    subsections: [
      {
        title: "Workplace Consultancy",
        body: [
          "We begin by helping clients evaluate their needs—across residences, workplaces, schools, hospitals, and cultural and civic buildings. Analyzing context at scale, we align the value of place with the client's goals before proposing concepts and solutions.",
        ],
      },
      {
        title: "Project Management",
        body: [
          "Our in-house group delivers an integrated service across a project's lifecycle—concept, construction, completion—covering budgeting and cost control, programme and resource management, and contract administration, on time, on budget, and to the highest quality.",
        ],
      },
      {
        title: "Urban Design",
        body: [
          "We study the city holistically—behavior, demographics, and the hidden systems shaping the built environment—and design socially driven public spaces where people choose to meet, sit, and talk, helping public and private clients create sustainable, future-ready developments.",
        ],
      },
      {
        title: "Architecture",
        body: [
          "We believe surroundings shape daily life. Before form, we ask how a building will be used and understood, designing human-scaled, “small, low, and slow” spaces that encourage interaction, comfort, and the poetic modelling of space through natural light and greenery.",
        ],
      },
      {
        title: "Engineering",
        body: [
          "Two in-house engineering groups—environmental and structural—integrate from the outset, working alongside design teams to safeguard quality and reinforce the studio's sustainability agenda through to completion.",
        ],
      },
      {
        title: "Interior Design",
        body: [
          "Architecture should flow seamlessly from outside to inside. From private houses to office towers and galleries, we coordinate light, materials, color, and furnishings as one scheme, with the same questioning and refinement as the building itself.",
        ],
      },
    ],
  },
  {
    title: "Sustainability",
    body: [
      "Sustainability has been central since day one. We assess environmental performance holistically—from embodied energy to lifetime use—and pioneer renewable-energy solutions that cut pollution and carbon. Through passive design—optimizing form, orientation, envelope, and microclimate—we minimize, and often eliminate, reliance on active mechanical systems while keeping occupants comfortable, reducing energy demand before mechanical systems are even considered.",
    ],
  },
  {
    title: "Office Structure",
    body: [
      "MA Studio & Partners operates as a living, open academy where knowledge circulates freely. A horizontal ethos keeps hierarchy as a framework for clear decisions, not a constraint—every voice is a potential catalyst, and younger team members are relied on for fresh cultural and technological perspectives. A culture of productive tension and “artistic urgency”—spontaneous sketch competitions and rapid conceptual studies—keeps the studio experimenting and continually redefining its own boundaries.",
    ],
  },
];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run test/about.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add data/about.ts test/about.test.ts
git commit -m "feat: condensed/SEO About section content as structured data"
```

---

## Task 7: AboutSections component

**Files:**
- Create: `components/about/AboutSections.tsx`
- Test: `test/aboutsections.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `test/aboutsections.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutSections from "@/components/about/AboutSections";

describe("AboutSections", () => {
  it("renders each top-level section title", () => {
    render(<AboutSections />);
    expect(screen.getByText("Profile & Philosophy")).toBeInTheDocument();
    expect(screen.getByText("Company Expertise")).toBeInTheDocument();
    expect(screen.getByText("Office Structure")).toBeInTheDocument();
  });
  it("keeps list names in the DOM (SEO-safe accordions)", () => {
    render(<AboutSections />);
    expect(screen.getByText("MVRDV")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run test/aboutsections.test.tsx`
Expected: FAIL — `@/components/about/AboutSections` does not exist.

- [ ] **Step 3: Create `components/about/AboutSections.tsx`**

```tsx
import Accordion from "@/components/footer/Accordion";
import { ABOUT_SECTIONS } from "@/data/about";

export default function AboutSections() {
  return (
    <section className="mt-12 px-5">
      {ABOUT_SECTIONS.map((s) => (
        <Accordion key={s.title} title={s.title}>
          {s.body?.map((p, i) => (
            <p key={i} className="mb-3 max-w-[72ch] text-[14px] leading-relaxed">{p}</p>
          ))}
          {s.items && (
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {s.items.map((it) => (
                <li key={it} className="meta text-[13px]">{it}</li>
              ))}
            </ul>
          )}
          {s.subsections?.map((sub) => (
            <div key={sub.title} className="mb-4">
              <div className="label mb-1">{sub.title}</div>
              {sub.body.map((p, i) => (
                <p key={i} className="max-w-[72ch] text-[14px] leading-relaxed">{p}</p>
              ))}
            </div>
          ))}
        </Accordion>
      ))}
    </section>
  );
}
```

> Note: `Accordion` is a `"use client"` component; importing it into this (server) component is fine — its client boundary is preserved.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run test/aboutsections.test.tsx`
Expected: PASS (2 tests). (Accordion keeps its content mounted in the DOM even when collapsed, so the names are queryable.)

- [ ] **Step 5: Commit**

```bash
git add components/about/AboutSections.tsx test/aboutsections.test.tsx
git commit -m "feat: AboutSections renders company sections as SEO-safe accordions"
```

---

## Task 8: Wire the About page

**Files:**
- Modify: `app/about/page.tsx`

> Visual + integration. Fix the contradictory founding date and render `AboutSections`.

- [ ] **Step 1: Replace the entire contents of `app/about/page.tsx`**

```tsx
import PageTitle from "@/components/PageTitle";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";
import AboutSections from "@/components/about/AboutSections";
import { PROJECTS } from "@/data/projects";
import { SERVICES } from "@/data/offices";

const gallery = PROJECTS.filter((p) => p.images.length).slice(0, 8);

export default function AboutPage() {
  return (
    <div>
      <PageTitle>About</PageTitle>
      <div className="grid gap-8 px-5 md:grid-cols-2">
        <p className="text-[15px]">
          Modelling Architecture is fascinated by the interplay of different levels of
          scale and thinking: the scale of the city and that of mankind; thinking in
          abstraction and thinking in tangibility. The cohesion of these levels is not to
          be found in one compulsive dogmatic theme, but rather in different concepts and
          concrete projects.
        </p>
        <p className="text-[15px]">
          The exploring attitude is not to find definitive answers, but to raise questions
          in order to continue the reflective and research working method for the future
          innovations of the common worldwide society. Established in 2020 as the
          continuation of DEA Studio (2000–2020), MA Studio &amp; Partners works across
          architecture, urban planning, landscape and interior design from its studio in
          Tirana, Albania.
        </p>
      </div>

      <div className="mt-10 grid gap-2 px-5 md:grid-cols-4">
        {SERVICES.map((s) => (
          <div key={s} className="label border-t border-hairline py-2">{s}</div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 px-5 md:grid-cols-4">
        {gallery.map((p, i) => (
          <Reveal key={p.slug} delay={i * 40}>
            <BlurImage src={p.images[0]} label={p.name} ratio="4 / 3" sizes="(max-width: 768px) 50vw, 25vw" />
          </Reveal>
        ))}
      </div>

      <AboutSections />
    </div>
  );
}
```

- [ ] **Step 2: Run the suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/about/page.tsx
git commit -m "feat: About page shows company sections; fix founding-date copy"
```

---

## Task 9: Final verification

**Files:** none (verification + optional tuning commit)

- [ ] **Step 1: Full suite**

Run: `npm test`
Expected: PASS — existing suites + new: `founders`, `foundercard`, `about`, `aboutsections`, updated `cofounders` and `introoverlay`.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds (watch for the async page typing and any "module not found").

- [ ] **Step 4: Live visual pass with Playwright (controller, 1440×900)**

1. **Intro:** fresh session → white overlay, **green** ring reading **"MODELLING ARCHITECTURE"** spinning around a static green **MA / Studio & Partners**, centered; then fades and the emblem flies to the header logo. Reload within session → no replay.
2. **Projects:** homepage scrolls one full-screen project per viewport; first image fully visible on load; later images lazy-load.
3. **CoFounders:** each card shows the portrait with the **name underneath**; clicking a portrait blurs it and fades the bio in over it; clicking again restores. Two founders: Ervin Taçi, Klodiana Emiri Taçi.
4. **About:** intro no longer says "1974"; sections 2–10 appear as accordions that expand/collapse; project/collaborator names are present.

- [ ] **Step 5: Final commit if tuning changed files**

```bash
git add -A
git commit -m "chore: final tuning for content + interactions"
```
(Skip if the working tree is clean.)

---

## Self-review (completed by plan author)

- **Spec coverage:** Intro ring text + green + positioning (Task 1) ✓ · full-screen projects with priority-on-first (Task 2) ✓ · real founder data (Task 3) ✓ · blur-reveal FounderCard (Task 4) + page wiring (Task 5) ✓ · About content data (Task 6) + AboutSections (Task 7) + page wiring with date fix (Task 8) ✓ · final verification (Task 9) ✓.
- **Placeholder scan:** all code blocks are complete; content is final copy from the spec; no TBD/TODO.
- **Type/name consistency:** `Founder.bio: string[]` (Task 3) consumed by `FounderCard` (Task 4) and page (Task 5); `RING_TEXT` exported (Task 1) and imported in its test; `ABOUT_SECTIONS` / `AboutSection` / `AboutSubsection` shape defined (Task 6) and consumed by `AboutSections` (Task 7) and its test; `hero` prop still passed by `ProjectList` and consumed as `priority` by `ProjectRow` (Task 2).
- **Known breakage handled:** `test/cofounders.test.tsx`'s old `/Founding Partner/` assertion is replaced in Task 5.
```
