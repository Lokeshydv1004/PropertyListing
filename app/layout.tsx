import type { Metadata } from "next";
import { Inter, Geist_Mono, Playfair_Display } from "next/font/google";
import { SITE } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

/**
 * Sharing metadata, which the site had none of.
 *
 * In India WhatsApp is the primary channel property research travels on: a
 * link gets forwarded to a spouse, a parent, a CA. Without Open Graph tags
 * every one of those forwards rendered as a bare URL — no image, no title, no
 * description — which is both a silent loss of referral traffic and a worse
 * first impression than the page itself would give.
 *
 * `metadataBase` makes the relative image paths below resolve to absolute
 * URLs, which is required: crawlers and WhatsApp will not follow a relative
 * og:image.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "GharShare — Fractional Real Estate Investment in India",
    // Every page sets only its own name; the brand is appended here once.
    template: "%s | GharShare",
  },
  description:
    "Own a share of premium, income-generating Indian real estate. Title-verified properties, professional management, and fees stated upfront on every listing.",
  applicationName: SITE.name,
  keywords: [
    "fractional real estate India",
    "fractional property investment",
    "commercial real estate investment India",
    "rental income investment",
    "SM REIT",
  ],
  authors: [{ name: SITE.legalName }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE.name,
    url: SITE.url,
    title: "GharShare — Fractional Real Estate Investment in India",
    description:
      "Own a share of premium, income-generating Indian real estate. Title-verified properties, professional management, fees stated upfront.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GharShare — Fractional Real Estate Investment in India",
    description:
      "Own a share of premium, income-generating Indian real estate. Title-verified properties, professional management, fees stated upfront.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

/**
 * The document shell, and nothing else.
 *
 * Fonts, global CSS and the default metadata are genuinely sitewide. The
 * navbar, footer, WhatsApp button and organisation schema are not — they
 * belong to the public site and live in app/(site)/layout.tsx, so that the
 * admin console under /admin renders in its own shell rather than inside the
 * marketing furniture.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
