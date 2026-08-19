/**
 * Per-identifier fixed-window rate limiting, in memory.
 *
 * The lead server actions are public endpoints with no auth. A honeypot stops
 * the naive bots; it does not stop somebody who looks at the network tab once
 * and then hammers the action directly. A `leads` table full of junk is not
 * merely untidy — it is how a real lead gets missed.
 *
 * In-memory is the honest choice at this scale: this site runs on a handful
 * of serverless instances and gets a low volume of genuine submissions, so
 * per-instance counters catch flooding from a single source without any
 * infrastructure. It is NOT a security boundary — state resets on cold start
 * and is not shared between instances. If volume or abuse justifies it, swap
 * the two functions below for Upstash Redis (free tier is ample) and every
 * call site keeps working unchanged.
 */

type Window = { count: number; resetAt: number };

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PER_WINDOW = 50;
/** Bound the map so a spray of unique identifiers cannot grow it forever. */
const MAX_TRACKED = 5000;

const windows = new Map<string, Window>();

function sweep(now: number) {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterMs: number };

export function checkRateLimit(
  identifier: string,
  { max = MAX_PER_WINDOW, windowMs = WINDOW_MS } = {}
): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(identifier);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED) sweep(now);
    windows.set(identifier, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= max) {
    return { ok: false, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  return { ok: true };
}

/**
 * Best-effort client identity for a server action.
 *
 * Next.js does not expose the request object to a server action, so this
 * reads the proxy headers Netlify sets. Spoofable — which is why this backs a
 * spam control and nothing that matters more than that. Falls back to a
 * shared bucket when no header is present, which is conservative in the right
 * direction: local development shares one bucket rather than none.
 */
export async function clientIdentifier(): Promise<string> {
  const { headers } = await import("next/headers");
  const headerList = await headers();

  const forwarded = headerList.get("x-nf-client-connection-ip")
    ?? headerList.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? headerList.get("x-real-ip");

  return forwarded || "unknown";
}
