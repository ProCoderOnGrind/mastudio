import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import AboutSections from "@/components/about/AboutSections";
import ServicesList from "@/components/about/ServicesList";
import StudioTimeline from "@/components/about/StudioTimeline";

export const metadata: Metadata = {
  title: "About | MA STUDIO & PARTNERS",
  description:
    "MA Studio & Partners — established in 2020 as the continuation of DEA Studio (2000–2020), working across architecture, urban planning, landscape and interior design from Tirana, Albania.",
};

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

  // Two headed information sections — "Our practice" (studio intro/philosophy)
  // and "Our services" — with generous spacing between them, followed by the
  // detailed expandable sections. (Project photos removed.)
  return (
    <div>
      <PageTitle>About</PageTitle>
      <div className="flex flex-col gap-16 md:gap-24">
        {/* Intro lead-in */}
        <div className="grid gap-8 px-5 md:grid-cols-2">
          <p className="text-justify text-[15px]">
            Modelling Architecture is fascinated by the interplay of different levels of
            scale and thinking: the scale of the city and that of mankind; thinking in
            abstraction and thinking in tangibility. The cohesion of these levels is not to
            be found in one compulsive dogmatic theme, but rather in different concepts and
            concrete projects.
          </p>
          <p className="text-justify text-[15px]">
            The exploring attitude is not to find definitive answers, but to raise questions
            in order to continue the reflective and research working method for the future
            innovations of the common worldwide society. Established in 2020 as the
            continuation of DEA Studio (2000–2020), MA Studio &amp; Partners works across
            architecture, urban planning, landscape and interior design from its studio in
            Tirana, Albania.
          </p>
        </div>

        {/* Our story — short studio timeline (unique to About) */}
        <StudioTimeline />

        {/* Our services — clickable, each explains what it means for clients */}
        <div className="px-5">
          <h2 className="label meta mb-1">Our services</h2>
          <ServicesList />
        </div>

        {/* More about us — detailed expandable sections */}
        <div>
          <h2 className="label meta mb-3 px-5">More about us</h2>
          {aboutNode}
        </div>
      </div>
    </div>
  );
}
