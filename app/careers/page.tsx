import PageTitle from "@/components/PageTitle";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";
import CareersPositions from "@/components/careers/CareersPositions";
import { OFFICES } from "@/data/offices";

export default function CareersPage() {
  return (
    <div>
      <PageTitle>Careers</PageTitle>
      <div className="grid gap-8 px-5 md:grid-cols-2">
        <p className="text-[15px]">Placeholder intro describing the studio&apos;s journey across global offices and its culture of collaboration.</p>
        <p className="text-[15px]">Over the past decades the practice has grown organically; this copy stands in for the original careers statement.</p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-4 px-5 md:grid-cols-3">
        {OFFICES.slice(0, 3).map((o, i) => (
          <Reveal key={o.city} delay={i * 60}>
            <BlurImage seed={`careers-${o.city}`} ratio="3 / 2" label={o.label.toUpperCase()} showLabel />
          </Reveal>
        ))}
      </div>
      <div className="mt-16"><CareersPositions /></div>
    </div>
  );
}
