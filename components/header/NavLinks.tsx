"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { label: "Projects", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Book", href: "/book" },
  { label: "Contact", href: "/contact" },
  { label: "CoFounders", href: "/cofounders" },
];

export default function NavLinks() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // "Projects" (href "/") also owns the project detail pages.
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/" || pathname.startsWith("/projects")
      : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Desktop links */}
      <nav className="hidden items-center gap-8 md:flex">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={isActive(n.href) ? "page" : undefined}
            className={`label transition-colors hover:text-accent ${
              isActive(n.href) ? "text-accent" : ""
            }`}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      {/* Mobile hamburger + full-width drop panel */}
      <div className="md:hidden">
        <button
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          // -m-2/p-3 grows the hit area to ~44px without moving the bars.
          className="relative z-[72] -m-2 flex flex-col gap-[5px] p-3"
        >
          <span className="block h-[2px] w-6 bg-black" />
          <span className="block h-[2px] w-6 bg-black" />
          <span className="block h-[2px] w-6 bg-black" />
        </button>
        {open && (
          <>
            <div
              className="fixed inset-x-0 top-[56px] z-[70] h-[calc(100dvh-56px)] bg-black/20"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <nav className="fixed inset-x-0 top-[56px] z-[71] flex flex-col border-t border-hairline bg-white px-5 py-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={`border-b border-hairline py-3 text-[16px] last:border-b-0 hover:text-accent ${
                    isActive(n.href) ? "text-accent" : ""
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </>
        )}
      </div>
    </>
  );
}
