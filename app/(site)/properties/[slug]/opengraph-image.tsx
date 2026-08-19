import { ImageResponse } from "next/og";
import { getPropertyBySlug } from "@/lib/queries/properties";
import { formatCompactINR, formatRent, truncateText } from "@/lib/format";

/**
 * A share card built from the listing itself.
 *
 * This is the real differentiator over a single static image: a link
 * forwarded on WhatsApp arrives showing the property's name, its location and
 * its entry price, so the recipient knows what they are being sent before
 * they tap. A generic brand card cannot do that.
 *
 * Note: `params` is a Promise in this version of Next and must be awaited.
 */
export const alt = "Property listing on GharShare";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SHELL: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  width: "100%",
  height: "100%",
  background: "#032E24",
  color: "white",
  padding: 72,
  fontFamily: "sans-serif",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // A share card must never take the page down with it. If the listing can't
  // be read, fall back to the brand card rather than throwing.
  let property: Awaited<ReturnType<typeof getPropertyBySlug>>;
  try {
    property = await getPropertyBySlug(slug);
  } catch {
    property = undefined;
  }

  if (!property) {
    return new ImageResponse(
      (
        <div style={SHELL}>
          <div style={{ fontSize: 34, fontWeight: 600 }}>GharShare</div>
          <div style={{ fontSize: 60, fontWeight: 700 }}>
            Fractional real estate investment
          </div>
        </div>
      ),
      size
    );
  }

  const price =
    property.listingType === "fractional" && property.minInvestment
      ? `From ${formatCompactINR(Number(property.minInvestment))}`
      : property.listingType === "sale" && property.salePrice
        ? formatCompactINR(Number(property.salePrice))
        : property.monthlyRent
          ? formatRent(Number(property.monthlyRent))
          : "Enquire for price";

  const yieldLine = property.estAnnualYield
    ? `${property.estAnnualYield}% p.a. est. yield`
    : null;

  return new ImageResponse(
    (
      <div style={SHELL}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#0F7A5A",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            G
          </div>
          <div style={{ fontSize: 28, fontWeight: 600 }}>GharShare</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, color: "#D9A441" }}>
            {property.shortLocation}
          </div>
          <div
            style={{
              fontSize: 58,
              fontWeight: 700,
              marginTop: 14,
              lineHeight: 1.12,
            }}
          >
            {truncateText(property.title, 62)}
          </div>
          <div
            style={{
              display: "flex",
              gap: 28,
              marginTop: 30,
              fontSize: 30,
              color: "#D5DDD9",
            }}
          >
            <span>{price}</span>
            {yieldLine && <span>·</span>}
            {yieldLine && <span>{yieldLine}</span>}
          </div>
        </div>
      </div>
    ),
    size
  );
}
