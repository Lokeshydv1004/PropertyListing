import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "./env";

/**
 * A request-scoped Supabase client for Server Components, Server Actions and
 * Route Handlers.
 *
 * Never hoist this into a module-level singleton. The client carries the
 * caller's session in its cookie store, and a shared instance on a warm
 * serverless container would hand one admin's session to the next request.
 */
export async function createClient() {
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components are not allowed to write cookies. That is fine
          // and expected here: proxy.ts refreshes the session on every admin
          // request, so a refresh dropped during render is picked up on the
          // next one rather than being lost.
        }
      },
    },
  });
}
