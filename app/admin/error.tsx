"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * The console's own error boundary.
 *
 * app/(site)/error.tsx no longer covers /admin — it sits inside the site
 * route group — and the marketing version's copy ("browse properties, call
 * us") is wrong for someone who works here. This one says what actually
 * helps: what broke, and that a retry is safe.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // console.error("Admin console error", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-serif text-xl font-semibold text-navy">
        Something broke in the console
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Nothing was saved. The most common cause is the database connection
        dropping — retrying usually fixes it.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-6 flex justify-center gap-2">
        <Button
          onClick={reset}
          className="bg-brand-green text-white hover:bg-brand-green/90"
        >
          Try again
        </Button>
        <Button variant="outline" render={<Link href="/admin" />} nativeButton={false}>
          Back to overview
        </Button>
      </div>
    </div>
  );
}
