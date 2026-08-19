import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const globalForDb = globalThis as unknown as {
  postgresClient: ReturnType<typeof postgres> | undefined;
};

/**
 * Keep the pool small.
 *
 * `next build` prerenders with one worker per core — 13 on this machine — and
 * each worker instantiates its own module scope, so a `max: 10` pool meant up
 * to 130 concurrent connections against Supabase's transaction pooler. The
 * pooler queued them and statements were cancelled with a statement timeout,
 * failing the build on a query that takes under 400 ms on its own.
 *
 * Serverless request handlers are similarly better served by a small pool per
 * instance than a large one.
 */
const MAX_CONNECTIONS = Number(process.env.DB_POOL_MAX ?? 3);

const client =
  globalForDb.postgresClient ??
  postgres(connectionString, {
    prepare: false, // required by Supabase's transaction pooler
    // max: MAX_CONNECTIONS,
    idle_timeout: 20,
    connect_timeout: 30,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresClient = client;
}

export const db = drizzle(client, { schema });
