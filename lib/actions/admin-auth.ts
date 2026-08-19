"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { adminUsers } from "@/db/schema";
import { checkRateLimit, clientIdentifier } from "@/lib/rate-limit";
import { SITE } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/server";
import { withDbRetry } from "@/lib/with-db-retry";
import {
  adminLoginSchema,
  safeNextPath,
  type AdminLoginValues,
} from "@/lib/validation/admin-auth";

export type AdminAuthResult =
  | { success: true }
  | { success: false; error: string };

/**
 * The same message whether or not the address is on the allowlist.
 *
 * Distinguishing them would turn the login form into a directory of who works
 * here, which is exactly the list you'd want before writing a phishing email.
 * The confirmation copy lives in the login form; this action never reveals
 * which branch it took.
 */
const RATE_LIMITED =
  "Too many sign-in attempts. Wait a few minutes and try again.";
const GENERIC_ERROR = "Could not send the sign-in link. Please try again.";

/**
 * Where the magic link should land the browser.
 *
 * Derived from the request rather than from NEXT_PUBLIC_SITE_URL so that a
 * link requested on localhost comes back to localhost. The env value is the
 * fallback for anywhere the forwarded headers are missing.
 */
async function callbackOrigin(): Promise<string> {
  const headerList = await headers();

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return SITE.url;

  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${protocol}://${host}`;
}

/**
 * Sends a magic link — but only to an address already on the allowlist.
 *
 * Checking the table *before* calling Supabase is the point of this action.
 * `signInWithOtp` would happily create an auth user for any address on
 * earth, so without this check the console's front door is an open
 * email-sending endpoint pointed at a domain we control.
 */
export async function sendAdminMagicLink(
  values: AdminLoginValues
): Promise<AdminAuthResult> {
  const parsed = adminLoginSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: "Enter a valid email address." };
  }

  const email = parsed.data.email;

  // Two buckets, because each catches a different abuse. Per-IP stops one
  // machine working through a list of addresses; per-address stops a
  // distributed attempt to bomb one person's inbox with real, valid links.
  const identifier = await clientIdentifier();
  const byIp = checkRateLimit(`admin-login:${identifier}`, {
    max: 10,
    windowMs: 10 * 60 * 1000,
  });
  const byEmail = checkRateLimit(`admin-login-email:${email}`, {
    max: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!byIp.ok || !byEmail.ok) {
    return { success: false, error: RATE_LIMITED };
  }

  let allowed = false;

  try {
    const rows = await withDbRetry(() =>
      db
        .select({ isActive: adminUsers.isActive })
        .from(adminUsers)
        .where(eq(adminUsers.email, email))
        .limit(1)
    );

    allowed = Boolean(rows[0]?.isActive);
  } catch {
    // console.error("[admin] allowlist lookup failed", error);
    return { success: false, error: GENERIC_ERROR };
  }

  // Not on the list: stop here, but report the same thing as success.
  if (!allowed) return { success: true };

  const origin = await callbackOrigin();
  const next = safeNextPath(parsed.data.next);

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // The allowlist row is the record of who may be here; the auth user
        // is just the credential. Creating it on first sign-in avoids having
        // to provision people in two places.
        shouldCreateUser: true,
        emailRedirectTo: `${origin}/admin/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      // console.error("[admin] magic link send failed", error);
      return { success: false, error: GENERIC_ERROR };
    }
  } catch {
    // console.error("[admin] magic link send threw", error);
    return { success: false, error: GENERIC_ERROR };
  }

  return { success: true };
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/admin/login?signed_out=1");
}
