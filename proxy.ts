import type { NextRequest } from "next/server";

import { updateAdminSession } from "@/lib/supabase/proxy";

/**
 * Next 16 renamed Middleware to Proxy. Same file-convention rules apply:
 * exactly one of these at the project root, `proxy.ts`, not `middleware.ts`.
 *
 * Scoped to /admin only. The public marketing site is statically rendered and
 * ISR-cached, and running an auth check in front of it would both cost a
 * Supabase round trip per visitor and mark those responses uncacheable.
 */
export async function proxy(request: NextRequest) {
  return updateAdminSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
