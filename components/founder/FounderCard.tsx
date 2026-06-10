"use client";
import { useState } from "react";
import { tinaField } from "tinacms/dist/react";
import BlurImage from "@/components/media/BlurImage";
import type { Founder } from "@/data/founders";

export default function FounderCard({ founder, editTarget }: { founder: Founder; editTarget?: any }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="border-t border-hairline pt-4">
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        aria-expanded={revealed}
        aria-label={revealed ? `Hide ${founder.name}'s bio` : `Read ${founder.name}'s bio`}
        className="relative block w-full cursor-pointer overflow-hidden text-left"
      >
        {/* Portrait — blurs when revealed */}
        <div
          className="transition-[filter,transform] duration-500 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none"
          style={{
            filter: revealed ? "blur(8px)" : "blur(0px)",
            transform: revealed ? "scale(1.04)" : "scale(1)",
          }}
          data-tina-field={editTarget ? tinaField(editTarget, "image") : undefined}
        >
          <BlurImage
            src={founder.image}
            seed={founder.name}
            label={founder.name}
            ratio="3 / 4"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        {/* Bio overlay — fades in over the blurred portrait */}
        <div
          className="absolute inset-0 flex flex-col gap-3 overflow-auto bg-black/55 p-5 text-white transition-opacity duration-500 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none"
          style={{ opacity: revealed ? 1 : 0, pointerEvents: revealed ? "auto" : "none" }}
        >
          {founder.bio.map((p, i) => (
            <p key={i} className="text-[13px] leading-relaxed" data-tina-field={editTarget ? tinaField(editTarget, "bio") : undefined}>{p}</p>
          ))}
        </div>
      </button>
      <div className="mt-3 text-[18px] leading-tight" data-tina-field={editTarget ? tinaField(editTarget, "name") : undefined}>{founder.name}</div>
      <div className="label meta" data-tina-field={editTarget ? tinaField(editTarget, "role") : undefined}>{founder.role}</div>
    </div>
  );
}
