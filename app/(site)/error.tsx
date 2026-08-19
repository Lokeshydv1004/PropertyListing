"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE, hasRealPhone, telHref } from "@/lib/site-config";

/**
 * The last line of defence between a database hiccup and a raw stack trace.
 *
 * Every meaningful page on this site reads from Postgres, and the project's
 * own plan notes that Supabase's free tier pauses after seven days idle —
 * which is the entire reason the keep-alive workflow exists. If it ever does
 * pause, or the connection pooler stumbles, every one of those pages throws.
 * Without this file the visitor gets Next.js's default "Application error: a
 * client-side exception has occurred", which on a site asking people to part
 * with lakhs of rupees is close to the worst impression available.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Without this the digest is the only thread back to the real cause, and
    // it is only visible in the platform's function logs.
    // console.error("Unhandled application error", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="font-serif text-2xl font-semibold text-navy sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-3 text-muted-foreground">
        We couldn&apos;t load this page just now. It is almost certainly us,
        not you — please try again in a moment.
      </p>
      {hasRealPhone && (
        <p className="mt-2 text-muted-foreground">
          If it keeps happening, call us on{" "}
          <a
            href={telHref}
            className="font-medium text-navy underline underline-offset-2"
          >
            {SITE.phone}
          </a>{" "}
          and we&apos;ll help you directly.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={reset}
          className="bg-brand-green text-white hover:bg-brand-green/90"
        >
          Try again
        </Button>
        <Button
          render={<Link href="/properties" />}
          nativeButton={false}
          variant="outline"
        >
          Browse properties
        </Button>
      </div>

      {error.digest && (
        <p className="mt-8 text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}
    </div>
  );
}
