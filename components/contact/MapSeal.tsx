"use client";

import { Roboto } from "next/font/google";

// Circular "seal" — a live Google Map clipped into a disc, framed by the real
// MA seal ring (arc text + circle, cut from the logo by
// scripts/build-logo-assets.py) that slowly rotates around it.
const GREEN = "#94c52d"; // sampled from the MA logo
// Arc text only — the circle itself is drawn as a CSS border on the map disc
// so the line sits exactly on the map's edge (the artwork's painted circle
// is slightly irregular and would overlap or gap depending on the angle).
const TEXT_SRC = "/mastudio/logo-seal-text.png";

// Google Maps renders all of its own place labels in Roboto. Loading it here
// lets our "MaStudio" label match them exactly, so it reads as a native map
// label rather than something pasted on top.
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });

export default function MapSeal({
  query,
}: {
  query: string;
  /** Unused since the ring became the seal artwork; kept for older call sites. */
  ringText?: string;
}) {
  // Coordinates/address as the query drop the red pin on the studio the moment
  // the embed loads — no API key needed for the q=/output=embed form.
  // t=k switches the tiles to satellite imagery so real buildings show.
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=18&t=k&hl=en&output=embed`;
  // The embed's own "View larger map" link lives in a corner that the circular
  // crop slices off, so we provide our own, placed safely inside the disc.
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[360px] md:max-w-[620px]">
      {/* the map disc — the seal's circle is drawn here as a border, so the
          green line rings the map's edge exactly: no gap, no overlap */}
      <div
        className="absolute left-1/2 top-1/2 h-[98%] w-[98%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[3px] bg-black"
        style={{ borderColor: GREEN }}
      >
        {/* The iframe is oversized and centered so Google's own corner/top
            controls fall outside the circular crop instead of being sliced. */}
        {/* `pointer-events-none` freezes the map (it can't be panned/zoomed, so
            the marker stays dead-centre and the label stays glued to it) while
            letting touch/scroll pass straight through to the page — so the page
            never feels stuck over the map. `loading="eager"` starts the tiles
            downloading immediately for a faster first paint. */}
        <iframe
          title="Map — MA Studio & Partners"
          src={src}
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2 border-0"
        />

        {/* Marker label, anchored to the (fixed) centre point. Styled to match
            Google's own place labels: Roboto, grey, with a white halo and no
            background, so it looks native to the map. */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          {/* the point — pushed down to sit on the bottom edge of the red pin */}
          <span
            className="absolute left-1/2 h-3 w-3 rounded-full border-2 border-white shadow"
            style={{ background: GREEN, top: 0, transform: "translate(-50%, 2px)" }}
          />
          {/* the name — Google-style label, lifted clear of the marker */}
          <span
            className={`absolute bottom-[44px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[12px] font-medium ${roboto.className}`}
            style={{
              color: "#3c4043",
              textShadow:
                "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 0 3px #fff",
            }}
          >
            MaStudio
          </span>
        </div>
        {/* Our own readable "Open in Google Maps" CTA, kept inside the circle */}
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-[15%] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium text-black shadow-md transition-colors hover:text-[#94c52d]"
        >
          Open in Google Maps ↗
        </a>
      </div>

      {/* rotating seal text — the logo's arc wording, layered above the map
          so it sweeps over the disc edge like a stamp
          (decorative; the map iframe carries the real title) */}
      <img
        src={TEXT_SRC}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 z-20 h-full w-full animate-spin motion-reduce:animate-none"
        style={{ animationDuration: "40s", animationTimingFunction: "linear" }}
      />
    </div>
  );
}
