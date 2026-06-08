import PageTitle from "@/components/PageTitle";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";
import { FOUNDERS } from "@/data/founders";

export default function CoFoundersPage() {
  return (
    <div>
      <PageTitle>Co-Founders</PageTitle>
      <div className="grid gap-10 px-5 md:grid-cols-2">
        {FOUNDERS.map((f, i) => (
          <Reveal key={f.name} delay={i * 60}>
            <div className="border-t border-hairline pt-4">
              <BlurImage
                src={f.image}
                seed={f.name}
                label={f.name}
                ratio="3 / 4"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="mt-3 text-[18px] leading-tight">{f.name}</div>
              <div className="label meta">{f.role}</div>
              <p className="mt-2 text-[14px]">{f.bio}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
