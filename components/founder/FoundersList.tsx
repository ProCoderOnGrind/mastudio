"use client";
import Reveal from "@/components/motion/Reveal";
import FounderCard from "@/components/founder/FounderCard";
import FounderCardMobile from "@/components/founder/FounderCardMobile";
import type { Founder } from "@/data/founders";

export default function FoundersList({
  founders,
  editTargets,
}: { founders: Founder[]; editTargets?: any[] }) {
  return (
    <>
      {/* Mobile: both full-bleed portraits stacked to fill the screen, names overlaid. */}
      <div className="flex flex-col md:hidden" style={{ height: "calc(100svh - 56px)" }}>
        {founders.map((f, i) => (
          <FounderCardMobile key={f.name} founder={f} editTarget={editTargets?.[i]} />
        ))}
      </div>

      {/* Desktop: side-by-side, sized so both full portraits fit the viewport on open. */}
      <div className="hidden gap-6 px-5 md:grid md:grid-cols-2" style={{ height: "calc(100svh - 168px)" }}>
        {founders.map((f, i) => (
          <Reveal key={f.name} delay={i * 60} className="h-full min-h-0">
            <FounderCard founder={f} editTarget={editTargets?.[i]} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
