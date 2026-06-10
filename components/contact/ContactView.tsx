"use client";
import { tinaField } from "tinacms/dist/react";
import type { Office, Social } from "@/data/offices";

export default function ContactView({
  office,
  socials,
  editOffice,
  editSocials,
}: {
  office: Office;
  socials: Social[];
  editOffice?: any;
  editSocials?: any[];
}) {
  const telHref = `tel:${office.phone.replace(/\s/g, "")}`;

  return (
    <div className="px-5 pt-10 pb-16">
      {/* Studio label + address — small, secondary */}
      <div className="mb-16 md:mb-24">
        <div
          className="label"
          data-tina-field={editOffice ? tinaField(editOffice, "label") : undefined}
        >
          {office.label} — {office.city}
        </div>
        <div className="meta mt-1 text-[13px]">
          {office.address.map((line) => (
            <div
              key={line}
              data-tina-field={editOffice ? tinaField(editOffice, "address") : undefined}
            >
              {line}
            </div>
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
            data-tina-field={editOffice ? tinaField(editOffice, "email") : undefined}
          >
            {office.email}
          </a>
        </h1>

        <div className="label meta mb-2 mt-10 md:mt-14">Call</div>
        <a
          href={telHref}
          className="contact-lead block break-words transition-colors hover:text-accent"
          data-tina-field={editOffice ? tinaField(editOffice, "phone") : undefined}
        >
          {office.phone}
        </a>
      </div>

      {/* Socials */}
      <div className="mt-16 border-t border-hairline pt-5 md:mt-24">
        <div className="label meta mb-3">Follow</div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {socials.map((s, i) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="label transition-colors hover:text-accent"
              data-tina-field={editSocials?.[i] ? tinaField(editSocials[i], "label") : undefined}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
