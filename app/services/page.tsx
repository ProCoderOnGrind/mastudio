import type { Metadata } from "next";
import Link from "next/link";
import { SERVICE_MEANINGS } from "@/data/services";
import { OFFICES } from "@/data/offices";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

/**
 * The query-facing page for "architecture studio in Tirana / Albania".
 *
 * Nothing on the site previously addressed that phrase as a topic — the
 * homepage is a project grid and About is studio philosophy — so there was no
 * page for the query to match. Each service is a real heading with its own
 * anchor, which is also what the footer links into.
 *
 * All copy here is the studio's own, from `data/services.ts` and the About
 * page; no claims are invented.
 */

const DESCRIPTION =
  "MA Studio & Partners is an architecture studio in Tirana, Albania, offering architecture, urban planning, urban design, landscape design, interior design, engineering, energy efficiency and energy auditing across Albania.";

export const metadata: Metadata = {
  title: "Architecture & Urban Planning Services in Tirana, Albania",
  description: DESCRIPTION,
  alternates: { canonical: "/services" },
  openGraph: {
    title: `Architecture & Urban Planning Services in Tirana, Albania | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absoluteUrl("/services"),
  },
};

const office = OFFICES[0];

/**
 * One Service node per offering, each tied back to the studio and scoped to
 * Albania, so the individual service terms are addressable and not folded into
 * one generic "architecture" entity.
 */
function servicesSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Services", item: absoluteUrl("/services") },
      ],
    },
    ...SERVICE_MEANINGS.map((s) => ({
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": absoluteUrl(`/services#${s.slug}`),
      name: s.name,
      description: s.meaning,
      serviceType: s.name,
      provider: { "@id": absoluteUrl("/#organization") },
      areaServed: [
        { "@type": "City", name: "Tirana" },
        { "@type": "Country", name: "Albania" },
      ],
    })),
  ];
}

export default function ServicesPage() {
  return (
    <div className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema()) }}
      />

      {/* The h1 states the thing the page is competing for, in plain language.
          `contact-lead` sizing carries the longer phrase where the display-size
          `page-title` would break awkwardly. */}
      <h1 className="contact-lead max-w-[16ch] px-5 pt-10 pb-8">
        Architecture &amp; urban planning in Tirana
      </h1>

      <div className="px-5">
        <div className="grid gap-8 md:grid-cols-2">
          <p className="max-w-[62ch] text-[16px] leading-relaxed md:text-justify">
            MA Studio &amp; Partners is an architecture and urban planning studio based in
            Tirana, Albania. Established in 2020 as the continuation of DEA Studio
            (2000–2020), the practice works across the full arc from the scale of the city
            to the scale of mankind.
          </p>
          <p className="max-w-[62ch] text-[16px] leading-relaxed md:text-justify">
            The studio brings architecture, urban planning, landscape and building-energy
            engineering under one roof, so a project can be carried from the first urban
            framework through to the interior detail without changing hands.
          </p>
        </div>

        <div className="mt-16 flex flex-col md:mt-24">
          {SERVICE_MEANINGS.map((s) => (
            <section
              key={s.slug}
              id={s.slug}
              className="grid scroll-mt-24 gap-2 border-t border-hairline py-8 md:grid-cols-[1fr_2fr] md:gap-10"
            >
              <h2 className="text-[20px] leading-tight md:text-[24px]">{s.name}</h2>
              <p className="max-w-[62ch] text-[16px] leading-relaxed text-big-gray">
                {s.meaning}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-hairline pt-8">
          <h2 className="text-[20px] leading-tight md:text-[24px]">
            Start a project with the studio
          </h2>
          <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-big-gray">
            The studio works from {office.address.join(", ")}.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            <Link
              href="/contact"
              className="label inline-block border-b border-black pb-0.5 transition-colors hover:border-accent hover:text-accent"
            >
              Contact the studio
            </Link>
            <Link
              href="/"
              className="label inline-block border-b border-black pb-0.5 transition-colors hover:border-accent hover:text-accent"
            >
              See our projects
            </Link>
            <Link
              href="/about"
              className="label inline-block border-b border-black pb-0.5 transition-colors hover:border-accent hover:text-accent"
            >
              About the studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
