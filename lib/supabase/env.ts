/**
 * Supabase Auth configuration, resolved in one place.
 *
 * The public site does not use Supabase Auth at all — it only ever talks to
 * Postgres through Drizzle. So these variables are missing in plenty of
 * legitimate setups (a contributor running the marketing site locally), and
 * a missing key must fail loudly at the admin boundary rather than crashing
 * an unrelated page at import time.
 */

/**
 * Supabase renamed the browser-safe key from "anon" to "publishable" in 2025.
 * Projects created before that still show the old one in the dashboard, so
 * both names are accepted and neither is more correct than the other.
 */
function publishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && publishableKey());
}

export function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = publishableKey();

  if (!url || !key) {
    throw new Error(
      "Supabase Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) " +
        "in .env.local — see .env.local.example."
    );
  }

  return { url, key };
}
