"use client";
import { useState } from "react";

export default function Accordion({
  title,
  titleField,
  accent = false,
  staticOnDesktop = false,
  children,
}: {
  title: string;
  titleField?: string;
  accent?: boolean;
  /** md+: render as an always-open section with a plain title (no toggle). */
  staticOnDesktop?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-hairline py-3">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between ${accent ? "group" : ""} ${
          staticOnDesktop ? "md:hidden" : ""
        }`}
      >
        <span className={`text-[15px] ${accent ? "transition-colors group-hover:text-accent" : ""}`} data-tina-field={titleField}>{title}</span>
        <span className={`text-[18px] leading-none transition-transform duration-300 ${accent ? "text-accent" : ""}`}
          style={{ transform: open ? "rotate(45deg)" : "rotate(0)" }}>+</span>
      </button>
      {staticOnDesktop && (
        <div className="label hidden md:block" data-tina-field={titleField}>{title}</div>
      )}
      <div
        className={`grid transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        } ${staticOnDesktop ? "md:grid-rows-[1fr]" : ""}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
