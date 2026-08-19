import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/auth/admin";
import { getPropertyByIdOrSlug } from "@/lib/queries/admin-properties";

/**
 * "Preview as public" — see a draft on the real page, before anyone else can.
 *
 * Uses Next's Draft Mode rather than a shareable token in the URL. The
 * difference matters: a token link forwarded to anyone (or pasted into a
 * chat, or logged by a proxy) shows them the unpublished listing, whereas the
 * draft cookie is set on this browser only, for the person who just proved
 * they are an admin. Everyone else keeps getting the cached public page.
 */
export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return new Response(guard.error, { status: 403 });

  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return new Response("Missing slug", { status: 400 });

  // Enabling draft mode for a slug that doesn't exist would leave the cookie
  // set and drop the person on a 404 with no way to tell why.
  const property = await getPropertyByIdOrSlug(slug);
  if (!property) return new Response("No such listing", { status: 404 });

  const draft = await draftMode();
  draft.enable();

  redirect(`/properties/${property.slug}`);
}
