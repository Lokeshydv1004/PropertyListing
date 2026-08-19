import { resetDbConnection } from "@/db/client";

/**
 * Executes a database operation once.
 * If it fails, resets the database connection and retries once.
 */
export async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    // console.error("[db] first attempt failed:", error);

    try {
      await resetDbConnection();
    } catch {
      // console.error("[db] failed to reset connection:", resetError);
    }

    // console.log("[db] retrying database operation...");

    return await fn();
  }
}