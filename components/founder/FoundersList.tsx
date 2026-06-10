"use client";
import Reveal from "@/components/motion/Reveal";
import FounderCard from "@/components/founder/FounderCard";
import type { Founder } from "@/data/founders";

export default function FoundersList({
  founders,
  editTargets,
}: { founders: Founder[]; editTargets?: any[] }) {
  return (
    <div className="grid gap-10 px-5 md:grid-cols-2">
      {founders.map((f, i) => (
        <Reveal key={f.name} delay={i * 60}>
          <FounderCard founder={f} editTarget={editTargets?.[i]} />
        </Reveal>
      ))}
    </div>
  );
}
