"use client";
import { useEffect, useRef, useState } from "react";

type Variant = "none" | "arrow" | "pause";

export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<Variant>("none");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: MouseEvent) => {
      if (dot.current) {
        dot.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      const target = (e.target as HTMLElement)?.closest("[data-cursor]") as HTMLElement | null;
      setVariant((target?.dataset.cursor as Variant) ?? "none");
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] -ml-6 -mt-6 transition-opacity duration-200"
      style={{ opacity: variant === "none" ? 0 : 1 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={variant === "pause" ? "/cursors/pause.svg" : "/cursors/arrow-right.svg"}
        width={48}
        height={48}
        alt=""
      />
    </div>
  );
}
