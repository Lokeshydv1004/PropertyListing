import type { MetadataRoute } from "next";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { properties } from "@/db/schema";
import { INSIGHTS } from "@/lib/insights-data";
import { SITE } from "@/lib/site-config";

/**
 * Tells Google what exists. Nothing did before, so every page had to be
 * discovered by crawling links — slow, and it misses listings entirely once
 * they fall off the first page of an infinitely-scrolled index.
 *
 * Deliberately omits /thank-you (a funnel step, already noindex) and the API
 * routes. Filtered /properties URLs are excluded too: they are near-duplicate
 * views of one page and are marked noindex in that route's generateMetadata.
 */

// The listing catalogue changes when a property is added, not per request.
export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/properties", priority: 0.9 },
  { path: "/invest-with-us", priority: 0.8 },
  { path: "/how-it-works", priority: 0.8 },
  { path: "/faq", priority: 0.8 },
  { path: "/about", priority: 0.8 },
  { path: "/insights", priority: 0.7 },
  { path: "/list-your-property", priority: 0.7 },
  { path: "/contact", priority: 0.6 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
  { path: "/risk-disclosure", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE.url}${route.path}`,
    lastModified: now,
    changeFrequency: route.priority >= 0.8 ? "weekly" : "monthly",
    priority: route.priority,
  }));

  // Drafts awaiting professional review set their own noindex; listing them
  // here would ask Google to crawl exactly what we told it to ignore.
  const insightPages: MetadataRoute.Sitemap = INSIGHTS.filter(
    (post) => !post.needsReview
  ).map((post) => ({
    url: `${SITE.url}/insights/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  // A sitemap that throws takes the whole route down. If the database is
  // unreachable, serving the static half is strictly better than serving 500.
  let propertyPages: MetadataRoute.Sitemap = [];
  try {
    const rows = await db
      .select({
        slug: properties.slug,
        updatedAt: properties.updatedAt,
        publishedAt: properties.publishedAt,
        createdAt: properties.createdAt,
      })
      .from(properties)
      // Drafts must never reach the sitemap: submitting a URL that returns
      // 404 to every crawler is worse than not listing it at all.
      .where(eq(properties.isPublished, true))
      .orderBy(desc(properties.createdAt), asc(properties.id));

    propertyPages = rows.map((row) => ({
      url: `${SITE.url}/properties/${row.slug}`,
      // updated_at is what "last modified" actually means now that edits are
      // stamped; created_at only ever said when it was first typed in.
      lastModified: row.updatedAt ?? row.publishedAt ?? row.createdAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {
    // console.error("sitemap: could not read properties", error);
  }

  return [...staticPages, ...insightPages, ...propertyPages];
}
