import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow a phone on the same Wi-Fi to load the dev server's client assets.
  // Without this, Next 16 blocks cross-origin dev requests, so the page HTML
  // loads but the intro animation and project reveals (client JS) never run.
  allowedDevOrigins: ["192.168.1.44", "192.168.1.*", "192.168.56.1"],
};

export default nextConfig;
