import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { adminUsers, type AdminUser } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { withDbRetry } from "@/lib/with-db-retry";

/**
 * The authorisation layer for the whole console.
 *
 * The thing to understand before touching any of this: **a Server Action is a
 * public HTTP endpoint.** It has a stable, guessable id that ships to the
 * browser, and anyone who reads one network request can invoke it directly
 * with whatever arguments they like. proxy.ts guards *pages*; it does not
 * guard actions. lib/actions/leads.ts:66 already says this about the public
 * forms — the same is true here, where the endpoints archive listings and
 * change funding numbers.
 *
 * So every mutation starts with `requireAdmin()`, and every destructive one
 * with `requireOwner()`. No exceptions, including the ones that "obviously"
 * can only be reached from a page that is already protected.
 */

export type AdminGuard =
  | { ok: true; user: AdminUser }
  | { ok: false; error: string };

const NOT_SIGNED_IN = "Your session has expired. Please sign in again.";
const NOT_ALLOWED = "This account no longer has access to the admin console.";
const OWNER_ONLY = "Only an owner can do that.";

/**
 * Resolves the signed-in admin, or null.
 *
 * Two lookups, both required: Supabase says who holds the session, and
 * `admin_users` says whether that address is still allowed in. A session
 * outlives a revocation — deactivating someone in the table has to lock them
 * out on their next request, not whenever their JWT happens to expire.
 *
 * Wrapped in React's `cache` so a page that checks auth in the layout, the
 * page and a leaf component pays for one round trip, not three.
 */
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) return null;

  const email = user.email.toLowerCase();

  const rows = await withDbRetry(() =>
    db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1)
  );

  const admin = rows[0];
  if (!admin || !admin.isActive) return null;

  return admin;
});

/**
 * For pages and layouts: resolves the admin or sends the visitor to login.
 *
 * Returns `AdminUser` rather than a union so callers can use the result
 * directly — `redirect()` throws, so nothing after it runs.
 */
export async function requireAdminPage(): Promise<AdminUser> {
  // Belt and braces with proxy.ts: a direct render of a console route with no
  // Supabase config should explain itself rather than throw out of
  // `createClient()`.
  if (!supabaseConfigured()) {
    redirect("/admin/login?error=unconfigured");
  }

  const admin = await getAdminUser();

  if (!admin) {
    // `revoked` rather than a generic bounce: someone with a valid session
    // who has been deactivated should be told that, not left wondering why
    // the login page keeps reappearing.
    redirect("/admin/login?error=revoked");
  }

  return admin;
}

/** For Server Actions: never throws, so the caller can return a clean error. */
export async function requireAdmin(): Promise<AdminGuard> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { ok: false, error: NOT_SIGNED_IN };

  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: NOT_ALLOWED };

  return { ok: true, user: admin };
}

/** For destructive Server Actions. Everything archives; owners do the rest. */
export async function requireOwner(): Promise<AdminGuard> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  if (guard.user.role !== "owner") {
    return { ok: false, error: OWNER_ONLY };
  }

  return guard;
}
