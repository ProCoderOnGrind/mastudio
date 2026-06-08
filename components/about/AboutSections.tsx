import Accordion from "@/components/footer/Accordion";
import { ABOUT_SECTIONS } from "@/data/about";

export default function AboutSections() {
  return (
    <section className="mt-12 px-5">
      {ABOUT_SECTIONS.map((s) => (
        <Accordion key={s.title} title={s.title}>
          {s.body?.map((p, i) => (
            <p key={i} className="mb-3 max-w-[72ch] text-[14px] leading-relaxed">{p}</p>
          ))}
          {s.items && (
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {s.items.map((it) => (
                <li key={it} className="meta text-[13px]">{it}</li>
              ))}
            </ul>
          )}
          {s.subsections?.map((sub) => (
            <div key={sub.title} className="mb-4">
              <div className="label mb-1">{sub.title}</div>
              {sub.body.map((p, i) => (
                <p key={i} className="max-w-[72ch] text-[14px] leading-relaxed">{p}</p>
              ))}
            </div>
          ))}
        </Accordion>
      ))}
    </section>
  );
}
