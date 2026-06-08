"use client";
import { useState } from "react";
import { gradientFor } from "@/lib/placeholder";

export default function BlurImage({
  seed,
  label,
  ratio = "4 / 3",
  className = "",
  showLabel = false,
}: {
  seed: string;
  label?: string;
  ratio?: string;
  className?: string;
  showLabel?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={`relative overflow-hidden bg-neutral-200 ${className}`}
      style={{ aspectRatio: ratio }}
      ref={(el) => {
        if (el && !loaded) requestAnimationFrame(() => setLoaded(true));
      }}
    >
      <div
        className="absolute inset-0 transition-[opacity,filter] duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{
          backgroundImage: gradientFor(seed),
          opacity: loaded ? 1 : 0,
          filter: loaded ? "blur(0)" : "blur(12px)",
        }}
      />
      {showLabel && label && (
        <span className="label absolute bottom-2 left-2 text-white/80 mix-blend-difference">
          {label}
        </span>
      )}
    </div>
  );
}
