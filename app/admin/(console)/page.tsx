import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { ActivityList } from "@/components/admin/activity-list";
import { requireAdminPage } from "@/lib/auth/admin";
import { labelForSource } from "@/lib/admin/leads-filters";
import { listActivity } from "@/lib/queries/admin-activity";
import {
  getLeadSourceBreakdown,
  getNeedsAttention,
  getOverviewStats,
} from "@/lib/queries/admin-overview";

// Counts must reflect what the team is looking at right now — a lead that
// came in two minutes ago is the whole point of this page.
export const dynamic = "force-dynamic";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function greeting(): string {
  const hour = new Date(Date.now() + IST_OFFSET_MS).getUTCHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AdminOverviewPage() {
  const admin = await requireAdminPage();

  const [stats, attention, sources, activity] = await Promise.all([
    getOverviewStats(),
    getNeedsAttention(),
    getLeadSourceBreakdown(),
    listActivity({ actor: "", entityType: "", action: "", page: 1 }),
  ]);

  const tiles = [
    { label: "New leads today", value: stats.today, href: "/admin/leads?status=all" },
    { label: "New leads this week", value: stats.week, href: "/admin/leads?status=all" },
    { label: "Unworked leads", value: stats.newLeads, href: "/admin/leads" },
    { label: "Live listings", value: stats.live, href: "/admin/properties?published=yes" },
    { label: "Drafts", value: stats.drafts, href: "/admin/properties?published=no" },
  ];

  const busiest = Math.max(1, ...sources.map((source) => source.total));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-navy">
          {greeting()}, {admin.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {stats.newLeads === 0
            ? "Nothing is waiting. The queue is clear."
            : `${stats.newLeads} lead${stats.newLeads === 1 ? "" : "s"} waiting to be worked.`}
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <li key={tile.label}>
            <Link
              href={tile.href}
              className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand-green"
            >
              <span className="block text-2xl font-semibold text-navy tabular-nums">
                {tile.value}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {tile.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/*
        A list of specific things that are wrong, each linking to where it is
        fixed. Not a chart: a chart tells you something changed, this tells
        you what to do about it.
      */}
      <section>
        <h2 className="font-medium text-navy">Needs attention</h2>

        {attention.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nothing to flag. No stale leads, no raises past their deadline, no
            live listing missing its photographs.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {attention.map((item) => (
              <li key={item.kind}>
                <Link
                  href={item.href}
                  className="flex items-start gap-3 rounded-xl border border-gold/50 bg-gold-light/50 p-3 transition-colors hover:border-gold"
                >
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-gold-700"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-navy">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-medium text-navy">
          Where leads came from, last 7 days
        </h2>

        {sources.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No leads in the last week.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {sources.map((source) => (
              <li key={source.source} className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-sm text-muted-foreground">
                  {labelForSource(source.source)}
                </span>
                <span className="h-4 flex-1 overflow-hidden rounded bg-muted">
                  <span
                    className="block h-full rounded bg-brand-green"
                    style={{ width: `${(source.total / busiest) * 100}%` }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right text-sm tabular-nums text-navy">
                  {source.total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-navy">Recent activity</h2>
          <Link
            href="/admin/activity"
            className="text-sm text-muted-foreground hover:text-navy"
          >
            All activity →
          </Link>
        </div>

        <div className="mt-2">
          <ActivityList
            entries={activity.rows.slice(0, 10).map((row) => ({
              id: row.id,
              actorEmail: row.actorEmail,
              actorName: row.actorName,
              action: row.action,
              entityType: row.entityType,
              entityId: row.entityId,
              entityLabel: row.entityLabel,
              changedFields: row.changedFields,
              createdAt: row.createdAt.toISOString(),
            }))}
          />
        </div>
      </section>
    </div>
  );
}
