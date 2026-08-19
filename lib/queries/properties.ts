import { and, asc, desc, eq, gte, inArray, lte, ne, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  buildings,
  properties,
  type Building,
  type ListingStatus,
  type ListingType,
  type Property,
  type PropertyCategory,
} from "@/db/schema";

export type PropertySort =
  | "newest"
  | "most_funded"
  | "closing_soon"
  | "price_low"
  | "price_high";

export type PropertyFilters = {
  listingType?: ListingType;
  category?: PropertyCategory;
  city?: string;
  location?: string;
  status?: ListingStatus;
  /** Fractional: valuation bounds. Sale: asking-price bounds. */
  minPrice?: number;
  maxPrice?: number;
  /** Fractional only — cap on the minimum ticket. */
  maxMinInvestment?: number;
  /** Rent only — cap on monthly rent. */
  maxMonthlyRent?: number;
  /** Retail — minimum monthly footfall, unit's own or its building's. */
  minFootfall?: number;
  /** F&B — only units with kitchen provisioning. */
  kitchenOnly?: boolean;
  sort?: PropertySort;
  search?: string;
};

export type PropertyPage = {
  page?: number;
  pageSize?: number;
};

/** A listing together with its parent mall/building, when it has one. */
export type PropertyWithBuilding = Property & { building: Building | null };

function buildConditions(filters: PropertyFilters) {
  return [
    filters.listingType
      ? eq(properties.listingType, filters.listingType)
      : undefined,
    filters.category ? eq(properties.category, filters.category) : undefined,
    filters.city ? eq(properties.city, filters.city) : undefined,
    filters.location ? eq(properties.location, filters.location) : undefined,
    filters.status ? eq(properties.status, filters.status) : undefined,

    // Price bounds apply to whichever column prices this listing type, so a
    // single "budget" control works across all three modes.
    filters.minPrice !== undefined
      ? sql`coalesce(${properties.salePrice}, ${properties.totalValuation}, ${properties.monthlyRent}) >= ${filters.minPrice}`
      : undefined,
    filters.maxPrice !== undefined
      ? sql`coalesce(${properties.salePrice}, ${properties.totalValuation}, ${properties.monthlyRent}) <= ${filters.maxPrice}`
      : undefined,

    filters.maxMinInvestment !== undefined
      ? lte(properties.minInvestment, String(filters.maxMinInvestment))
      : undefined,
    filters.maxMonthlyRent !== undefined
      ? lte(properties.monthlyRent, String(filters.maxMonthlyRent))
      : undefined,

    // Fall back to the parent building's footfall when the unit has none.
    filters.minFootfall !== undefined
      ? sql`coalesce(${properties.footfallMonthly}, (
            select b.footfall_monthly from buildings b where b.id = ${properties.buildingId}
          ), 0) >= ${filters.minFootfall}`
      : undefined,

    filters.kitchenOnly ? eq(properties.hasKitchenProvision, true) : undefined,

    filters.search
      ? sql`(${properties.title} ilike ${`%${filters.search}%`}
             or ${properties.location} ilike ${`%${filters.search}%`}
             or ${properties.city} ilike ${`%${filters.search}%`}
             or coalesce(${properties.unitNumber}, '') ilike ${`%${filters.search}%`})`
      : undefined,
  ].filter((condition): condition is NonNullable<typeof condition> =>
    Boolean(condition)
  );
}

/**
 * Ordering always ends in a unique tiebreaker.
 *
 * Without it, OFFSET pagination is unstable: the seed wrote 13 rows with an
 * identical created_at, Postgres is free to return tied rows in any order
 * between queries, and the listing showed duplicates while silently skipping
 * other properties entirely.
 */
function buildOrderBy(sort: PropertySort | undefined) {
  const priceExpr = sql`coalesce(${properties.salePrice}, ${properties.monthlyRent}, ${properties.minInvestment}, ${properties.totalValuation})`;

  switch (sort) {
    case "most_funded":
      return [
        desc(
          sql`(${properties.amountRaised}::numeric / nullif(${properties.fundingTarget}::numeric, 0))`
        ),
        asc(properties.id),
      ];
    case "closing_soon":
      return [asc(properties.fundingDeadline), asc(properties.id)];
    case "price_low":
      return [asc(priceExpr), asc(properties.id)];
    case "price_high":
      return [desc(priceExpr), asc(properties.id)];
    default:
      return [desc(properties.createdAt), asc(properties.id)];
  }
}

export async function getProperties(
  filters: PropertyFilters = {},
  page: PropertyPage = {}
): Promise<Property[]> {
  const conditions = buildConditions(filters);
  const pageSize = page.pageSize ?? 6;
  const pageNumber = page.page ?? 1;

  return db
    .select()
    .from(properties)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...buildOrderBy(filters.sort))
    .limit(pageSize)
    .offset((pageNumber - 1) * pageSize);
}

export async function getPropertiesCount(
  filters: PropertyFilters = {}
): Promise<number> {
  const conditions = buildConditions(filters);

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(properties)
    .where(conditions.length ? and(...conditions) : undefined);

  return row?.count ?? 0;
}

export async function getPropertyBySlug(
  slug: string
): Promise<PropertyWithBuilding | undefined> {
  const [row] = await db
    .select({ property: properties, building: buildings })
    .from(properties)
    .leftJoin(buildings, eq(properties.buildingId, buildings.id))
    .where(eq(properties.slug, slug))
    .limit(1);

  if (!row) return undefined;
  return { ...row.property, building: row.building };
}

