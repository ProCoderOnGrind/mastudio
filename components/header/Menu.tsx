"use client";
import { useState } from "react";
import Link from "next/link";

const NAV = [
  { label: "Projects", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Menu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button aria-label="Menu" onClick={() => setOpen((o) => !o)}
        className="flex flex-col gap-[5px] p-1">
        <span className="block h-[2px] w-6 bg-black" />
        <span className="block h-[2px] w-6 bg-black" />
        <span className="block h-[2px] w-6 bg-black" />
      </button>
      <nav
        className="absolute left-0 top-full mt-3 flex flex-col gap-1 transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
            className="label hover:text-accent transition-colors">
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
