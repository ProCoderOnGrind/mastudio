"use client";
import { useState } from "react";
import Image from "next/image";
import { gradientFor } from "@/lib/placeholder";

export default function BlurImage({
  seed = "",
  src,
  label,
  alt,
  ratio = "4 / 3" as string | null,
  className = "",
  showLabel = false,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 66vw",
  fit = "cover",
}: {
  seed?: string;
  src?: string;
  /** The caption drawn over the image when `showLabel` is set. */
  label?: string;
  /**
   * Alt text. Separate from `label` because the two answer different
   * questions: `label` names the project for a sighted reader who can already
   * see the photo, `alt` has to describe the photo itself. Falls back to
   * `label` so callers that only have a name still emit something.
   */
  alt?: string;
  ratio?: string | null;
  className?: string;
  showLabel?: boolean;
  priority?: boolean;
  sizes?: string;
  fit?: "cover" | "contain";
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={`relative overflow-hidden bg-neutral-200 ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
      ref={(el) => {
        if (el && !src && !loaded) requestAnimationFrame(() => setLoaded(true));
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || label || ""}
          fill
          sizes={sizes}
          priority={priority}
          onLoad={() => setLoaded(true)}
          className={`${fit === "contain" ? "object-contain" : "object-cover"} transition-[opacity,filter] duration-700 ease-[cubic-bezier(.4,0,.2,1)]`}
          style={{
            opacity: loaded ? 1 : 0,
            filter: loaded ? "blur(0)" : "blur(12px)",
          }}
        />
      ) : (
        <div
          className="absolute inset-0 transition-[opacity,filter] duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{
            backgroundImage: gradientFor(seed),
            opacity: loaded ? 1 : 0,
            filter: loaded ? "blur(0)" : "blur(12px)",
          }}
        />
      )}
      {showLabel && label && (
        <span className="label absolute bottom-2 left-2 z-10 text-white/90 mix-blend-difference">
          {label}
        </span>
      )}
    </div>
  );
}
