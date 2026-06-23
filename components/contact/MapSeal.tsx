"use client";

// Circular "seal" — a live Google Map clipped into a disc, ringed by brand text
// that slowly rotates, echoing the MA logo. The map keeps its natural colors;
// the ring + frame use the logo green.
const GREEN = "#94c52d"; // sampled from the MA logo

export default function MapSeal({
  query,
  ringText,
}: {
  query: string;
  ringText: string;
}) {
  // Coordinates/address as the query drop the red pin on the studio the moment
  // the embed loads — no API key needed for the q=/output=embed form.
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=18&hl=en&output=embed`;
  // The embed's own "View larger map" link lives in a corner that the circular
  // crop slices off, so we provide our own, placed safely inside the disc.
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[360px]">
      {/* green hairline frame */}
      <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: GREEN }} />

      {/* rotating brand ring (decorative; the map iframe carries the real title) */}
      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full animate-spin motion-reduce:animate-none"
        style={{ animationDuration: "26s", animationTimingFunction: "linear" }}
      >
        <defs>
          <path id="mapseal-ring" d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0" />
        </defs>
        <text style={{ fill: GREEN, fontSize: "12px", letterSpacing: "0.34em", fontWeight: 500 }}>
          {/* textLength fills ~94% of the ring, leaving a small loop-seam gap */}
          <textPath href="#mapseal-ring" startOffset="0" textLength="498" lengthAdjust="spacing">
            {ringText}
          </textPath>
        </text>
      </svg>

      {/* the map disc */}
      <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-black">
        {/* The iframe is oversized and centered so Google's own corner/top
            controls fall outside the circular crop instead of being sliced. */}
        <iframe
          title="Map — MA Studio & Partners"
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute left-1/2 top-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2 border-0"
        />
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
    </div>
  );
}
