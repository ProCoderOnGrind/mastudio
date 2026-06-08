import Accordion from "./Accordion";
import BackToTop from "./BackToTop";
import { OFFICES, SOCIALS, SERVICES } from "@/data/offices";

const office = OFFICES[0];

export default function Footer() {
  return (
    <footer className="mt-24 px-5 pb-10">
      <div className="grid gap-x-10 md:grid-cols-4">
        <Accordion title="Contact">
          <div className="label meta">Email</div>
          <a href={`mailto:${office.email}`} className="mb-2 block text-[14px] hover:text-accent">{office.email}</a>
          <div className="label meta">Phone</div>
          <a href={`tel:${office.phone.replace(/\s/g, "")}`} className="text-[14px] hover:text-accent">{office.phone}</a>
        </Accordion>
        <Accordion title="Studio">
          <div className="label">{office.label}</div>
          <div className="meta text-[13px]">{office.address.join(", ")}</div>
        </Accordion>
        <Accordion title="Social">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              className="text-[14px] hover:text-accent">{s.label}</a>
          ))}
        </Accordion>
        <Accordion title="Services">
          {SERVICES.map((s) => <span key={s} className="text-[14px]">{s}</span>)}
        </Accordion>
      </div>
      <BackToTop />
      <p className="meta label mt-6">© {new Date().getFullYear()} MA Studio &amp; Partners — All images are property of MA Studio &amp; Partners.</p>
    </footer>
  );
}
