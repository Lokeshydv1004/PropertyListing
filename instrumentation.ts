import type { Instrumentation } from "next";

/**
 * Temporary diagnostics for the "site hangs after a few minutes" bug.
 *
 * Server errors that get swallowed inside Suspense/streaming don't always
 * reach the terminal on their own — this makes them loud. Remove once the
 * root cause is confirmed fixed.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { register: registerNode } = await import("./instrumentation.node");
  registerNode();
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  const digest =
    typeof err === "object" && err !== null && "digest" in err
      ? String((err as { digest?: unknown }).digest)
      : undefined;

  // console.error(
  //   `[instrumentation] onRequestError ${request.method} ${request.path}`,
  //   { message, digest, context, stack }
  // );
};
