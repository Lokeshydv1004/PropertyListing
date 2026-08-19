export async function register() {
  process.on("unhandledRejection", (reason) => {
    // console.error("[instrumentation] unhandledRejection:", reason);
  });

  process.on("uncaughtException", (err) => {
    // console.error("[instrumentation] uncaughtException:", err);
  });

  await warmDbPool();
}

/**
 * Open every pool connection now, before the server accepts its first
 * request.
 *
 * A cold pool (no idle connections yet) makes any page that fires 2+
 * concurrent queries — e.g. the properties page's Promise.all — open that
 * many brand-new physical connections to the Supabase pooler at once. Each
 * fresh connection is slow enough to establish (~1.5s from this network,
 * plus postgres.js's own one-time-per-connection type-OID introspection
 * query) that they can lose the race against the server's statement_timeout,
 * throwing "canceling statement due to statement timeout" and crashing the
 * page. Reproduced repeatedly, including on a server that had just started
 * with nothing else going on. Firing one trivial query here forces the pool's
 * one connection to open and finish its one-time warmup while nothing is
 * waiting on it, so the first real request never pays that cost.
 *
 * Must match db/client.ts's `max` — DB_POOL_MAX, default 1 — not a separate
 * constant, or this warms a different number of connections than the pool
 * actually allows.
 *
 * A failed warmup query doesn't just mean "try again later" — it can leave
 * the connection wedged (see resetDbConnection's doc comment), and every
 * real request would then queue behind that same dead connection forever.
 * So on failure this force-closes it and tries once more with a fresh one
 * before giving up and letting the first real request take the risk.
 */
async function warmDbPool() {
  const { db, resetDbConnection } = await import("@/db/client");
  const { sql } = await import("drizzle-orm");
  const max = Number(process.env.DB_POOL_MAX ?? 1);

  const attempt = () =>
    Promise.allSettled(
      Array.from({ length: max }, () => db.execute(sql`select 1`))
    );

  let results = await attempt();
  let failed = results.filter((r) => r.status === "rejected").length;

  if (failed > 0) {
    // console.log(`[db] warmup failed on ${failed}/${max}, resetting and retrying once`);
    await resetDbConnection();
    results = await attempt();
    failed = results.filter((r) => r.status === "rejected").length;
  }

  // console.log(
  //   `[db] pool warmed: ${max - failed}/${max} connections ready${failed ? ` (${failed} still failing, will retry on demand)` : ""}`
  // );
}
