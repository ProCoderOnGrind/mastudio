"use client";
import { useState } from "react";
import { tinaField } from "tinacms/dist/react";
import BlurImage from "@/components/media/BlurImage";
import type { Founder } from "@/data/founders";

export default function FounderCard({ founder, editTarget }: { founder: Founder; editTarget?: any }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Portrait area fills the available height; the frame keeps the photo's
          native ratio (sized by height) so the whole picture shows, centered. */}
      <div className="flex min-h-0 flex-1 justify-center">
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          aria-expanded={revealed}
          aria-label={revealed ? `Hide ${founder.name}'s bio` : `Read ${founder.name}'s bio`}
          className="relative block h-full cursor-pointer overflow-hidden text-left"
          style={{ aspectRatio: "2278 / 2784" }}
        >
          {/* Portrait — blurs when revealed */}
          <div
            className="h-full transition-[filter,transform] duration-500 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none"
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
              ratio={null}
              className="h-full w-full"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {/* Bio overlay — centered, fades in over the blurred portrait */}
          <div
            className="absolute inset-0 flex flex-col justify-center gap-4 overflow-auto bg-black/55 p-6 text-white transition-opacity duration-500 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none"
            style={{ opacity: revealed ? 1 : 0, pointerEvents: revealed ? "auto" : "none" }}
          >
            {founder.bio.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed" data-tina-field={editTarget ? tinaField(editTarget, "bio") : undefined}>{p}</p>
            ))}
          </div>
        </button>
      </div>
      <div className="mt-3 shrink-0 text-center">
        <div className="text-[18px] leading-tight" data-tina-field={editTarget ? tinaField(editTarget, "name") : undefined}>{founder.name}</div>
        <div className="label meta" data-tina-field={editTarget ? tinaField(editTarget, "role") : undefined}>{founder.role}</div>
      </div>
    </div>
  );
}
