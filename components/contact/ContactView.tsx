"use client";
import { tinaField } from "tinacms/dist/react";
import type { Office, Social } from "@/data/offices";
import MapSeal from "@/components/contact/MapSeal";
import ContactForm from "@/components/contact/ContactForm";

// Exact studio coordinates — from the MA Studio & Partners Google Maps place
// (maps.app.goo.gl/eZ85PpJdMCZMGkAMA). Passing lat,lng as the query drops the
// pin precisely on the building the moment the embed loads.
const MAP_QUERY = "41.3139575,19.8152786";

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
  const hover = "transition-colors hover:text-[#94c52d]";

  return (
    <div className="px-5 pt-10 pb-16">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-10">
        {/* Map seal — first on mobile, right on desktop */}
        <div className="order-1 md:order-2">
          <MapSeal query={MAP_QUERY} />
        </div>

        {/* Contact info — second on mobile, left on desktop */}
        <div className="order-2 md:order-1">
          {/* Studio label + address */}
          <div className="mb-12">
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

          {/* The email is the page's h1 */}
          <div className="label meta mb-2">Write</div>
          <h1>
            <a
              href={`mailto:${office.email}?subject=${encodeURIComponent("Project inquiry")}`}
              className={`contact-lead block break-words ${hover}`}
              data-tina-field={editOffice ? tinaField(editOffice, "email") : undefined}
            >
              {office.email}
            </a>
          </h1>

          <div className="label meta mb-2 mt-10">Call</div>
          <a
            href={telHref}
            className={`contact-lead block break-words ${hover}`}
            data-tina-field={editOffice ? tinaField(editOffice, "phone") : undefined}
          >
            {office.phone}
          </a>

          {/* Socials */}
          <div className="mt-12 border-t border-hairline pt-5">
            <div className="label meta mb-3">Follow</div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {socials.map((s, i) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`label ${hover}`}
                  data-tina-field={editSocials?.[i] ? tinaField(editSocials[i], "label") : undefined}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Direct message — type here instead of opening an email client */}
      <div className="mt-16 border-t border-hairline pt-10 md:mt-24">
        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          <div>
            <h2 className="label meta mb-2">Send a message</h2>
            <p className="max-w-[40ch] text-[15px]">
              Write to us directly from this page. Your note lands in the studio
              inbox and we reply by email.
            </p>
          </div>
          <ContactForm email={office.email} />
        </div>
      </div>
    </div>
  );
}
