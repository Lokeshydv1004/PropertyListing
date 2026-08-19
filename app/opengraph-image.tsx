import { ImageResponse } from "next/og";

/**
 * The default share card, generated rather than shipped as a PNG.
 *
 * Generating it means the brand colours live in one place and there is no
 * binary asset to keep in sync when the positioning changes. It renders on a
 * dark ground because that is the site's own hero treatment and it survives
 * WhatsApp's compression better than fine text on white.
 */
export const alt =
  "GharShare — fractional real estate investment in India";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "#032E24",
          color: "white",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#0F7A5A",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            G
          </div>
          <div style={{ fontSize: 34, fontWeight: 600 }}>GharShare</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.1 }}>
            Own a piece of
          </div>
          <div
            style={{
              fontSize: 66,
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#D9A441",
            }}
          >
            premium real estate.
          </div>
          <div style={{ fontSize: 30, marginTop: 26, color: "#D5DDD9" }}>
            Title-verified properties · Professionally managed · Fees stated
            upfront
          </div>
        </div>
      </div>
    ),
    size
  );
}
