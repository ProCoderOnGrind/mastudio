import { OFFICES } from "@/data/offices";

const ROLES = ["Architect", "Senior Architect", "Landscape Architect", "BIM Specialist", "Communications Manager", "Project Leader"];

export default function CareersPositions() {
  const positions = ROLES.map((r, i) => ({ role: r, office: OFFICES[i % OFFICES.length].label }));
  return (
    <div className="px-5">
      <div className="label meta mb-4">Open Positions</div>
      {positions.map((p) => (
        <a key={p.role} href="#"
          className="flex items-center justify-between border-t border-hairline py-3 hover:text-big-gray">
          <span className="text-[16px]">{p.role}</span>
          <span className="label meta">{p.office}</span>
        </a>
      ))}
    </div>
  );
}
