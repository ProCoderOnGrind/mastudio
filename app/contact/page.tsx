import { OFFICES, SOCIALS } from "@/data/offices";

const office = OFFICES[0];

export default function ContactPage() {
  const telHref = `tel:${office.phone.replace(/\s/g, "")}`;

  return (
    <div className="px-5 pt-10 pb-16">
      {/* Studio label + address — small, secondary */}
      <div className="mb-16 md:mb-24">
        <div className="label">
          {office.label} — {office.city}
        </div>
        <div className="meta mt-1 text-[13px]">
          {office.address.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>

      {/* Hero — the contact info IS the headline (the email is the page's h1) */}
      <div>
        <div className="label meta mb-2">Write</div>
        <h1>
          <a
            href={`mailto:${office.email}`}
            className="contact-lead block break-words transition-colors hover:text-accent"
          >
            {office.email}
          </a>
        </h1>

        <div className="label meta mb-2 mt-10 md:mt-14">Call</div>
        <a href={telHref} className="contact-lead block break-words transition-colors hover:text-accent">
          {office.phone}
        </a>
      </div>

      {/* Socials */}
      <div className="mt-16 border-t border-hairline pt-5 md:mt-24">
        <div className="label meta mb-3">Follow</div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="label transition-colors hover:text-accent"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
