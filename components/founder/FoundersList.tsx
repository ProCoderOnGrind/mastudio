"use client";
import Reveal from "@/components/motion/Reveal";
import FounderCard from "@/components/founder/FounderCard";
import type { Founder } from "@/data/founders";

export default function FoundersList({
  founders,
  editTargets,
}: { founders: Founder[]; editTargets?: any[] }) {
  return (
    // Height-capped so both portraits + captions sit within the viewport on open.
    <div className="grid gap-6 md:grid-cols-2" style={{ height: "calc(100svh - 168px)" }}>
      {founders.map((f, i) => (
        <Reveal key={f.name} delay={i * 60} className="h-full min-h-0">
          <FounderCard founder={f} editTarget={editTargets?.[i]} />
        </Reveal>
      ))}
    </div>
  );
}
