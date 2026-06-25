"use client";
import { useState } from "react";

export default function Accordion({ title, titleField, accent = false, children }: { title: string; titleField?: string; accent?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-hairline py-3">
      <button onClick={() => setOpen((o) => !o)} className={`flex w-full items-center justify-between ${accent ? "group" : ""}`}>
        <span className={`text-[15px] ${accent ? "transition-colors group-hover:text-accent" : ""}`} data-tina-field={titleField}>{title}</span>
        <span className={`text-[18px] leading-none transition-transform duration-300 ${accent ? "text-accent" : ""}`}
          style={{ transform: open ? "rotate(45deg)" : "rotate(0)" }}>+</span>
      </button>
      <div className="grid transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
