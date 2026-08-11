import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { ViewerProvider } from "@/components/viewer/ViewerContext";
import ProjectViewer from "@/components/viewer/ProjectViewer";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, absoluteUrl } from "@/lib/site";
import contact from "@/content/contact.json";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  // Absolute base so canonicals and OG images resolve for crawlers and
  // link-unfurlers, which cannot interpret relative URLs.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    // Sub-pages set only their own name; the studio suffix is appended here so
    // titles stay consistent and within the ~60-char SERP budget.
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  keywords: [
    "architecture studio Tirana",
    "urban planning Albania",
    "landscape architecture",
    "interior design Tirana",
    "MA Studio & Partners",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false },
};

/**
 * Organization + local-business markup. Emitted once site-wide so Google can
 * tie the studio to its address, contact details and social profiles (the
 * `sameAs` set is what powers the knowledge panel).
 */
const office = contact.offices[0];

/**
 * The address as one string, for the map query that `hasMap` points at.
 * No `geo` block: the repo holds no verified coordinates, and publishing
 * guessed ones would place the studio at the wrong pin — worse for local
 * search than omitting the property. Add real lat/lng when you have them.
 */
const mapQuery = encodeURIComponent(
  `${office?.label ?? SITE_NAME}, ${office?.address.join(", ") ?? "Tirana, Albania"}`,
);

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ArchitecturalService",
  "@id": absoluteUrl("/#organization"),
  name: SITE_NAME,
  alternateName: "Modelling Architecture Studio & Partners",
  url: SITE_URL,
  logo: absoluteUrl("/mastudio/logo-seal.png"),
  image: absoluteUrl("/mastudio/logo-seal.png"),
  description: SITE_DESCRIPTION,
  email: office?.email,
  telephone: office?.phone,
  foundingDate: "2020",
  address: {
    "@type": "PostalAddress",
    streetAddress: office?.address.slice(0, -1).join(", "),
    addressLocality: "Tirana",
    postalCode: "1020",
    addressCountry: "AL",
  },
  hasMap: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
  // Both the city and the country: "in Tirana" and "in Albania" are distinct
  // queries and each needs an explicit place to match against.
  areaServed: [
    { "@type": "City", name: "Tirana" },
    { "@type": "Country", name: "Albania" },
  ],
  knowsAbout: contact.services,
  // Each service as a discrete offer, so the studio can surface for the
  // individual service terms rather than only the generic "architecture".
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Architecture and planning services",
    itemListElement: contact.services.map((service) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: service, areaServed: "Albania" },
    })),
  },
  sameAs: contact.socials.map((s) => s.href),
};

/**
 * WebSite entity carrying the internal search action — this is what lets Google
 * render a sitelinks search box under the brand result.
 */
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  publisher: { "@id": absoluteUrl("/#organization") },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={beVietnam.className}>
      <body className="bg-white text-black antialiased">
        <script
          type="application/ld+json"
          // Static, author-controlled JSON — no user input reaches this string.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema, websiteSchema]),
          }}
        />
        <ViewerProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <ProjectViewer />
        </ViewerProvider>
      </body>
    </html>
  );
}
