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
