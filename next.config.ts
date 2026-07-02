import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow a phone on the same Wi-Fi to load the dev server's client assets.
  // Without this, Next 16 blocks cross-origin dev requests, so the page HTML
  // loads but the intro animation and project reveals (client JS) never run.
  allowedDevOrigins: ["192.168.1.44", "192.168.1.*", "192.168.56.1"],

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
