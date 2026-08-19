import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv, supabaseConfigured } from "./env";

/** The only /admin routes reachable without a session. */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/auth"];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/**
 * Refreshes the Supabase session cookie and redirects signed-out visitors to
 * the login page.
 *
 * This is layer one of three, and the weakest of them by design. It only
 * inspects the session cookie — it never asks the database whether the person
 * is still on the allowlist, because the proxy runs on every request
 * including prefetches and a query there would be paid for constantly. The
 * real checks are `requireAdmin()` in the Data Access Layer (which the layout
 * and every mutation call) and the allowlist lookup behind it.
 *
 * What this layer buys is: a valid session that never silently expires
 * mid-shift, and no flash of admin chrome for someone who is simply signed
 * out.
 */
export async function updateAdminSession(
  request: NextRequest
): Promise<NextResponse> {
  // No keys configured — a fresh clone, or a deploy where the env vars were
  // forgotten. Let the request through to the login page, which explains what
  // is missing. Throwing here instead would turn every /admin URL, login
  // included, into a stack trace with no clue as to the cause. Nothing is
  // exposed by this: without Supabase there are no sessions, and the console
  // layout still refuses to render.
  if (!supabaseConfigured()) {
    const passthrough = NextResponse.next({ request });
    passthrough.headers.set("x-robots-tag", "noindex, nofollow");

    if (!isPublicAdminPath(request.nextUrl.pathname)) {
      return NextResponse.redirect(
        new URL("/admin/login?error=unconfigured", request.url)
      );
    }

    return passthrough;
  }

  const { url, key } = getSupabaseEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }

        // Supabase hands us the no-store headers that must travel with a
        // Set-Cookie carrying auth tokens. Skipping them lets a CDN cache one
        // admin's refreshed session and serve it to the next person.
        for (const [header, headerValue] of Object.entries(headers)) {
          response.headers.set(header, headerValue);
        }
      },
    },
  });

  /**
   * Bounded, and allowed to fail.
   *
   * `getUser()` is a network round trip to Supabase Auth, and this runs on
   * every admin request — including every prefetch. On Netlify this proxy is
   * an edge function with a hard abort budget, and a slow response there does
   * not degrade: it kills the whole request with "the edge function timed
   * out", which is what was happening in production.
   *
   * So it races a timer. If Supabase answers in time we get a verified user
   * and any refreshed cookies. If it doesn't, we fall back to the optimistic
   * check below rather than hanging.
   *
   * This costs nothing in security. The proxy was never the real guard —
   * `requireAdminPage()` and `requireAdmin()` resolve the session *and* the
   * allowlist server-side on every page and every action, and they are what
   * actually decides. Next's own guidance for Proxy says the same: read the
   * cookie optimistically here, verify at the data layer.
   */
  const verified = await Promise.race([
    supabase.auth
      .getUser()
      .then((result) => result.data.user)
      .catch(() => null),
    new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 2500)),
  ]);

  /**
   * Did the browser present a session cookie at all?
   *
   * Supabase names it `sb-<project-ref>-auth-token`, splitting it into
   * `.0`/`.1` chunks when it outgrows a single cookie. Presence proves
   * nothing about validity — a forged value gets past this and is then
   * rejected by the data layer — but absence is conclusive, and it is what
   * lets a signed-out visitor be bounced without asking Supabase anything.
   */
  const hasSessionCookie = request.cookies
    .getAll()
    .some((cookie) => /^sb-.*-auth-token(\.\d+)?$/.test(cookie.name));

  // `undefined` means the check timed out; `null` means Supabase answered and
  // said nobody is signed in. Only the second is a definite no.
  const user = verified === undefined ? (hasSessionCookie ? "unverified" : null) : verified;

  const { pathname, search } = request.nextUrl;

  /**
   * A redirect built with `NextResponse.redirect` starts with no cookies, so
   * a token refresh that happened moments ago would be thrown away and
   * repeated on the very next request. Carry it across.
   */
  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    for (const cookie of response.cookies.getAll()) {
      redirect.cookies.set(cookie);
    }
    return redirect;
  };

  if (!user && !isPublicAdminPath(pathname)) {
    // So a bookmarked deep link survives the round trip through email.
    const next = encodeURIComponent(`${pathname}${search}`);
    return redirectTo(`/admin/login?next=${next}`);
  }

  if (user && pathname === "/admin/login") {
    return redirectTo("/admin");
  }

  // Belt and braces alongside the robots.txt disallow: a disallow asks
  // politely, a header is obeyed even when the URL is discovered elsewhere.
  response.headers.set("x-robots-tag", "noindex, nofollow");

  return response;
}
