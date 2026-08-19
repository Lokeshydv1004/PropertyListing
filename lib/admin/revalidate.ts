import "server-only";

import { revalidatePath } from "next/cache";

/**
 * One place that knows what a property edit invalidates.
 *
 * The public pages are ISR-cached at 60s (app/(site)/page.tsx,
 * app/(site)/properties/[slug]/page.tsx), so without an explicit revalidation
 * a save is invisible for up to a minute — and the support complaint it
 * generates ("I saved it and the site didn't change") is indistinguishable
 * from a real bug.
 *
 * It is one function rather than scattered `revalidatePath` calls because
 * scattered ones drift: the next person adds a mutation, revalidates the
 * detail page, forgets the index, and the listing is live everywhere except
 * the page people actually browse.
 */
export function revalidateProperty(
  slug: string | null | undefined,
  options: {
    /** The slug before this edit, when it changed. Both need clearing. */
    previousSlug?: string | null;
    /** Parent building's slug, if the listing has one. */
    buildingSlug?: string | null;
    /** Publish state changed, or a featured-eligible field did. */
    affectsHome?: boolean;
    /** Publish, unpublish or slug change — the sitemap's contents moved. */
    affectsSitemap?: boolean;
  } = {}
): void {
  if (slug) revalidatePath(`/properties/${slug}`);

  // A renamed listing leaves its old URL cached and serving the old content
  // until it expires; the old path has to be cleared explicitly.
  if (options.previousSlug && options.previousSlug !== slug) {
    revalidatePath(`/properties/${options.previousSlug}`);
  }

  revalidatePath("/properties");

  if (options.buildingSlug) {
    revalidatePath(`/buildings/${options.buildingSlug}`);
  }

  if (options.affectsHome) revalidatePath("/");

  if (options.affectsSitemap) revalidatePath("/sitemap.xml");

  // The console's own lists are force-dynamic, but the overview reads counts
  // through the layout.
  revalidatePath("/admin/properties");
}
