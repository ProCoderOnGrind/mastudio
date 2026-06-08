"use client";
import { useState } from "react";
import { PEOPLE, PEOPLE_GROUPS, type Person, type PeopleGroup } from "@/data/people";

export default function PeopleList() {
  const [group, setGroup] = useState<PeopleGroup>("Partners");
  const list: Person[] = PEOPLE.filter((p) => p.group === group);
  return (
    <div className="grid gap-8 md:grid-cols-[220px_1fr]">
      <div className="flex flex-col gap-1 px-5">
        {PEOPLE_GROUPS.map((g) => (
          <button key={g} onClick={() => setGroup(g)}
            className={`label text-left ${g === group ? "text-black" : "meta"} hover:text-black`}>
            {g === group ? "■ " : ""}{g}
          </button>
        ))}
      </div>
      <div className="px-5">
        <div className="label meta mb-4">{group}</div>
        {list.map((p) => (
          <div key={p.name + p.role}
            className="flex items-center justify-between border-t border-hairline py-2">
            <span className="text-[16px]"><span className="meta">+ </span>{p.name}</span>
            <span className="label meta uppercase">{p.role}</span>
          </div>
        ))}
        {list.length === 0 && <p className="meta text-[14px]">No people in this office yet.</p>}
      </div>
    </div>
  );
}
