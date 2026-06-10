import ContactView from "@/components/contact/ContactView";
import { OFFICES, SOCIALS } from "@/data/offices";

// Async server component used only in development (Next.js RSC supports async components)
async function ContactEditablePage() {
  const { client } = await import("@/tina/__generated__/client");
  const res = await client.queries.contact({ relativePath: "contact.json" });
  const ContactEditable = (await import("@/components/tina/ContactEditable")).default;
  return (
    <ContactEditable
      tina={{ query: res.query, variables: res.variables, data: res.data }}
    />
  );
}

export default function ContactPage() {
  if (process.env.NODE_ENV === "development") {
    return <ContactEditablePage />;
  }
  return <ContactView office={OFFICES[0]} socials={SOCIALS} />;
}
