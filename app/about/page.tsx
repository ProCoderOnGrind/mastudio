import PageTitle from "@/components/PageTitle";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";
import AboutSections from "@/components/about/AboutSections";
import { PROJECTS } from "@/data/projects";
import { SERVICES } from "@/data/offices";

const gallery = PROJECTS.filter((p) => p.images.length).slice(0, 8);

export default function AboutPage() {
  return (
    <div>
      <PageTitle>About</PageTitle>
      <div className="grid gap-8 px-5 md:grid-cols-2">
        <p className="text-[15px]">
          Modelling Architecture is fascinated by the interplay of different levels of
          scale and thinking: the scale of the city and that of mankind; thinking in
          abstraction and thinking in tangibility. The cohesion of these levels is not to
          be found in one compulsive dogmatic theme, but rather in different concepts and
          concrete projects.
        </p>
        <p className="text-[15px]">
          The exploring attitude is not to find definitive answers, but to raise questions
          in order to continue the reflective and research working method for the future
          innovations of the common worldwide society. Established in 2020 as the
          continuation of DEA Studio (2000–2020), MA Studio &amp; Partners works across
          architecture, urban planning, landscape and interior design from its studio in
          Tirana, Albania.
        </p>
      </div>

      <div className="mt-10 grid gap-2 px-5 md:grid-cols-4">
        {SERVICES.map((s) => (
          <div key={s} className="label border-t border-hairline py-2">{s}</div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 px-5 md:grid-cols-4">
        {gallery.map((p, i) => (
          <Reveal key={p.slug} delay={i * 40}>
            <BlurImage src={p.images[0]} label={p.name} ratio="4 / 3" sizes="(max-width: 768px) 50vw, 25vw" />
          </Reveal>
        ))}
      </div>

      <AboutSections />
    </div>
  );
}
