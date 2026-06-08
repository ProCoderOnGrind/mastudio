import PageTitle from "@/components/PageTitle";
import { OFFICES, SOCIALS } from "@/data/offices";

const office = OFFICES[0];

export default function ContactPage() {
  return (
    <div>
      <PageTitle>Contact</PageTitle>
      <div className="grid gap-10 px-5 md:grid-cols-3">
        <div className="border-t border-hairline pt-3">
          <div className="label meta mb-2">Studio</div>
          <div className="label">{office.label}</div>
          <div className="meta text-[14px]">
            {office.address.map((line) => <div key={line}>{line}</div>)}
          </div>
        </div>
        <div className="border-t border-hairline pt-3">
          <div className="label meta mb-2">Get in touch</div>
          <a href={`mailto:${office.email}`} className="block text-[14px] hover:text-accent">{office.email}</a>
          <a href={`tel:${office.phone.replace(/\s/g, "")}`} className="block text-[14px] hover:text-accent">{office.phone}</a>
        </div>
        <div className="border-t border-hairline pt-3">
          <div className="label meta mb-2">Follow</div>
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              className="block text-[14px] hover:text-accent">{s.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
