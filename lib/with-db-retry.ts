import { QUERY_TIMEOUT_MS, resetDbConnection } from "@/db/client";

/**
 * Thrown when a query outlives QUERY_TIMEOUT_MS.
 *
 * A distinct type so callers can tell "the database said no" from "the
 * database said nothing at all", which are different problems with different
 * fixes.
 */
export class DbTimeoutError extends Error {
  constructor(ms: number) {
    super(`Database query exceeded ${ms}ms`);
    this.name = "DbTimeoutError";
  }
}

/**
 * Runs `fn`, but never waits on it forever.
 *
 * The reason this exists rather than just `await fn()`: on Netlify the server
 * runs in a Lambda that is frozen between invocations, and while it is frozen
 * the TCP socket to Supabase's transaction pooler dies without either side
 * noticing. The next request hands its query to that dead socket and waits
 * for a reply that is never coming.
 *
 * Neither existing guard catches it. `statement_timeout` is enforced by
 * Postgres, and the query never reaches Postgres. The retry below only ever
 * fired on a *rejection*, and a hang does not reject. So the request sat
 * there until Netlify killed the whole function at 30s — three of those
 * back-to-back is what the crash page was reporting, with the edge middleware
 * surfacing the kill as `AbortError: The signal has been aborted`.
 *
 * Racing a timer converts the hang into a rejection, which is a thing this
 * function already knows how to recover from.
 */
function withTimeout<T>(fn: () => Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new DbTimeoutError(QUERY_TIMEOUT_MS)),
      QUERY_TIMEOUT_MS
    );
  });

  // The losing promise is never cancelled — postgres.js gives us no handle to
  // abort an in-flight query. That is fine: on the timeout path the very next
  // thing we do is destroy the socket it is waiting on, which settles it.
  // Clearing the timer matters more, because an uncleared one keeps the Lambda
  // event loop alive after the response has been sent.
  return Promise.race([fn(), timeout]).finally(() => clearTimeout(timer));
}

/**
 * Executes a database operation once, bounded by QUERY_TIMEOUT_MS.
 * If it fails or hangs, resets the database connection and retries once.
 *
 * Both attempts are bounded, so the worst case is 2 × QUERY_TIMEOUT_MS plus
 * the reset — deliberately kept under Netlify's 30s function limit so the
 * caller gets a real error it can render, rather than having the runtime
 * shoot the whole function and serve a platform crash page.
 */
export async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await withTimeout(fn);
  } catch {
    // console.error("[db] first attempt failed:", error);

    try {
      await resetDbConnection();
    } catch {
      // console.error("[db] failed to reset connection:", resetError);
    }

    // console.log("[db] retrying database operation...");

    return await withTimeout(fn);
  }
}
