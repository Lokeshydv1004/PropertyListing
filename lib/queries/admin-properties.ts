import "server-only";

import { and, asc, desc, eq, ne, or, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { buildings, properties } from "@/db/schema";
import { withDbRetry } from "@/lib/with-db-retry";
import {
  PROPERTIES_PAGE_SIZE,
  type AdminPropertyFilters,
} from "@/lib/admin/properties-filters";

/**
 * The console's reads.
 *
 * Deliberately a separate file from lib/queries/properties.ts, which is the
 * public site's and filters `is_published` on every query. Keeping the two
 * apart means neither can be "fixed" into the other's behaviour by accident:
 * nothing here is reachable without `requireAdmin()`, and nothing there ever
 * returns a draft.
 */

function whereFor(filters: AdminPropertyFilters) {
  const clauses = [];

  if (filters.listingType) {
    clauses.push(sql`${properties.listingType} = ${filters.listingType}`);
  }
  if (filters.category) {
    clauses.push(sql`${properties.category} = ${filters.category}`);
  }
  if (filters.status) {
    clauses.push(sql`${properties.status} = ${filters.status}`);
  }
  if (filters.city) clauses.push(eq(properties.city, filters.city));
  if (filters.building) clauses.push(eq(properties.buildingId, filters.building));

  if (filters.published === "yes") clauses.push(eq(properties.isPublished, true));
  if (filters.published === "no") clauses.push(eq(properties.isPublished, false));
  if (filters.featured === "yes") clauses.push(eq(properties.isFeatured, true));

  if (filters.q) {
    const term = `%${filters.q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    clauses.push(
      or(
        sql`${properties.title} ilike ${term}`,
        sql`${properties.slug} ilike ${term}`,
        sql`${properties.location} ilike ${term}`,
        sql`coalesce(${properties.unitNumber}, '') ilike ${term}`
      )!
    );
  }

  return clauses.length ? and(...clauses) : undefined;
}

export async function listAdminProperties(filters: AdminPropertyFilters) {
  const offset = (filters.page - 1) * PROPERTIES_PAGE_SIZE;

  const rows = await withDbRetry(() =>
    db
      .select({
        id: properties.id,
        title: properties.title,
        slug: properties.slug,
        listingType: properties.listingType,
        category: properties.category,
        status: properties.status,
        city: properties.city,
        unitNumber: properties.unitNumber,
        images: properties.images,
        isFeatured: properties.isFeatured,
        isPublished: properties.isPublished,
        fundingTarget: properties.fundingTarget,
        amountRaised: properties.amountRaised,
        investorCount: properties.investorCount,
        salePrice: properties.salePrice,
        monthlyRent: properties.monthlyRent,
        minInvestment: properties.minInvestment,
        updatedAt: properties.updatedAt,
        buildingName: buildings.name,
      })
      .from(properties)
      .leftJoin(buildings, eq(properties.buildingId, buildings.id))
      .where(whereFor(filters))
      // Drafts first: they are the ones with work outstanding. Within each
      // group, most recently touched first.
      .orderBy(
        asc(properties.isPublished),
        desc(properties.updatedAt),
        asc(properties.id)
      )
      .limit(PROPERTIES_PAGE_SIZE + 1)
      .offset(offset)
  );

  return {
    rows: rows.slice(0, PROPERTIES_PAGE_SIZE),
    hasNext: rows.length > PROPERTIES_PAGE_SIZE,
  };
}

export async function getAdminPropertyCounts() {
  const [row] = await withDbRetry(() =>
    db
      .select({
        total: sql<number>`count(*)`,
        published: sql<number>`count(*) filter (where ${properties.isPublished})`,
        drafts: sql<number>`count(*) filter (where not ${properties.isPublished})`,
        featured: sql<number>`count(*) filter (where ${properties.isFeatured})`,
      })
      .from(properties)
  );

  return {
    total: Number(row?.total ?? 0),
    published: Number(row?.published ?? 0),
    drafts: Number(row?.drafts ?? 0),
    featured: Number(row?.featured ?? 0),
  };
}

export async function getPropertyFilterChoices() {
  const [cities, buildingRows] = await Promise.all([
    withDbRetry(() =>
      db
        .selectDistinct({ city: properties.city })
        .from(properties)
        .where(sql`${properties.city} <> ''`)
        .orderBy(asc(properties.city))
    ),
    withDbRetry(() =>
      db
        .select({ id: buildings.id, name: buildings.name, slug: buildings.slug })
        .from(buildings)
        .orderBy(asc(buildings.name))
    ),
  ]);

  return {
    cities: cities.map((row) => row.city).filter(Boolean),
    buildings: buildingRows,
  };
}

/** The whole row, for the edit form. Drafts included — that is the point. */
export async function getPropertyForEdit(id: string) {
  const [row] = await withDbRetry(() =>
    db.select().from(properties).where(eq(properties.id, id)).limit(1)
  );

  return row ?? null;
}

export async function getPropertyByIdOrSlug(idOrSlug: string) {
  const [row] = await withDbRetry(() =>
    db
      .select()
      .from(properties)
      .where(
        /^[0-9a-f-]{36}$/i.test(idOrSlug)
          ? eq(properties.id, idOrSlug)
          : eq(properties.slug, idOrSlug)
      )
      .limit(1)
  );

  return row ?? null;
}

/**
 * Is this slug free?
 *
 * `slug` is unique and it is the public URL, so a collision is a failed save
 * at best and a 500 at worst. The form checks as you type; the action checks
 * again before writing, because the gap between the two is enough for a
 * second person to take it.
 */
export async function isSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const [row] = await withDbRetry(() =>
    db
      .select({ id: properties.id })
      .from(properties)
      .where(
        excludeId
          ? and(eq(properties.slug, slug), ne(properties.id, excludeId))
          : eq(properties.slug, slug)
      )
      .limit(1)
  );

  return !row;
}

/**
 * Existing amenity and tag values, for autocomplete.
 *
 * Without this you end up with "Parking", "parking" and "Car Parking" as
 * three separate filter options on the public site — the same class of bug
 * the category enum was introduced to fix, reintroduced by hand one listing
 * at a time.
 */
export async function getArrayFieldSuggestions() {
  const [row] = await withDbRetry(() =>
    db
      .select({
        amenities: sql<
          string[]
        >`coalesce((select array_agg(distinct value order by value) from ${properties}, unnest(${properties.amenities}) as value), '{}')`,
        tags: sql<
          string[]
        >`coalesce((select array_agg(distinct value order by value) from ${properties}, unnest(${properties.tags}) as value), '{}')`,
      })
      .from(properties)
      .limit(1)
  );

  return {
    amenities: row?.amenities ?? [],
    tags: row?.tags ?? [],
  };
}