/**
 * Related listings for the detail page.
 *
 * Prefers other units in the same building (the strongest match for a mall
 * shop), then the same city and listing type, then anything else open. The
 * previous version matched on the full `location` string — "Bandra West,
 * Mumbai" — which is unique per property, so it returned nothing and the
 * section never rendered at all.
 */
export async function getSimilarProperties(
  property: Property,
  limit = 3
): Promise<Property[]> {
  const collected: Property[] = [];
  const seen = new Set<string>([property.id]);

  const push = (rows: Property[]) => {
    for (const row of rows) {
      if (collected.length >= limit) return;
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      collected.push(row);
    }
  };

  if (property.buildingId) {
    push(
      await db
        .select()
        .from(properties)
        .where(
          and(
            eq(properties.buildingId, property.buildingId),
            ne(properties.id, property.id)
          )
        )
        .orderBy(asc(properties.unitNumber), asc(properties.id))
        .limit(limit)
    );
  }

  if (collected.length < limit) {
    push(
      await db
        .select()
        .from(properties)
        .where(
          and(
            eq(properties.city, property.city),
            eq(properties.listingType, property.listingType),
            ne(properties.id, property.id)
          )
        )
        .orderBy(desc(properties.createdAt), asc(properties.id))
        .limit(limit)
    );
  }

  if (collected.length < limit) {
    push(
      await db
        .select()
        .from(properties)
        .where(
          and(
            eq(properties.listingType, property.listingType),
            ne(properties.id, property.id)
          )
        )
        .orderBy(desc(properties.createdAt), asc(properties.id))
        .limit(limit + 3)
    );
  }

  return collected.slice(0, limit);
}

export async function getFeaturedProperties(limit = 3): Promise<Property[]> {
  return db
    .select()
    .from(properties)
    .where(eq(properties.status, "fundraising"))
    .orderBy(
      desc(
        sql`(${properties.amountRaised}::numeric / nullif(${properties.fundingTarget}::numeric, 0))`
      ),
      asc(properties.id)
    )
    .limit(limit);
}

export async function getPlatformStats() {
  const [row] = await db
    .select({
      propertyCount: sql<number>`count(*)::int`,
      fundedCount: sql<number>`count(*) filter (where ${properties.status} = 'fully_funded')::int`,
      openCount: sql<number>`count(*) filter (where ${properties.status} in ('fundraising', 'available'))::int`,
      totalRaised: sql<string>`coalesce(sum(${properties.amountRaised}), 0)`,
      avgYield: sql<string>`coalesce(avg(${properties.estAnnualYield}), 0)`,
      cityCount: sql<number>`count(distinct ${properties.city})::int`,
    })
    .from(properties);

  return {
    propertyCount: row?.propertyCount ?? 0,
    fundedCount: row?.fundedCount ?? 0,
    openCount: row?.openCount ?? 0,
    totalRaised: Number(row?.totalRaised ?? 0),
    avgYield: Number(row?.avgYield ?? 0),
    cityCount: row?.cityCount ?? 0,
  };
}

/**
 * The cheapest way in that we can actually honour right now.
 *
 * Used instead of typing "₹1 Lakh" into the hero — a hardcoded figure drifts
 * away from the real inventory the moment listings change, and the site was
 * previously advertising a ticket 33% below its cheapest live property.
 */
export async function getMinTicket(): Promise<number | null> {
  const [row] = await db
    .select({ min: sql<string | null>`min(${properties.minInvestment})` })
    .from(properties)
    .where(
      and(
        eq(properties.listingType, "fractional"),
        eq(properties.status, "fundraising")
      )
    );

  return row?.min ? Number(row.min) : null;
}

/** Distinct values actually present in the catalogue, for the filter bar. */
export async function getPropertyFilterOptions() {
  const [cityRows, categoryRows, listingTypeRows] = await Promise.all([
    db
      .selectDistinct({ city: properties.city })
      .from(properties)
      .orderBy(asc(properties.city)),
    db
      .selectDistinct({ category: properties.category })
      .from(properties)
      .orderBy(asc(properties.category)),
    db
      .selectDistinct({ listingType: properties.listingType })
      .from(properties)
      .orderBy(asc(properties.listingType)),
  ]);

  return {
    cities: cityRows.map((row) => row.city).filter(Boolean),
    categories: categoryRows.map((row) => row.category),
    listingTypes: listingTypeRows.map((row) => row.listingType),
  };
}

/** How many listings sit under each listing type, for the mode tabs. */
export async function getListingTypeCounts(): Promise<
  Record<ListingType, number>
> {
  const rows = await db
    .select({
      listingType: properties.listingType,
      count: sql<number>`count(*)::int`,
    })
    .from(properties)
    .groupBy(properties.listingType);

  const counts: Record<ListingType, number> = {
    fractional: 0,
    sale: 0,
    rent: 0,
  };
  for (const row of rows) counts[row.listingType] = row.count;
  return counts;
}

// ---------------------------------------------------------------------------
// Buildings
// ---------------------------------------------------------------------------

export async function getBuildingBySlug(
  slug: string
): Promise<Building | undefined> {
  const [building] = await db
    .select()
    .from(buildings)
    .where(eq(buildings.slug, slug))
    .limit(1);

  return building;
}

export async function getUnitsInBuilding(
  buildingId: string
): Promise<Property[]> {
  return db
    .select()
    .from(properties)
    .where(eq(properties.buildingId, buildingId))
    .orderBy(asc(properties.floorLabel), asc(properties.unitNumber));
}

export async function getBuildingsByIds(
  ids: string[]
): Promise<Map<string, Building>> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .select()
    .from(buildings)
    .where(inArray(buildings.id, ids));
  return new Map(rows.map((row) => [row.id, row]));
}
