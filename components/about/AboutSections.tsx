"use client";
import { tinaField } from "tinacms/dist/react";
import Accordion from "@/components/footer/Accordion";
import { ABOUT_SECTIONS, type AboutSection } from "@/data/about";

export default function AboutSections({
  sections = ABOUT_SECTIONS,
  editTargets,
}: { sections?: AboutSection[]; editTargets?: any[] }) {
  return (
    <section className="mt-12 px-5">
      {sections.map((s, i) => {
        const et = editTargets?.[i];
        return (
          <Accordion key={s.title} title={s.title} titleField={et ? tinaField(et, "title") : undefined}>
            {s.body?.map((p, pi) => (
              <p key={pi} className="mb-3 max-w-[72ch] text-[14px] leading-relaxed" data-tina-field={et ? tinaField(et, "body") : undefined}>{p}</p>
            ))}
            {s.items && (
              <ul className="flex flex-wrap gap-x-5 gap-y-1" data-tina-field={et ? tinaField(et, "items") : undefined}>
                {s.items.map((it) => (
                  <li key={it} className="meta text-[13px]">{it}</li>
                ))}
              </ul>
            )}
            {s.subsections?.map((sub, j) => {
              const subEt = et?.subsections?.[j];
              return (
                <div key={sub.title} className="mb-4">
                  <div className="label mb-1" data-tina-field={subEt ? tinaField(subEt, "title") : undefined}>{sub.title}</div>
                  {sub.body.map((p, pi) => (
                    <p key={pi} className="max-w-[72ch] text-[14px] leading-relaxed" data-tina-field={subEt ? tinaField(subEt, "body") : undefined}>{p}</p>
                  ))}
                </div>
              );
            })}
          </Accordion>
        );
      })}
    </section>
  );
}
