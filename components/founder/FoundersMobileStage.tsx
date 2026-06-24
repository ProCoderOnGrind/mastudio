"use client";
import { useState } from "react";
import Image from "next/image";
import { tinaField } from "tinacms/dist/react";
import type { Founder } from "@/data/founders";

// Mobile co-founders: both portraits fill the screen. Tapping one grows it so the
// bio gets room to breathe at a larger, more readable size; the other shrinks back.
// Crops are biased upward so heads/hair stay in frame.
function objectPositionFor(name: string) {
  if (name.startsWith("Ervin")) return "center 12%";
  if (name.startsWith("Klodiana")) return "center 20%";
  return "center";
}

export default function FoundersMobileStage({
  founders,
  editTargets,
}: { founders: Founder[]; editTargets?: any[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col md:hidden" style={{ height: "calc(100svh - 56px)" }}>
      {founders.map((f, i) => {
        const open = openIndex === i;
        const et = editTargets?.[i];
        return (
          <button
            key={f.name}
            type="button"
            onClick={() => setOpenIndex(open ? null : i)}
            aria-expanded={open}
            aria-label={open ? `Hide ${f.name}'s bio` : `Read ${f.name}'s bio`}
            className="relative block w-full overflow-hidden text-left transition-[flex-grow] duration-500 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none"
            style={{ flexGrow: open ? 3 : 1, flexBasis: 0, minHeight: 0 }}
          >
            {f.image ? (
              <Image
                src={f.image}
                alt={f.name}
                fill
                sizes="100vw"
                className="object-cover transition-[filter,transform] duration-500 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none"
                style={{
                  objectPosition: objectPositionFor(f.name),
                  filter: open ? "blur(8px)" : "none",
                  transform: open ? "scale(1.04)" : "none",
                }}
                data-tina-field={et ? tinaField(et, "image") : undefined}
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-200" />
            )}

            {/* Name/role — overlaid, larger; hidden while the bio is open */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-12 text-white transition-opacity duration-300"
              style={{ opacity: open ? 0 : 1 }}
            >
              <div
                className="text-[28px] font-medium leading-[1.02] tracking-tight"
                data-tina-field={et ? tinaField(et, "name") : undefined}
              >
                {f.name}
              </div>
              <div
                className="mt-1 text-[13px] leading-snug text-white/85"
                data-tina-field={et ? tinaField(et, "role") : undefined}
              >
                {f.role}
              </div>
            </div>

            {/* Bio overlay — larger type, fills the grown card */}
            <div
              className="no-scrollbar absolute inset-0 flex flex-col justify-center gap-3 overflow-auto bg-black/72 p-6 text-white transition-opacity duration-500 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none"
              style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
            >
              <div
                className="text-[20px] font-medium leading-tight"
                data-tina-field={et ? tinaField(et, "name") : undefined}
              >
                {f.name}
              </div>
              {f.bio.map((p, k) => (
                <p
                  key={k}
                  className="text-[14px] leading-[1.45]"
                  data-tina-field={et ? tinaField(et, "bio") : undefined}
                >
                  {p}
                </p>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
