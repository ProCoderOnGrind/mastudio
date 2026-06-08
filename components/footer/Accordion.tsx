"use client";
import { useState } from "react";

export default function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-hairline py-3">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between">
        <span className="text-[15px]">{title}</span>
        <span className="text-[18px] leading-none transition-transform duration-300"
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
