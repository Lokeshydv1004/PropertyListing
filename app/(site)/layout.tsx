import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Analytics } from "@/components/layout/analytics";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";

/**
 * The public site's chrome.
 *
 * This used to live in the root layout, which meant every route on the domain
 * got a navbar, a footer, a WhatsApp button and the organisation schema —
 * including the admin console, where all four are wrong. A route group keeps
 * the URLs exactly as they were (`(site)` contributes nothing to the path)
 * while giving /admin a genuinely separate shell.
 */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Keyboard users otherwise tab through the entire navigation on
          every page before reaching any content. Invisible until focused. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-navy focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-3 focus:ring-ring/50"
      >
        Skip to content
      </a>

      <Navbar />
      <main id="main" className="flex-1 pt-16 bg-white">
        {children}
      </main>
      <Footer />
      {/* Both render null until their env vars are set, so nothing
          third-party loads and no dead number is advertised. */}
      <WhatsAppFab />
      <Analytics />

      {/* Sitewide identity. Page-specific schema (FAQPage, BreadcrumbList,
          RealEstateListing) is emitted by the pages that own it and refers
          back to this Organization by @id. */}
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
    </>
  );
}
