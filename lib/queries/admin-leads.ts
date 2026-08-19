import "server-only";

import { and, asc, desc, eq, gte, isNotNull, isNull, lt, or, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { adminUsers, leadNotes, leads, properties } from "@/db/schema";
import {
  LEADS_PAGE_SIZE,
  type LeadFilters,
} from "@/lib/admin/leads-filters";
import { withDbRetry } from "@/lib/with-db-retry";

/**
 * Every read in this file excludes soft-deleted rows. There is exactly one
 * place that doesn't — nothing, currently — so the omission is the safe
 * default rather than something each caller has to remember.
 */
const notDeleted = isNull(leads.deletedAt);

/** `notify` rows are subscribers, not leads. They live on their own tab. */
const isAlert = eq(leads.source, "notify");

function dateOrNull(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function whereFor(filters: LeadFilters) {
  const clauses = [notDeleted];

  clauses.push(
    filters.tab === "alerts" ? isAlert : sql`${leads.source} is distinct from 'notify'`
  );

  if (filters.status && filters.status !== "all") {
    clauses.push(sql`${leads.status} = ${filters.status}`);
  }

  if (filters.source) clauses.push(eq(leads.source, filters.source));
  if (filters.enquiryType) {
    clauses.push(eq(leads.enquiryType, filters.enquiryType));
  }
  if (filters.city) clauses.push(eq(properties.city, filters.city));

  if (filters.assigned === "unassigned") {
    clauses.push(isNull(leads.assignedTo));
  } else if (filters.assigned) {
    clauses.push(eq(leads.assignedTo, filters.assigned));
  }

  if (filters.hasProperty === "yes") clauses.push(isNotNull(leads.propertyId));
  if (filters.hasProperty === "no") clauses.push(isNull(leads.propertyId));

  const from = dateOrNull(filters.from);
  if (from) clauses.push(gte(leads.createdAt, from));

  const to = dateOrNull(filters.to);
  if (to) {
    // A date input gives midnight; "to 14 March" plainly means the whole of
    // the 14th, so push the bound to the start of the next day.
    const end = new Date(to);
    end.setDate(end.getDate() + 1);
    clauses.push(lt(leads.createdAt, end));
  }

  if (filters.q) {
    const term = `%${filters.q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    clauses.push(
      or(
        sql`${leads.name} ilike ${term}`,
        sql`${leads.phone} ilike ${term}`,
        sql`${leads.email} ilike ${term}`
      )!
    );
  }

  return and(...clauses);
}

export type LeadRow = Awaited<ReturnType<typeof listLeads>>["rows"][number];

export async function listLeads(filters: LeadFilters) {
  const where = whereFor(filters);
  const offset = (filters.page - 1) * LEADS_PAGE_SIZE;

  const rows = await withDbRetry(() =>
    db
      .select({
        id: leads.id,
        name: leads.name,
        phone: leads.phone,
        email: leads.email,
        amountInterested: leads.amountInterested,
        status: leads.status,
        enquiryType: leads.enquiryType,
        source: leads.source,
        createdAt: leads.createdAt,
        contactedAt: leads.contactedAt,
        propertyId: leads.propertyId,
        propertyTitle: properties.title,
        propertySlug: properties.slug,
        propertyCity: properties.city,
        assignedTo: leads.assignedTo,
        assigneeName: adminUsers.name,
        /**
         * How many *other* live enquiries share this phone number.
         *
         * Matched on the last ten digits, not the raw string. The same person
         * writes "+91 96254 23454" on one form and "09625423454" on the next,
         * and an exact comparison treats those as two different people —
         * which is precisely the case this feature exists to catch. Verified
         * against real rows that did exactly that.
         */
        duplicateCount: sql<number>`(
          select count(*) - 1 from ${leads} as dupes
          where right(regexp_replace(dupes.phone, '\D', '', 'g'), 10)
                = right(regexp_replace(${leads.phone}, '\D', '', 'g'), 10)
            and length(regexp_replace(dupes.phone, '\D', '', 'g')) >= 10
            and dupes.deleted_at is null
            and dupes.source is distinct from 'notify'
        )`,
        noteCount: sql<number>`(
          select count(*) from ${leadNotes} where ${leadNotes.leadId} = ${leads.id}
        )`,
      })
      .from(leads)
      .leftJoin(properties, eq(leads.propertyId, properties.id))
      .leftJoin(adminUsers, eq(leads.assignedTo, adminUsers.id))
      .where(where)
      .orderBy(desc(leads.createdAt))
      .limit(LEADS_PAGE_SIZE + 1)
      .offset(offset)
  );

  // One extra row is fetched purely to answer "is there a next page" without
  // a second count query over the same filters.
  const hasNext = rows.length > LEADS_PAGE_SIZE;

  return { rows: rows.slice(0, LEADS_PAGE_SIZE), hasNext };
}

/** Counts for the tabs and the nav badge. One query, not three. */
export async function getLeadCounts() {
  const [row] = await withDbRetry(() =>
    db
      .select({
        newLeads: sql<number>`count(*) filter (
          where ${leads.status} = 'new' and ${leads.source} is distinct from 'notify'
        )`,
        queue: sql<number>`count(*) filter (where ${leads.source} is distinct from 'notify')`,
        alerts: sql<number>`count(*) filter (where ${leads.source} = 'notify')`,
      })
      .from(leads)
      .where(notDeleted)
  );

  return {
    newLeads: Number(row?.newLeads ?? 0),
    queue: Number(row?.queue ?? 0),
    alerts: Number(row?.alerts ?? 0),
  };
}

/** Cities that actually appear on property-linked leads, for the filter. */
export async function getLeadFilterOptions() {
  const [cities, team] = await Promise.all([
    withDbRetry(() =>
      db
        .selectDistinct({ city: properties.city })
        .from(leads)
        .innerJoin(properties, eq(leads.propertyId, properties.id))
        .where(and(notDeleted, sql`${properties.city} <> ''`))
        .orderBy(asc(properties.city))
    ),
    withDbRetry(() =>
      db
        .select({ id: adminUsers.id, name: adminUsers.name })
        .from(adminUsers)
        .where(eq(adminUsers.isActive, true))
        .orderBy(asc(adminUsers.name))
    ),
  ]);

  return {
    cities: cities.map((row) => row.city).filter(Boolean),
    team,
  };
}

export async function getLead(id: string) {
  const [row] = await withDbRetry(() =>
    db
      .select({
        lead: leads,
        propertyTitle: properties.title,
        propertySlug: properties.slug,
        propertyCity: properties.city,
        assigneeName: adminUsers.name,
      })
      .from(leads)
      .leftJoin(properties, eq(leads.propertyId, properties.id))
      .leftJoin(adminUsers, eq(leads.assignedTo, adminUsers.id))
      .where(and(eq(leads.id, id), notDeleted))
      .limit(1)
  );

  return row ?? null;
}

export async function getLeadNotes(leadId: string) {
  return withDbRetry(() =>
    db
      .select()
      .from(leadNotes)
      .where(eq(leadNotes.leadId, leadId))
      .orderBy(desc(leadNotes.createdAt))
  );
}

/**
 * Other enquiries from the same person.
 *
 * Matched on phone, which is the field this audience is consistent about —
 * the same person will use a work email on one form and a personal one on the
 * next, but the number on both is the one they answer.
 */
export async function getRelatedLeads(leadId: string, phone: string) {
  return withDbRetry(() =>
    db
      .select({
        id: leads.id,
        createdAt: leads.createdAt,
        status: leads.status,
        source: leads.source,
        enquiryType: leads.enquiryType,
        propertyTitle: properties.title,
      })
      .from(leads)
      .leftJoin(properties, eq(leads.propertyId, properties.id))
      .where(
        and(
          // Same normalisation as the list's duplicate count — see there.
          sql`right(regexp_replace(${leads.phone}, '\D', '', 'g'), 10)
              = right(regexp_replace(${phone}, '\D', '', 'g'), 10)`,
          sql`${leads.id} <> ${leadId}`,
          notDeleted,
          sql`${leads.source} is distinct from 'notify'`
        )
      )
      .orderBy(desc(leads.createdAt))
      .limit(20)
  );
}
