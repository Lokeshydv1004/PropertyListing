import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function getConnectionString(): string {
  const value = process.env.DATABASE_URL;

  if (!value) {
    throw new Error("DATABASE_URL is not set");
  }

  return value;
}

/**
 * Three, not one.
 *
 * With a pool of one, a single wedged socket is a total outage for that
 * container: every query in the request queues behind the dead connection,
 * and the admin console's layout and page together fire around ten of them.
 * Three means one bad socket costs one query its timeout instead of all of
 * them, and it lets the overview page's `Promise.all` actually run in
 * parallel rather than serialising through a single wire.
 *
 * Still small on purpose. Supabase's transaction pooler is shared across
 * every concurrent Lambda, so this is per-container, not per-site.
 */
const MAX_CONNECTIONS = Number(process.env.DB_POOL_MAX ?? 3);

/**
 * How long any single query may take before withDbRetry gives up on it.
 *
 * Sized against Netlify's 30s function limit, not against how slow a query
 * ought to be: two bounded attempts plus a connection reset has to finish
 * with room to spare, or the runtime kills the function and serves its own
 * crash page instead of ours.
 */
export const QUERY_TIMEOUT_MS = Number(process.env.DB_QUERY_TIMEOUT_MS ?? 8000);

type DbInstance = {
  client: ReturnType<typeof postgres>;
  db: ReturnType<typeof drizzle>;
};

const globalForDb = globalThis as unknown as {
  dbInstance: DbInstance | undefined;
};

function createDbInstance(): DbInstance {
  const client = postgres(getConnectionString(), {
    prepare: false,
    max: MAX_CONNECTIONS,

    // Shorter than the pooler's own idle cutoff and far shorter than the
    // gap between requests on a quiet site, so postgres.js discards a
    // connection itself rather than handing back one that died while the
    // Lambda was frozen. This does not fix the race — a container can always
    // be thawed onto a stale socket — it just narrows the window.
    idle_timeout: 20,

    // Was 30, i.e. exactly Netlify's function limit, which meant the runtime
    // always killed the function before postgres.js gave up. Now it fails
    // early enough for withDbRetry to reset and try again within budget.
    connect_timeout: 10,

    // connect_timeout only bounds the TCP handshake. Nothing bounded how
    // long a query could sit waiting on a response after that — so a query
    // the pooler silently dropped or never answered (reproduced repeatedly
    // against the transaction pooler on this project) hung every request
    // behind it forever instead of failing and letting withDbRetry recover.
    //
    // statement_timeout is the server-side half of that bound and only helps
    // once the query actually reaches Postgres; withDbRetry's QUERY_TIMEOUT_MS
    // is the client-side half, and it is the one that catches a socket the
    // query never left.
    connection: {
      statement_timeout: 10000,
    },

    debug: (connection, query) => {
      // console.log(
      //   `[db] ${new Date().toISOString()} conn=${connection} -> ${query
      //     .replace(/\s+/g, " ")
      //     .slice(0, 150)}`
      // );
    },

    onnotice: (notice) => {
      // console.log("[db] notice:", notice);
    },
  });

  return {
    client,
    db: drizzle(client, { schema }),
  };
}

let dbInstance =
  globalForDb.dbInstance ?? createDbInstance();

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbInstance = dbInstance;

  const globalForDbLog = globalThis as unknown as {
    dbPoolLogInterval: ReturnType<typeof setInterval> | undefined;
  };

  if (!globalForDbLog.dbPoolLogInterval) {
    // console.log(`[db] pool initialized: max=${MAX_CONNECTIONS}`);

    globalForDbLog.dbPoolLogInterval = setInterval(() => {
      const mem = process.memoryUsage();

      // console.log(
      //   `[db] heartbeat max=${MAX_CONNECTIONS} rss=${(
      //     mem.rss /
      //     1024 /
      //     1024
      //   ).toFixed(0)}MB heapUsed=${(
      //     mem.heapUsed /
      //     1024 /
      //     1024
      //   ).toFixed(0)}MB`
      // );
    }, 15000).unref();
  }
}

export function getDb() {
  return dbInstance.db;
}

export async function resetDbConnection() {
  // console.log("[db] resetting database connection...");

  const oldClient = dbInstance.client;

  // Bounded, because this runs on the recovery path.
  //
  // `end({ timeout: 0 })` is meant to destroy sockets immediately, but this
  // is called precisely when a socket is already misbehaving — and an await
  // that never settles here would reintroduce the exact hang the timeout in
  // withDbRetry exists to prevent, one layer further down. Whether the close
  // completes does not actually matter: the reference is dropped either way
  // and the replacement below never touches it again.
  try {
    await Promise.race([
      oldClient.end({ timeout: 0 }),
      new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 2000);
        // Not worth keeping the Lambda's event loop alive for.
        timer.unref?.();
      }),
    ]);
  } catch {
    // console.error("[db] error closing old connection:", error);
  }

  dbInstance = createDbInstance();

  if (process.env.NODE_ENV !== "production") {
    globalForDb.dbInstance = dbInstance;
  }

  // console.log("[db] fresh database connection created");
}

/**
 * Compatibility export.
 *
 * Existing code using:
 *
 *   import { db } from "@/db/client";
 *
 * can continue working.
 *
 * The proxy always forwards calls to the CURRENT Drizzle instance,
 * including after resetDbConnection() creates a fresh client.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, property) {
    return Reflect.get(getDb(), property);
  },
});