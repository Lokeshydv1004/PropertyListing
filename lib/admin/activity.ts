import "server-only";

import { db } from "@/db/client";
import { withDbRetry } from "@/lib/with-db-retry";
import {
  adminActivity,
  type AdminAction,
  type AdminUser,
} from "@/db/schema";

/**
 * Writes one line to the audit log.
 *
 * Deliberately swallows its own failures. Losing a log entry is a nuisance;
 * failing the archive of a listing because the log insert timed out is a
 * bug the team feels immediately. Same reasoning as `notifyTeam` in
 * lib/notify.ts.
 */
export async function logActivity(input: {
  actor: AdminUser;
  action: AdminAction;
  entityType: "property" | "lead" | "building" | "admin_user";
  entityId?: string | null;
  /** Title, name — whatever makes the entry readable after the row is gone. */
  entityLabel?: string | null;
  changedFields?: Record<string, { from: unknown; to: unknown }> | null;
}): Promise<void> {
  // Bounded like every other query on the admin path. An audit-log write is
  // the least important thing in any request that makes one, and it must
  // never be the reason a mutation hangs until the function is killed.
  try {
    await withDbRetry(() =>
      db.insert(adminActivity).values({
        actorId: input.actor.id,
        actorEmail: input.actor.email,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        entityLabel: input.entityLabel ?? null,
        changedFields: input.changedFields ?? null,
      })
    );
  } catch {
    // console.error("[admin] failed to write activity log", error);
  }
}

/**
 * Reduces a before/after pair to only the fields that actually moved.
 *
 * Storing the whole row on every save makes the log unreadable — the
 * question is always "what changed", and an entry listing sixty unchanged
 * columns answers it worse than no entry at all.
 */
export function diffFields<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>
): Record<string, { from: unknown; to: unknown }> | null {
  const changed: Record<string, { from: unknown; to: unknown }> = {};

  for (const [key, next] of Object.entries(after)) {
    const previous = before[key];
    if (equal(previous, next)) continue;
    changed[key] = { from: previous ?? null, to: next ?? null };
  }

  return Object.keys(changed).length > 0 ? changed : null;
}

/**
 * Array columns (`amenities`, `tags`, `images`) are compared by contents,
 * not identity — a fresh array of the same strings is not a change, and
 * treating it as one fills the log with noise on every save.
 */
function equal(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null && b == null) return true;

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => equal(item, b[i]));
  }

  // Dates and numerics arriving as strings from postgres-js both compare
  // correctly once stringified.
  if (a instanceof Date || b instanceof Date) {
    return String(a) === String(b);
  }

  return false;
}
