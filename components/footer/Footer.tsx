import Accordion from "./Accordion";
import BackToTop from "./BackToTop";
import { OFFICES } from "@/data/offices";

const SOCIAL = [
  ["Instagram", "https://instagram.com"], ["X", "https://x.com"],
  ["LinkedIn", "https://linkedin.com"], ["Vimeo", "https://vimeo.com"],
  ["Facebook", "https://facebook.com"], ["WeChat", "#"],
];
const LEGAL = ["Privacy Policy", "Anti-Slavery Statement", "Sustainability Report", "Whistleblower Policy"];

export default function Footer() {
  return (
    <footer className="mt-24 px-5 pb-10">
      <div className="grid gap-x-10 md:grid-cols-4">
        <Accordion title="Email">
          {[["NEW PROJECTS","newbiz@example.com"],["PRESS","press@example.com"],
            ["LECTURES","lectures@example.com"],["EXHIBITIONS","exhibitions@example.com"]].map(([k,v]) => (
            <div key={k}><div className="label meta">{k}</div>
              <a href={`mailto:${v}`} className="text-[14px] hover:text-big-gray">{v}</a></div>
          ))}
        </Accordion>
        <Accordion title="Office">
          {OFFICES.map((o) => (
            <div key={o.city} className="mb-2">
              <div className="label">{o.label}</div>
              <div className="meta text-[13px]">{o.address.join(", ")}</div>
            </div>
          ))}
        </Accordion>
        <Accordion title="Social">
          {SOCIAL.map(([k, href]) => (
            <a key={k} href={href} className="text-[14px] hover:text-big-gray">{k}</a>
          ))}
        </Accordion>
        <Accordion title="Legal">
          {LEGAL.map((l) => <a key={l} href="#" className="text-[14px] hover:text-big-gray">{l}</a>)}
        </Accordion>
      </div>
      <BackToTop />
      <p className="meta label mt-6">Frontend study replica — not affiliated with BIG.</p>
    </footer>
  );
}
