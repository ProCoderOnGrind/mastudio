import { ImageResponse } from "next/og";

/**
 * Social preview card, generated at build time.
 *
 * Shares previously fell back to whatever the platform scraped, which for a
 * mostly-photographic site meant no card at all. A typographic card keeps the
 * studio's editorial tone and needs no bundled font or remote asset.
 */
export const alt =
  "MA Studio & Partners — architecture, urban planning, landscape and interior design studio in Tirana, Albania";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "#94c52d",
            }}
          />
          <div
            style={{
              fontSize: "26px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#000000",
            }}
          >
            MA Studio &amp; Partners
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "78px",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            color: "#000000",
            maxWidth: "980px",
          }}
        >
          Architecture studio in Tirana, Albania
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "28px",
            fontSize: "24px",
            color: "#6f6f6f",
          }}
        >
          <div style={{ display: "flex" }}>
            Architecture · Urban Planning · Landscape · Interior
          </div>
          <div style={{ display: "flex", color: "#94c52d" }}>Since 2020</div>
        </div>
      </div>
    ),
    size,
  );
}
