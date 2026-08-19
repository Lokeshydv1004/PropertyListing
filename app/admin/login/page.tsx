import type { Metadata } from "next";
import Link from "next/link";
import { Home, ShieldAlert } from "lucide-react";

import { AdminLoginForm } from "@/components/admin/login-form";
import { safeNextPath } from "@/lib/validation/admin-auth";
import { supabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/** Why the visitor was sent back here, in words rather than a code. */
const ERRORS: Record<string, string> = {
  link: "That sign-in link didn't work. Links expire and can only be used once — request a fresh one.",
  revoked: "That account no longer has access to the admin console.",
  unavailable:
    "Signed in, but the admin database was unreachable. Try again in a moment.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    error?: string;
    signed_out?: string;
  }>;
}) {
  const params = await searchParams;

  const error = params.error ? ERRORS[params.error] : null;
  const next = safeNextPath(params.next);
  const configured = supabaseConfigured();

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-navy px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-white"
        >
          <Home
            className="size-5 text-gold"
            strokeWidth={2.25}
            aria-hidden="true"
          />
          <span className="font-medium">GharShare</span>
        </Link>

        <h1 className="mt-6 text-center font-serif text-2xl font-semibold text-white">
          Admin console
        </h1>
        <p className="mt-1.5 text-center text-sm text-white/60">
          Sign in to manage leads and listings.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-6 flex items-start gap-2 rounded-lg bg-white/10 p-3 text-sm text-white"
          >
            <ShieldAlert
              className="mt-0.5 size-4 shrink-0 text-gold"
              aria-hidden="true"
            />
            {error}
          </p>
        )}

        {params.signed_out && !error && (
          <p className="mt-6 rounded-lg bg-white/10 p-3 text-center text-sm text-white/80">
            You&apos;ve been signed out.
          </p>
        )}

        <div className="mt-6">
          {configured ? (
            <AdminLoginForm next={next} />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 text-sm">
              <h2 className="font-medium text-navy">
                Admin sign-in isn&apos;t configured
              </h2>
              <p className="mt-2 text-muted-foreground">
                The Supabase Auth keys are missing, so no sign-in link can be
                sent. Set these and redeploy:
              </p>
              <ul className="mt-3 space-y-1 font-mono text-xs text-navy">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</li>
              </ul>
              <p className="mt-3 text-muted-foreground">
                Then add the first owner with{" "}
                <code className="font-mono text-xs text-navy">
                  npm run admin:add
                </code>
                . The public site is unaffected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
