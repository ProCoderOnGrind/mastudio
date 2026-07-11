"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { hasPlayedIntro, markIntroPlayed } from "@/lib/intro";

// The emblem is the real seal artwork split into two aligned layers
// (scripts/build-logo-assets.py): the outer ring rotates, the mark stays upright.
export const RING_SRC = "/mastudio/logo-seal-ring.png";
export const MARK_SRC = "/mastudio/logo-seal-mark.png";
const SIZE = 380; // px, intro emblem box

// Runs before paint on the client, no-ops (without warning) during SSR.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function IntroOverlay() {
  // Portal to <body> so no ancestor transform (e.g. the page-transition fade in
  // app/template.tsx) can become the containing block and offset the fixed overlay.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [target, setTarget] = useState({ x: 0, y: 0, scale: 0.18 });
  const emblemRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => setMounted(true), []);

  const finish = () => {
    if (leaving) return;
    const logo = document.getElementById("site-logo");
    if (logo) {
      const r = logo.getBoundingClientRect();
      const size = emblemRef.current?.offsetWidth ?? SIZE;
      setTarget({
        x: r.left + r.width / 2 - window.innerWidth / 2,
        y: r.top + r.height / 2 - window.innerHeight / 2,
        scale: r.width / size,
      });
    }
    markIntroPlayed();
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 1100);
  };

  useEffect(() => {
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (hasPlayedIntro() || reduce) {
      markIntroPlayed();
      // Gate depends on browser-only APIs (sessionStorage/matchMedia); it must run
      // post-hydration, so hiding via setState here is intentional (avoids an SSR mismatch).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
      return;
    }
    const t = window.setTimeout(finish, 2600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted || !visible) return null;

  return createPortal(
    <motion.div
      data-intro="overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
      onClick={finish}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
      style={{ cursor: leaving ? "default" : "pointer" }}
    >
      <motion.div
        ref={emblemRef}
        className="relative"
        style={{ width: "min(380px, 84vw)", height: "min(380px, 84vw)" }}
        animate={
          leaving
            ? { x: target.x, y: target.y, scale: target.scale }
            : { x: 0, y: 0, scale: 1 }
        }
        transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Spinning ring — the seal's arc text and circle */}
        <motion.img
          src={RING_SRC}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 h-full w-full"
          animate={{ rotate: leaving ? 0 : 360 }}
          transition={
            leaving
              ? { duration: 0.8, ease: "easeOut" }
              : { repeat: Infinity, ease: "linear", duration: 12 }
          }
        />

        {/* Static center — the MA mark stays upright */}
        <img
          src={MARK_SRC}
          alt="MA Studio & Partners"
          draggable={false}
          className="absolute inset-0 h-full w-full"
        />
      </motion.div>
    </motion.div>,
    document.body
  );
}
