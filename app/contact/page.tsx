import PageTitle from "@/components/PageTitle";
import { OFFICES } from "@/data/offices";

export default function ContactPage() {
  return (
    <div>
      <PageTitle>Contact</PageTitle>
      <div className="grid gap-8 px-5 md:grid-cols-3">
        {OFFICES.map((o) => (
          <div key={o.city} className="border-t border-hairline pt-3">
            <div className="label">{o.label}</div>
            <div className="meta text-[14px]">{o.address.join(", ")}</div>
            <a href={`mailto:${o.email}`} className="text-[14px] hover:text-big-gray">{o.email}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
