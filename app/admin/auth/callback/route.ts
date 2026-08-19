import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db/client";
import { adminUsers } from "@/db/schema";
import { logActivity } from "@/lib/admin/activity";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/validation/admin-auth";
import { withDbRetry } from "@/lib/with-db-retry";

/**
 * Where the emailed magic link lands.
 *
 * Supabase sends the browser here with either a PKCE `code` (the default for
 * @supabase/ssr) or a `token_hash` + `type` pair, depending on how the
 * project's email template is written. Handling both means a template that
 * was customised before this console existed doesn't produce a dead link.
 *
 * Holding a valid link is not the same as having access. The allowlist is
 * re-checked here, after the session exists, so that a link emailed to
 * someone who has since been deactivated cannot be redeemed.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNextPath(searchParams.get("next"));

  const supabase = await createClient();

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash
      ? await supabase.auth.verifyOtp({
          type: (type as "magiclink" | "email") ?? "email",
          token_hash: tokenHash,
        })
      : { error: new Error("No sign-in code in the link") };

  if (error) {
    // console.error("[admin] magic link exchange failed", error);
    return NextResponse.redirect(`${origin}/admin/login?error=link`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.toLowerCase();

  if (!email) {
    return NextResponse.redirect(`${origin}/admin/login?error=link`);
  }

  try {
    const rows = await withDbRetry(() =>
      db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1)
    );

    const admin = rows[0];

    if (!admin || !admin.isActive) {
      // A revoked account must not keep a usable session lying around.
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/admin/login?error=revoked`);
    }

    await withDbRetry(() =>
      db
        .update(adminUsers)
        .set({ authUserId: user!.id, lastSeenAt: new Date() })
        .where(eq(adminUsers.id, admin.id))
    );

    // The first entry in the audit log for every session. Cheap, and it is
    // what turns "someone changed the funding target" into a name.
    await logActivity({
      actor: admin,
      action: "sign_in",
      entityType: "admin_user",
      entityId: admin.id,
      entityLabel: admin.name,
    });
  } catch {
    // console.error("[admin] sign-in bookkeeping failed", dbError);
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/admin/login?error=unavailable`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
