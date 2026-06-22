"use client";
import { useState } from "react";
import Image from "next/image";
import { tinaField } from "tinacms/dist/react";
import type { Founder } from "@/data/founders";

// Mobile co-founder card: full-bleed portrait, name overlaid, tap to reveal bio.
// Ervin's crop is biased upward so his hair stays in frame.
export default function FounderCardMobile({ founder, editTarget }: { founder: Founder; editTarget?: any }) {
  const [open, setOpen] = useState(false);
  const biasUp = founder.name.startsWith("Ervin");
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      aria-label={open ? `Hide ${founder.name}'s bio` : `Read ${founder.name}'s bio`}
      className="relative block min-h-0 w-full flex-1 overflow-hidden text-left"
    >
      {founder.image ? (
        <Image
          src={founder.image}
          alt={founder.name}
          fill
          sizes="100vw"
          className="object-cover transition-[filter,transform] duration-500 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none"
          style={{
            objectPosition: biasUp ? "center 12%" : "center",
            filter: open ? "blur(8px)" : "none",
            transform: open ? "scale(1.04)" : "none",
          }}
          data-tina-field={editTarget ? tinaField(editTarget, "image") : undefined}
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-200" />
      )}
      {/* Name overlaid — hidden while the bio is open */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white transition-opacity duration-300"
        style={{ opacity: open ? 0 : 1 }}
      >
        <div className="text-[17px] leading-tight" data-tina-field={editTarget ? tinaField(editTarget, "name") : undefined}>{founder.name}</div>
        <div className="label" data-tina-field={editTarget ? tinaField(editTarget, "role") : undefined}>{founder.role}</div>
      </div>
      {/* Bio overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-center gap-2 overflow-auto bg-black/60 p-4 text-white transition-opacity duration-500 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      >
        {founder.bio.map((p, i) => (
          <p key={i} className="text-[11px] leading-[1.35]" data-tina-field={editTarget ? tinaField(editTarget, "bio") : undefined}>{p}</p>
        ))}
      </div>
    </button>
  );
}
