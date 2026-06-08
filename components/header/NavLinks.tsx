"use client";
import Link from "next/link";
import { useState } from "react";

const NAV = [
  { label: "Projects", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "CoFounders", href: "/cofounders" },
];

export default function NavLinks() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Desktop links */}
      <nav className="hidden items-center gap-8 md:flex">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="label hover:text-accent transition-colors">
            {n.label}
          </Link>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <div className="relative md:hidden">
        <button aria-label="Menu" onClick={() => setOpen((o) => !o)} className="flex flex-col gap-[5px] p-1">
          <span className="block h-[2px] w-6 bg-black" />
          <span className="block h-[2px] w-6 bg-black" />
          <span className="block h-[2px] w-6 bg-black" />
        </button>
        <nav
          className="absolute left-0 top-full mt-3 flex flex-col gap-1 bg-white transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(-8px)",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="label hover:text-accent transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
