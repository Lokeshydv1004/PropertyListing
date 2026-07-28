import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { properties, type Property } from "@/db/schema";

export type PropertySort = "newest" | "most_funded" | "closing_soon";

export type PropertyFilters = {
  location?: string;
  propertyType?: string;
  status?: "fundraising" | "fully_funded" | "closed";
  minValuation?: number;
  maxValuation?: number;
  maxMinInvestment?: number;
  sort?: PropertySort;
};

export async function getProperties(
  filters: PropertyFilters = {}
): Promise<Property[]> {
  const conditions = [
    filters.location ? eq(properties.location, filters.location) : undefined,
    filters.propertyType
      ? eq(properties.propertyType, filters.propertyType)
      : undefined,
    filters.status ? eq(properties.status, filters.status) : undefined,
    filters.minValuation !== undefined
      ? gte(properties.totalValuation, String(filters.minValuation))
      : undefined,
    filters.maxValuation !== undefined
      ? lte(properties.totalValuation, String(filters.maxValuation))
      : undefined,
    filters.maxMinInvestment !== undefined
      ? lte(properties.minInvestment, String(filters.maxMinInvestment))
      : undefined,
  ].filter((condition): condition is NonNullable<typeof condition> =>
    Boolean(condition)
  );

  const orderBy =
    filters.sort === "most_funded"
      ? [
          desc(
            sql`(${properties.amountRaised}::numeric / nullif(${properties.fundingTarget}::numeric, 0))`
          ),
        ]
      : filters.sort === "closing_soon"
        ? [asc(properties.fundingDeadline)]
        : [desc(properties.createdAt)];

  return db
    .select()
    .from(properties)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...orderBy);
}

export async function getOpenPropertiesCount(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(properties)
    .where(eq(properties.status, "fundraising"));

  return row?.count ?? 0;
}

export async function getPropertyFilterOptions() {
  const [locationRows, typeRows] = await Promise.all([
    db
      .selectDistinct({ location: properties.location })
      .from(properties)
      .orderBy(asc(properties.location)),
    db
      .selectDistinct({ propertyType: properties.propertyType })
      .from(properties)
      .orderBy(asc(properties.propertyType)),
  ]);

  return {
    locations: locationRows.map((row) => row.location),
    propertyTypes: typeRows.map((row) => row.propertyType),
  };
}
