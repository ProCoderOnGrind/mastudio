# MA Studio — Intro Fix, Full-Screen Projects, Interactive Founders, About Content

**Date:** 2026-06-08
**Status:** Approved (design); pending implementation plan
**Stack:** Next.js 16.2.7 (App Router, Turbopack), React 19, Tailwind v4, Framer Motion 12, Vitest + Testing Library (jsdom)
**Branch:** new feature branch off `master`

## Goal

Four polish items on the existing site: fix the intro animation (ring text + brand-green color + a positioning glitch), make every homepage project image full-screen like the first, add an interactive blur-reveal to the CoFounders cards with the real founder bios, and add condensed, SEO-reworded company sections to the About page.

## Pre-existing in-flight change

`components/intro/IntroOverlay.tsx` already has an **uncommitted** recolor from orange to the brand green `#94c52d` (sampled from `public/mastudio/logo-dark.png`). This work commits that recolor together with the ring-text and positioning fixes below.

---

## 1. Intro animation fixes — `components/intro/IntroOverlay.tsx`

- **Ring text.** Replace `RING_TEXT = "MODELLING ARCHITECTURE · MA STUDIO & PARTNERS · "` with `"MODELLING ARCHITECTURE · "` (the logo's actual wording, double-L). Repeat it enough times to fill the circle cleanly (tune the repeat count / font-size visually; start at `.repeat(3)`).
- **Color.** Keep the brand green `#94c52d` (constant `LOGO_GREEN`) already applied to the ring stroke, ring text, "MA", and "Studio & Partners".
- **Positioning.** The overlay is `fixed inset-0`. During `app/template.tsx`'s 0.4s `fadein` (which applies a `transform`), a transformed ancestor becomes the containing block, so `inset-0` sizes the overlay to the whole document and mis-centers it. **Fix:** change the overlay class from `fixed inset-0` to `fixed left-0 top-0 h-screen w-screen` so it is always viewport-sized. This preserves first-paint coverage and the fly-to-logo morph (which runs at ~2.6s, after the template transform is gone) still lands on `#site-logo`.
- **Acceptance:** on a fresh session the ring reads "MODELLING ARCHITECTURE", everything is green, the emblem is centered, then fades and flies to the header logo; plays once per session; reduced-motion still skips.

---

## 2. Full-screen project images — `components/project/ProjectRow.tsx`, `ProjectList.tsx`

- Every project image fills one viewport (the current hero treatment): `ratio={null}`, `className="h-[calc(100svh-140px)]"`. Remove the separate 16:9 branch so all rows render identically.
- Keep the same `md:grid-cols-[14rem_1fr] gap-5 px-5` grid and symmetric margins.
- **Performance:** pass `priority` only to the **first** row's image (`hero` = first); all other images keep Next's default lazy-loading + the BlurImage blur-up. So `ProjectList` still computes `hero={i === 0}`, but `ProjectRow` uses `hero` only to set `priority`, while applying the full-screen sizing to every row.
- **Acceptance:** the homepage scrolls one full-screen project at a time; the first image is still fully visible on load; later images lazy-load as you scroll.

---

## 3. Interactive CoFounders — `data/founders.ts`, new `components/founder/FounderCard.tsx`, `app/cofounders/page.tsx`

### Data (`data/founders.ts`)
`Founder` becomes `{ name: string; role: string; bio: string[]; image?: string }` (bio is an array of paragraphs). Two real founders (portraits remain placeholder gradients until photos are supplied):

**Ervin Taçi** — role: `Co-Founder — Architect & Urban Designer`
- "Ervin Taçi grew up in an artistic family, developing an early sensitivity to art and design. In 2000 he co-founded DEA Studio and led the practice for 20 years, and in 2020 co-founded MA Studio & Partners. He is recognized for innovative, ambitious projects that challenge traditional architectural conventions and scales—consistently integrating sustainable, socially responsive concepts while balancing playful expression with practical functionality."
- "A guest professor at the Architecture Faculty in Tirana and a member of the Leading Board of the Albanian Architecture Association (AAA), he is widely recognized as an urban designer and architect through an extensive portfolio of award-winning competitions and commissioned projects."

**Klodiana Emiri Taçi** — role: `Co-Founder — Architect & Urban Planner · Technical Director`
- "Klodiana Emiri (Taçi) is an architect and urban planner and a co-founder of DEA Studio (2002) and MA Studio & Partners (2020). She has taught at several esteemed academic institutions in Albania and is currently a lecturer at the Architecture Faculty of Tirana."
- "From 2008 to 2012 she served as Secretary-General of the Albanian Architecture Association (AAA), representing Albanian architects at the Union of International Architects. As Technical Director of MA Studio & Partners, she leads the development of complex, high-profile projects—ensuring design excellence, technical rigor, and a clear architectural vision across the studio's work."

### Component (`FounderCard.tsx`, `"use client"`)
- Renders a portrait (`BlurImage`, `3 / 4`) in a relative container, with the **name** (and role) **below** the image, always visible.
- The portrait is a `<button>` (accessible, `aria-expanded`). On click it toggles `revealed`:
  - the image wrapper gets `filter: blur(8px)` + a slight scale and a dark scrim;
  - an absolutely-positioned overlay holding the bio paragraphs fades in (`opacity` + small translate), `overflow-auto` for long text, with a close affordance (click anywhere on the card toggles back).
- Honors `prefers-reduced-motion` (no transition, just show/hide).
- `app/cofounders/page.tsx` maps `FOUNDERS` → `<FounderCard founder={f} />` inside the existing 2-column grid + `Reveal`.
- **Acceptance:** name shows under each photo; clicking a photo blurs it and reveals that founder's bio over it; clicking again restores; keyboard-operable.

---

## 4. About page sections — `data/about.ts`, new `components/about/AboutSections.tsx`, `app/about/page.tsx`

- **Fix the intro:** replace the existing "Founded in 1974…" sentence so it reads as established Feb 2020, continuing DEA Studio (2000–2020).
- Add sections **2–10** below the intro/services, condensed and SEO-reworded, keeping project / collaborator / award **names as lists**. The deep sections render as collapsible `Accordion`s (reusing `components/footer/Accordion.tsx`); content remains in the HTML (SEO-safe).
- `data/about.ts` exports a typed list of sections: `{ title; body?: string[]; items?: string[]; subsections?: { title; body: string[] }[] }`. `AboutSections.tsx` renders body paragraphs, `items` as a list, and `subsections` (for Company Expertise) as titled blocks — each top-level section inside an `Accordion`.

### Content (condensed, SEO)

**2 · Profile & Philosophy** (body)
> MA Studio & Partners Ltd. was established in February 2020 as the continuation of the renowned design office DEA Studio Ltd (2000–2020), founded by partners Ervin Taçi and Klodiana Emiri Taçi. National and international experience meets new design challenges under one constant "open-mind" philosophy. From the start, both partners were drawn to the interplay between scales of thinking—the city and the dwelling, the abstract and the real. Rather than forcing these into a fixed dogma, the studio explores them through distinct concepts and concrete projects. Continuous research is not about definitive answers but about raising the questions that move society forward.

**3 · Company Profile** (body + items)
> Building on the legacy of DEA Studio (2000–2020), MA Studio & Partners has delivered 200+ commissioned projects for Albanian and international public institutions and private clients, with 160+ realized works spanning masterplanning, public buildings, culture, hospitality, and large-scale residential design (700,000+ m²). Selected realized works:

Items: General Local Plans of Vlora, Saranda, Himara, Konispol, Libohova, Delvina & Finiq · Kashar Masterplan (240 ha) · Tirana Olympic Park Masterplan · Durana — Tirana–Durrës Economic Corridor (Lot 3) · Lushnja city-center revitalization · Qeparo, Dhërmi, Jala & Livadh waterfronts · Saranda coastal promenade · "Feti Borova" Sports Palace · Albanian Olympic Committee building · Maliqi Theater · Medieval Museum of Korça · Korça historical bazaar restoration · "Andon Zako Çajupi" Theater, Korça · "Jan Kukuzeli" Art School & "Jusuf Puka" High School, Durrës · Gjirokastra historical bazaar restoration · Germia Concert Hall & Prishtina Arena, Kosovo · Zvernec Masterplan (500 ha) · "Univers City" Masterplan (45 ha) · LIDL Balkan hub, Porto Romano · Ebolowa Education Masterplan (220 ha), "Bantu" Museum & University of Art, Cameroon · Shkodra Cultural Center · "Reiffeisen" Administrative Center · "Downtown 1" tower (40 floors), Tirana · Porto Romano Hydrocarbons Terminal · Hotel Hilton (200 rooms), Tirana · Hotel Intercontinental (150 rooms), Riga · "Turgut Özal" College & Memorial International School of Tirana

**4 · International Collaborations** (body + items)
> MA Studio & Partners carries the know-how of its founders' collaborations with leading international practices:

Items: Hijjas Kasturi Architects · MVRDV · HLT · Studio Gang · Oppenheim Architecture · Sauerbruch Hutton · Bolles+Wilson · l'AUC · JDS Architects · Atena Studio · TPA · NOA

**5 · Achievements** (body)
> First prize in 18 national and international open competitions, including the "Durana — Tirana–Durrës Economic Corridor" and the "Borea Ski Resort" in Peja, Kosovo. Further placements: 2nd — Germia Concert Hall, Prishtina; 2nd — Prishtina Arena; 3rd — New Parliamentary Complex of Albania; 3rd — Tirana Train Station Towers.

**6 · Awards** (body)
> Honors carried from the founders include the BIG SEE Architecture Award 2019 and the ICONIC Award 2019 (Innovative Architecture) for Tirana Olympic Park; two nominations for the EU Mies van der Rohe Award 2019; an Architizer A+ Award 2019 nomination (Tirana Olympic Park); and a Grand Prix nomination for the Korça Medieval Art Museum (Culture, 2018).

**7 · International Conferences** (items)
Items: "Tirana Olympic Park" — SHARE Forum, Tirana 2018 · "Tirana Olympic Park" — SHARE Forum, Budapest 2018 · "Ebolowa Education Campus Masterplan" — SHARE Forum, Bucharest 2022

**8 · Company Expertise** (subsections)
- **Workplace Consultancy** — We begin by helping clients evaluate their needs—across residences, workplaces, schools, hospitals, and cultural and civic buildings. Analyzing context at scale, we align the value of place with the client's goals before proposing concepts and solutions.
- **Project Management** — Our in-house group delivers an integrated service across a project's lifecycle—concept, construction, completion—covering budgeting and cost control, programme and resource management, and contract administration, on time, on budget, and to the highest quality.
- **Urban Design** — We study the city holistically—behavior, demographics, and the hidden systems shaping the built environment—and design socially driven public spaces where people choose to meet, sit, and talk, helping public and private clients create sustainable, future-ready developments.
- **Architecture** — We believe surroundings shape daily life. Before form, we ask how a building will be used and understood, designing human-scaled, "small, low, and slow" spaces that encourage interaction, comfort, and the poetic modelling of space through natural light and greenery.
- **Engineering** — Two in-house engineering groups—environmental and structural—integrate from the outset, working alongside design teams to safeguard quality and reinforce the studio's sustainability agenda through to completion.
- **Interior Design** — Architecture should flow seamlessly from outside to inside. From private houses to office towers and galleries, we coordinate light, materials, color, and furnishings as one scheme, with the same questioning and refinement as the building itself.

**9 · Sustainability** (body)
> Sustainability has been central since day one. We assess environmental performance holistically—from embodied energy to lifetime use—and pioneer renewable-energy solutions that cut pollution and carbon. Through passive design—optimizing form, orientation, envelope, and microclimate—we minimize, and often eliminate, reliance on active mechanical systems while keeping occupants comfortable, reducing energy demand before mechanical systems are even considered.

**10 · Office Structure** (body)
> MA Studio & Partners operates as a living, open academy where knowledge circulates freely. A horizontal ethos keeps hierarchy as a framework for clear decisions, not a constraint—every voice is a potential catalyst, and younger team members are relied on for fresh cultural and technological perspectives. A culture of productive tension and "artistic urgency"—spontaneous sketch competitions and rapid conceptual studies—keeps the studio experimenting and continually redefining its own boundaries.

- **Acceptance:** the About page shows the intro (no "1974"), the services grid, then sections 2–10; deep sections expand/collapse; all the listed names appear in the HTML.

---

## Files

| File | Change |
| --- | --- |
| `components/intro/IntroOverlay.tsx` | Ring text + keep green + `inset-0`→`left-0 top-0 h-screen w-screen` |
| `components/project/ProjectRow.tsx` | All rows full-screen; `priority` only when `hero` |
| `components/project/ProjectList.tsx` | Unchanged logic (`hero={i===0}` still passed) |
| `data/founders.ts` | Real Ervin & Klodiana data; `bio: string[]` |
| `components/founder/FounderCard.tsx` | **New** — portrait + name + click blur-reveal bio |
| `app/cofounders/page.tsx` | Use `FounderCard` |
| `data/about.ts` | **New** — typed sections 2–10 content |
| `components/about/AboutSections.tsx` | **New** — render sections (Accordions) |
| `app/about/page.tsx` | Fix intro date; render `AboutSections` |

## Testing

- **Unit (Vitest/Testing Library):** `data/founders.ts` has both real names + `bio` arrays; `FounderCard` shows the name and reveals the bio on click; `data/about.ts` has the expected section titles; `AboutSections` renders section titles + sample names; `IntroOverlay` ring text contains "MODELLING ARCHITECTURE" and not "STUDIO & PARTNERS".
- **Visual (Playwright):** full-screen project scroll; CoFounders blur-reveal; intro ring text + green + centered + morph; About sections expand.

## Out of scope

- Real founder photographs (placeholders remain).
- Project image re-cropping or new imagery.
- Translations / i18n.
- Reconciling the DEA founding-year nuance between the two bios (2000 vs 2002) — kept as supplied.
