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

const MAX_CONNECTIONS = Number(process.env.DB_POOL_MAX ?? 1);

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
    idle_timeout: 120,
    connect_timeout: 30,

    // connect_timeout only bounds the TCP handshake. Nothing bounded how
    // long a query could sit waiting on a response after that — so a query
    // the pooler silently dropped or never answered (reproduced repeatedly
    // against the transaction pooler on this project) hung every request
    // behind it forever instead of failing and letting withDbRetry recover.
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

  try {
    await oldClient.end({ timeout: 0 });
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