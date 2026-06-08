"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { hasPlayedIntro, markIntroPlayed } from "@/lib/intro";

const RING_TEXT = "MODELLING ARCHITECTURE · MA STUDIO & PARTNERS · ";
const SIZE = 260; // px, intro emblem box

export default function IntroOverlay() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [target, setTarget] = useState({ x: 0, y: 0, scale: 0.18 });

  const finish = () => {
    if (leaving) return;
    const logo = document.getElementById("site-logo");
    if (logo) {
      const r = logo.getBoundingClientRect();
      setTarget({
        x: r.left + r.width / 2 - window.innerWidth / 2,
        y: r.top + r.height / 2 - window.innerHeight / 2,
        scale: r.width / SIZE,
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

  if (!visible) return null;

  return (
    <motion.div
      data-intro="overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
      onClick={finish}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
      style={{ cursor: leaving ? "default" : "pointer" }}
    >
      <motion.div
        className="relative"
        style={{ width: SIZE, height: SIZE }}
        animate={
          leaving
            ? { x: target.x, y: target.y, scale: target.scale }
            : { x: 0, y: 0, scale: 1 }
        }
        transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Spinning ring */}
        <motion.svg
          viewBox="0 0 260 260"
          className="absolute inset-0 h-full w-full"
          animate={{ rotate: leaving ? 0 : 360 }}
          transition={
            leaving
              ? { duration: 0.8, ease: "easeOut" }
              : { repeat: Infinity, ease: "linear", duration: 8 }
          }
        >
          <defs>
            <path id="introRing" d="M130,130 m-104,0 a104,104 0 1,1 208,0 a104,104 0 1,1 -208,0" />
          </defs>
          <circle cx="130" cy="130" r="104" fill="none" stroke="#ff6900" strokeWidth="1.5" />
          <text fill="#ff6900" fontSize="12.5" letterSpacing="3">
            <textPath href="#introRing">{RING_TEXT.repeat(2)}</textPath>
          </text>
        </motion.svg>

        {/* Static center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[44px] font-semibold leading-none text-black">MA</span>
          <span className="label meta mt-1">Studio &amp; Partners</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
