import "server-only";

import { and, desc, eq, sql, type SQL } from "drizzle-orm";

import { db } from "@/db/client";
import { adminActivity, adminUsers } from "@/db/schema";
import { withDbRetry } from "@/lib/with-db-retry";

export const ACTIVITY_PAGE_SIZE = 60;

export type ActivityFilters = {
  actor: string;
  entityType: string;
  action: string;
  page: number;
};

export function parseActivityFilters(
  params: Record<string, string | string[] | undefined>
): ActivityFilters {
  const one = (value: string | string[] | undefined) =>
    Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

  return {
    actor: one(params.actor),
    entityType: one(params.entity),
    action: one(params.action),
    page: Math.max(1, Number(one(params.page)) || 1),
  };
}

export function activityFiltersToQuery(
  filters: ActivityFilters,
  overrides: Partial<ActivityFilters> = {}
): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (merged.actor) params.set("actor", merged.actor);
  if (merged.entityType) params.set("entity", merged.entityType);
  if (merged.action) params.set("action", merged.action);
  if (merged.page > 1) params.set("page", String(merged.page));

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listActivity(filters: ActivityFilters) {
  const clauses: SQL[] = [];

  if (filters.actor) clauses.push(eq(adminActivity.actorId, filters.actor));
  if (filters.entityType) {
    clauses.push(eq(adminActivity.entityType, filters.entityType));
  }
  if (filters.action) clauses.push(eq(adminActivity.action, filters.action));

  const rows = await withDbRetry(() =>
    db
      .select({
        id: adminActivity.id,
        actorId: adminActivity.actorId,
        actorEmail: adminActivity.actorEmail,
        actorName: adminUsers.name,
        action: adminActivity.action,
        entityType: adminActivity.entityType,
        entityId: adminActivity.entityId,
        entityLabel: adminActivity.entityLabel,
        changedFields: adminActivity.changedFields,
        createdAt: adminActivity.createdAt,
      })
      .from(adminActivity)
      .leftJoin(adminUsers, eq(adminActivity.actorId, adminUsers.id))
      .where(clauses.length ? and(...clauses) : undefined)
      .orderBy(desc(adminActivity.createdAt))
      .limit(ACTIVITY_PAGE_SIZE + 1)
      .offset((filters.page - 1) * ACTIVITY_PAGE_SIZE)
  );

  return {
    rows: rows.slice(0, ACTIVITY_PAGE_SIZE),
    hasNext: rows.length > ACTIVITY_PAGE_SIZE,
  };
}

/** The History tab on a single property or lead. */
export async function getEntityActivity(entityType: string, entityId: string) {
  return withDbRetry(() =>
    db
      .select({
        id: adminActivity.id,
        actorEmail: adminActivity.actorEmail,
        actorName: adminUsers.name,
        action: adminActivity.action,
        changedFields: adminActivity.changedFields,
        createdAt: adminActivity.createdAt,
      })
      .from(adminActivity)
      .leftJoin(adminUsers, eq(adminActivity.actorId, adminUsers.id))
      .where(
        and(
          eq(adminActivity.entityType, entityType),
          eq(adminActivity.entityId, entityId)
        )
      )
      .orderBy(desc(adminActivity.createdAt))
      .limit(50)
  );
}

/** Who has ever done anything, for the actor filter. */
export async function getActivityActors() {
  return withDbRetry(() =>
    db
      .selectDistinct({
        id: adminActivity.actorId,
        email: adminActivity.actorEmail,
        name: adminUsers.name,
      })
      .from(adminActivity)
      .leftJoin(adminUsers, eq(adminActivity.actorId, adminUsers.id))
      .where(sql`${adminActivity.actorId} is not null`)
  );
}
