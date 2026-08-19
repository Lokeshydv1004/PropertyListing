import "server-only";

import { asc, desc, eq, ne, and, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { buildings, properties } from "@/db/schema";
import { withDbRetry } from "@/lib/with-db-retry";

/**
 * Buildings exist so shared facts — address, footfall, anchor tenants — are
 * stored once instead of being retyped onto every shop in the mall. Retyping
 * is how the same building ends up with three different footfall figures.
 */

/**
 * A join and a GROUP BY, deliberately, rather than correlated subqueries.
 *
 * The subquery version silently returned zero for every building. Drizzle
 * only qualifies column names as "table"."column" when the query has a join
 * to disambiguate; without one it emitted
 *
 *   select count(*) from "properties" where "building_id" = "id"
 *
 * where the bare "id" resolves to the *inner* table — so it compared
 * properties.building_id to properties.id, which is never true. The counts
 * were wrong in a way nothing would have flagged: zero is a plausible answer
 * for a building with nothing listed in it yet.
 */
export async function listBuildings() {
  return withDbRetry(() =>
    db
      .select({
        id: buildings.id,
        name: buildings.name,
        slug: buildings.slug,
        buildingType: buildings.buildingType,
        city: buildings.city,
        shortLocation: buildings.shortLocation,
        totalUnits: buildings.totalUnits,
        footfallMonthly: buildings.footfallMonthly,
        images: buildings.images,
        // "3 of 40 listed" is the number that says whether there is work left
        // to do on this building. count(properties.id), not count(*), so a
        // building with no units counts zero rather than one.
        listedUnits: sql<number>`count(${properties.id})`,
        publishedUnits: sql<number>`count(*) filter (where ${properties.isPublished})`,
      })
      .from(buildings)
      .leftJoin(properties, eq(properties.buildingId, buildings.id))
      .groupBy(buildings.id)
      .orderBy(asc(buildings.name))
  );
}

export async function getBuilding(id: string) {
  const [row] = await withDbRetry(() =>
    db.select().from(buildings).where(eq(buildings.id, id)).limit(1)
  );

  return row ?? null;
}

/** Every listing in this building — the units panel on its detail page. */
export async function getBuildingUnits(buildingId: string) {
  return withDbRetry(() =>
    db
      .select({
        id: properties.id,
        title: properties.title,
        slug: properties.slug,
        unitNumber: properties.unitNumber,
        floorLabel: properties.floorLabel,
        listingType: properties.listingType,
        category: properties.category,
        status: properties.status,
        isPublished: properties.isPublished,
        updatedAt: properties.updatedAt,
      })
      .from(properties)
      .where(eq(properties.buildingId, buildingId))
      .orderBy(asc(properties.floorLabel), asc(properties.unitNumber), desc(properties.updatedAt))
  );
}

export async function isBuildingSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const [row] = await withDbRetry(() =>
    db
      .select({ id: buildings.id })
      .from(buildings)
      .where(
        excludeId
          ? and(eq(buildings.slug, slug), ne(buildings.id, excludeId))
          : eq(buildings.slug, slug)
      )
      .limit(1)
  );

  return !row;
}

/** How many listings would lose their parent if this building went away. */
export async function countBuildingUnits(buildingId: string): Promise<number> {
  const [row] = await withDbRetry(() =>
    db
      .select({ total: sql<number>`count(*)` })
      .from(properties)
      .where(eq(properties.buildingId, buildingId))
  );

  return Number(row?.total ?? 0);
}
