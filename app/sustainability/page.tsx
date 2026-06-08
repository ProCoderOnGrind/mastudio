import PageTitle from "@/components/PageTitle";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";

const SECTIONS = ["Sustainable Manufacturing", "Material Health", "Energy & Carbon", "Biodiversity"];

export default function SustainabilityPage() {
  return (
    <div>
      <PageTitle>Sustainability</PageTitle>
      <div className="mx-auto max-w-[900px] px-5">
        <BlurImage seed="sustainability-hero" ratio="16 / 9" />
        {SECTIONS.map((s, i) => (
          <Reveal key={s}>
            <section className="border-t border-hairline py-10">
              <div className="label meta mb-3">{s}</div>
              <p className="max-w-[60ch] text-[15px]">
                Placeholder copy describing BIG&apos;s approach to {s.toLowerCase()},
                treated as a design driver shaping massing, envelope, and material choices.
              </p>
              <button className="label mt-3 hover:text-big-gray">Read more +</button>
              {i === 0 && <div className="mt-6"><BlurImage seed={`sus-${i}`} ratio="3 / 2" /></div>}
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
