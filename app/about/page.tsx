import PageTitle from "@/components/PageTitle";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";
import AboutSections from "@/components/about/AboutSections";
import ServicesList from "@/components/about/ServicesList";
import { PROJECTS } from "@/data/projects";

const gallery = PROJECTS.filter((p) => p.images.length).slice(0, 8);

export default async function AboutPage() {
  let aboutNode;
  if (process.env.NODE_ENV === "development") {
    const { client } = await import("@/tina/__generated__/client");
    const res = await client.queries.about({ relativePath: "about.json" });
    const AboutEditable = (await import("@/components/tina/AboutEditable")).default;
    aboutNode = <AboutEditable tina={{ query: res.query, variables: res.variables, data: res.data }} />;
  } else {
    aboutNode = <AboutSections />;
  }

  // Mobile order: photos → text → services → dropdowns (via `order-*`).
  // Desktop keeps the established reading order: text → services → photos → dropdowns.
  return (
    <div>
      <PageTitle>About</PageTitle>
      <div className="flex flex-col gap-12">
        {/* Intro text */}
        <div className="order-2 grid gap-8 px-5 md:order-1 md:grid-cols-2">
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

        {/* Services — clickable, each explains what it means for clients */}
        <div className="order-3 px-5 md:order-2">
          <h2 className="label meta mb-1">Our services</h2>
          <ServicesList />
        </div>

        {/* Photos */}
        <div className="order-1 grid grid-cols-2 gap-4 px-5 md:order-3 md:grid-cols-4">
          {gallery.map((p, i) => (
            <Reveal key={p.slug} delay={i * 40}>
              <BlurImage src={p.images[0]} label={p.name} ratio="16 / 9" fit="contain" sizes="(max-width: 768px) 50vw, 25vw" />
            </Reveal>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="order-4 md:order-4">{aboutNode}</div>
      </div>
    </div>
  );
}
