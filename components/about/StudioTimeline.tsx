import Reveal from "@/components/motion/Reveal";

// A short studio history — unique to the About page.
// Horizontal milestones on desktop; a vertical thread on mobile.
const MILESTONES = [
  {
    year: "2020",
    title: "MA Studio & Partners",
    body: "The studio is founded, working across architecture, urban planning, landscape and interior design from Tirana.",
  },
  {
    year: "2022",
    title: "Placeholder milestone",
    body: "Placeholder — add the 2022 milestone here once you've decided what to highlight (a landmark project, a new discipline, an award or a partnership).",
  },
  {
    year: "2026",
    title: "Today",
    body: "Architecture, urban planning, landscape and interior design — in Albania and beyond.",
  },
];

export default function StudioTimeline() {
  return (
    <div className="px-5">
      <h2 className="label meta mb-7">Our story</h2>
      <ol className="relative grid md:grid-cols-3 md:gap-x-10">
        {/* desktop baseline that the milestone dots sit on */}
        <span aria-hidden className="absolute left-1 right-1 top-[6px] hidden h-px bg-hairline md:block" />
        {MILESTONES.map((m, i) => {
          const isLast = i === MILESTONES.length - 1;
          return (
            <Reveal key={m.year} delay={i * 120}>
              {/* MOBILE: continuous left rail via border-l (spacing from pb, so the
                  thread never breaks between items). DESKTOP: rail/spacing reset. */}
              <li
                className={`relative pl-6 md:border-0 md:pb-0 md:pl-0 md:pt-7 ${
                  isLast ? "" : "border-l border-hairline pb-9"
                }`}
              >
                {/* accent dot sitting on the rail */}
                <span
                  aria-hidden
                  className="absolute -left-[5px] top-[5px] h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-white md:left-1 md:top-[1.5px] md:ring-0"
                />
                <div className="text-[clamp(26px,3.4vw,38px)] leading-none">{m.year}</div>
                <div className="label mt-3">{m.title}</div>
                <p className="meta mt-2 max-w-[36ch] text-[14px] leading-relaxed md:text-justify">{m.body}</p>
              </li>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
