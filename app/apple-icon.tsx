import { ImageResponse } from "next/og";

/**
 * Home-screen icon for iOS bookmarks. Generated at the size Apple expects,
 * with no rounded corners of our own — iOS applies its own mask.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#032E24",
          color: "#D9A441",
          fontSize: 104,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        G
      </div>
    ),
    size
  );
}
