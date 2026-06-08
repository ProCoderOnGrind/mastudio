import PageTitle from "@/components/PageTitle";
import BlurImage from "@/components/media/BlurImage";
import Reveal from "@/components/motion/Reveal";

export default function AboutPage() {
  return (
    <div>
      <PageTitle>About</PageTitle>
      <div className="grid gap-8 px-5 md:grid-cols-2">
        <p className="text-[15px]">
          BIG is a frontend study replica. This page mirrors the structure of the original
          About page: an opening statement set in two columns, signed by the founder,
          followed by a gallery of studio imagery.
        </p>
        <p className="text-[15px]">
          The practice is described as a collective spanning architecture, landscape,
          engineering, product design, and planning. The text here is placeholder copy
          standing in for the original.
        </p>
      </div>
      <p className="label px-5 pt-6">Bjarke Ingels — Founder &amp; Creative Director</p>
      <div className="mt-12 grid grid-cols-2 gap-4 px-5 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Reveal key={i} delay={i * 40}><BlurImage seed={`about-${i}`} ratio="4 / 3" /></Reveal>
        ))}
      </div>
    </div>
  );
}
