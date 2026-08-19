import "server-only";

import { and, desc, eq, isNull, lt, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { leads, properties } from "@/db/schema";
import { withDbRetry } from "@/lib/with-db-retry";

/**
 * The overview is operational, not analytical.
 *
 * Everything here is something somebody can act on this morning. Charts of
 * lead volume over time belong in Plausible or GA; rebuilding them here would
 * be a week that buys nothing.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * ISO strings, not Dates.
 *
 * Inside a raw `sql` fragment Drizzle has no column type to infer from and
 * hands the value straight to postgres-js, which rejects a Date for a
 * timestamptz parameter. The typed helpers below (gte, lt) do know the column
 * and serialise it themselves.
 */
export function startOfTodayIST(): string {
  const nowIST = new Date(Date.now() + IST_OFFSET_MS);
  const midnight = Date.UTC(
    nowIST.getUTCFullYear(),
    nowIST.getUTCMonth(),
    nowIST.getUTCDate()
  );
  return new Date(midnight - IST_OFFSET_MS).toISOString();
}

export function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export async function getOverviewStats() {
  const [leadStats] = await withDbRetry(() =>
    db
      .select({
        newLeads: sql<number>`count(*) filter (
          where ${leads.status} = 'new'
            and ${leads.source} is distinct from 'notify'
        )`,
        today: sql<number>`count(*) filter (where ${leads.createdAt} >= ${startOfTodayIST()})`,
        week: sql<number>`count(*) filter (where ${leads.createdAt} >= ${daysAgoISO(7)})`,
      })
      .from(leads)
      .where(isNull(leads.deletedAt))
  );

  const [listingStats] = await withDbRetry(() =>
    db
      .select({
        live: sql<number>`count(*) filter (where ${properties.isPublished})`,
        drafts: sql<number>`count(*) filter (where not ${properties.isPublished})`,
        featured: sql<number>`count(*) filter (where ${properties.isFeatured})`,
      })
      .from(properties)
  );

  return {
    newLeads: Number(leadStats?.newLeads ?? 0),
    today: Number(leadStats?.today ?? 0),
    week: Number(leadStats?.week ?? 0),
    live: Number(listingStats?.live ?? 0),
    drafts: Number(listingStats?.drafts ?? 0),
    featured: Number(listingStats?.featured ?? 0),
  };
}

/** Where leads came from over the last week, for the source breakdown. */
export async function getLeadSourceBreakdown() {
  const rows = await withDbRetry(() =>
    db
      .select({
        source: leads.source,
        total: sql<number>`count(*)`,
      })
      .from(leads)
      .where(
        and(isNull(leads.deletedAt), sql`${leads.createdAt} >= ${daysAgoISO(7)}`)
      )
      .groupBy(leads.source)
      .orderBy(desc(sql`count(*)`))
  );

  return rows.map((row) => ({
    source: row.source ?? "unknown",
    total: Number(row.total),
  }));
}

export type AttentionItem = {
  kind: string;
  title: string;
  detail: string;
  href: string;
  count: number;
};

/**
 * A list, not a chart.
 *
 * Each entry is a specific thing that is wrong and a link to the place it is
 * fixed. Anything that cannot be acted on does not belong here.
 */
export async function getNeedsAttention(): Promise<AttentionItem[]> {
  const items: AttentionItem[] = [];

  /**
   * Two queries, not seven.
   *
   * Every check below except the stale-lead one reads the same `properties`
   * table, and they used to be six separate round trips. `DB_POOL_MAX` is 1 —
   * deliberately, see db/client.ts — so `Promise.all` cannot actually run them
   * in parallel; they queue on the single connection at roughly 130ms each.
   * Six became one with conditional aggregates, which is ~650ms off every
   * load of this page.
   *
   * The two that remain hit different tables, so they genuinely are two.
   */
  const [stale] = await withDbRetry(() =>
    db
      .select({ total: sql<number>`count(*)` })
      .from(leads)
      .where(
        and(
          isNull(leads.deletedAt),
          eq(leads.status, "new"),
          lt(leads.createdAt, new Date(Date.now() - 48 * 60 * 60 * 1000)),
          sql`${leads.source} is distinct from 'notify'`
        )
      )
  );

  if (Number(stale?.total ?? 0) > 0) {
    items.push({
      kind: "leads",
      title: `${stale.total} leads older than 48 hours, still unworked`,
      detail: "Somebody asked about a property two days ago and hasn't heard back.",
      href: "/admin/leads?status=new",
      count: Number(stale.total),
    });
  }

  /**
   * All five property checks in one pass.
   *
   * `array_agg(...) filter (...)` collects the titles for the checks that
   * name them, capped at ten so a catalogue-wide problem does not put four
   * hundred titles into one sentence.
   */
  const [listings] = await withDbRetry(() =>
    db
      .select({
        closingCount: sql<number>`count(*) filter (
          where ${properties.status} = 'fundraising'
            and ${properties.isPublished}
            and ${properties.fundingDeadline} is not null
            and ${properties.fundingDeadline} <= current_date + 30
        )`,
        closingTitles: sql<string[]>`coalesce((array_agg(${properties.title}) filter (
          where ${properties.status} = 'fundraising'
            and ${properties.isPublished}
            and ${properties.fundingDeadline} is not null
            and ${properties.fundingDeadline} <= current_date + 30
        ))[1:10], '{}')`,

        overfundedCount: sql<number>`count(*) filter (
          where ${properties.status} = 'fundraising'
            and ${properties.fundingTarget} is not null
            and ${properties.amountRaised}::numeric >= ${properties.fundingTarget}::numeric
        )`,
        overfundedTitles: sql<string[]>`coalesce((array_agg(${properties.title}) filter (
          where ${properties.status} = 'fundraising'
            and ${properties.fundingTarget} is not null
            and ${properties.amountRaised}::numeric >= ${properties.fundingTarget}::numeric
        ))[1:10], '{}')`,

        noImagesCount: sql<number>`count(*) filter (
          where ${properties.isPublished}
            and coalesce(array_length(${properties.images}, 1), 0) = 0
        )`,

        expiredLeaseCount: sql<number>`count(*) filter (
          where ${properties.isPublished}
            and ${properties.leaseEndDate} is not null
            and ${properties.leaseEndDate} < current_date
        )`,
        expiredLeaseTitles: sql<string[]>`coalesce((array_agg(${properties.title}) filter (
          where ${properties.isPublished}
            and ${properties.leaseEndDate} is not null
            and ${properties.leaseEndDate} < current_date
        ))[1:10], '{}')`,

        featuredCount: sql<number>`count(*) filter (
          where ${properties.isFeatured} and ${properties.isPublished}
        )`,
      })
      .from(properties)
  );

  const closingCount = Number(listings?.closingCount ?? 0);
  if (closingCount > 0) {
    items.push({
      kind: "closing",
      title: `${closingCount} raise${closingCount === 1 ? "" : "s"} closing within 30 days`,
      detail: (listings.closingTitles ?? []).join(", "),
      href: "/admin/properties?type=fractional&status=fundraising",
      count: closingCount,
    });
  }

  const overfundedCount = Number(listings?.overfundedCount ?? 0);
  if (overfundedCount > 0) {
    items.push({
      kind: "overfunded",
      title: `${overfundedCount} listing${overfundedCount === 1 ? " has" : "s have"} hit the funding target but still say “fundraising”`,
      detail: (listings.overfundedTitles ?? []).join(", "),
      href: "/admin/properties?type=fractional&status=fundraising",
      count: overfundedCount,
    });
  }

  const noImagesCount = Number(listings?.noImagesCount ?? 0);
  if (noImagesCount > 0) {
    items.push({
      kind: "images",
      title: `${noImagesCount} live listing${noImagesCount === 1 ? "" : "s"} with no photographs`,
      detail: "A listing with no images converts close to nobody.",
      href: "/admin/properties?published=yes",
      count: noImagesCount,
    });
  }

  const expiredCount = Number(listings?.expiredLeaseCount ?? 0);
  if (expiredCount > 0) {
    items.push({
      kind: "lease",
      title: `${expiredCount} live listing${expiredCount === 1 ? "" : "s"} showing a lease that has already ended`,
      detail: (listings.expiredLeaseTitles ?? []).join(", "),
      href: "/admin/properties?published=yes",
      count: expiredCount,
    });
  }

  // getFeaturedProperties() returns three. Anything beyond that is flagged
  // and invisible, which reads as a bug to whoever ticked the box.
  const featuredCount = Number(listings?.featuredCount ?? 0);
  if (featuredCount > 3) {
    items.push({
      kind: "featured",
      title: `${featuredCount} listings are featured, but the home page shows three`,
      detail: "The rest are flagged and never appear.",
      href: "/admin/properties?featured=yes",
      count: featuredCount,
    });
  }

  return items;
}
