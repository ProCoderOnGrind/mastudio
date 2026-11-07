import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow a phone on the same Wi-Fi to load the dev server's client assets.
  // Without this, Next 16 blocks cross-origin dev requests, so the page HTML
  // loads but the intro animation and project reveals (client JS) never run.
  allowedDevOrigins: ["192.168.1.44", "192.168.1.*", "192.168.56.1"],

  // An article that closes on a video falls back to YouTube's own poster frame
  // when no cover image was uploaded for it. Without this the optimizer
  // refuses the host and the image fails to load.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
    // Next 16 only serves qualities listed here. 75 is the default the grid
    // uses; 90 is the project viewer's, where the photo is the whole screen
    // and has to look like the original.
    qualities: [75, 90],
    // Optimised photos are kept for 31 days instead of 4 hours. On a site with
    // modest traffic a 4-hour cache is cold for most visitors, who then wait
    // while a multi-megabyte original is re-encoded. CMS uploads get new file
    // names, so a longer cache doesn't serve stale photos.
    minimumCacheTTL: 2678400,
  },

  // Baseline hardening for a static marketing site. SAMEORIGIN (not DENY) so
  // the Tina admin's visual-editing iframe keeps working.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
