import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

/**
 * There was no robots.txt at all, so crawlers had no sitemap pointer and no
 * guidance on the routes that should never be indexed.
 *
 * /api/ carries no indexable content. /thank-you is a post-submission funnel
 * step — it also sets its own noindex, but keeping it out of the crawl budget
 * costs nothing.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /admin is the staff console. It is guarded server-side and sends
      // x-robots-tag: noindex from proxy.ts — this just keeps it out of the
      // crawl entirely rather than relying on the header being honoured.
      disallow: ["/api/", "/thank-you", "/admin"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
