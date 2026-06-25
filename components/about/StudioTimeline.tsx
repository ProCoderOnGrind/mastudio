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
      <ol className="relative grid gap-y-9 md:grid-cols-3 md:gap-x-10">
        {/* desktop baseline that the milestone dots sit on */}
        <span aria-hidden className="absolute left-1 right-1 top-[6px] hidden h-px bg-hairline md:block" />
        {MILESTONES.map((m, i) => (
          <Reveal key={m.year} delay={i * 120}>
            <li className="relative pl-6 md:pl-0 md:pt-7">
              {/* mobile vertical thread (not on the last item) */}
              {i < MILESTONES.length - 1 && (
                <span aria-hidden className="absolute left-[4px] top-3 h-full w-px bg-hairline md:hidden" />
              )}
              {/* accent dot */}
              <span aria-hidden className="absolute left-0 top-[3px] h-2.5 w-2.5 rounded-full bg-accent md:left-1 md:top-[1.5px]" />
              <div className="text-[clamp(26px,3.4vw,38px)] leading-none">{m.year}</div>
              <div className="label mt-3">{m.title}</div>
              <p className="meta mt-2 max-w-[36ch] text-justify text-[14px] leading-relaxed">{m.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
