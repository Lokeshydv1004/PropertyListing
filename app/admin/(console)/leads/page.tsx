import type { Metadata } from "next";
import Link from "next/link";

import { ExportMenu } from "@/components/admin/leads/export-menu";
import { LeadsFilterBar } from "@/components/admin/leads/leads-filters";
import { LeadsTable } from "@/components/admin/leads/leads-table";
import { cn } from "@/lib/utils";
import {
  LEADS_PAGE_SIZE,
  hasActiveFilters,
  leadFiltersToQuery,
  parseLeadFilters,
} from "@/lib/admin/leads-filters";
import {
  getLeadCounts,
  getLeadFilterOptions,
  listLeads,
} from "@/lib/queries/admin-leads";

export const metadata: Metadata = { title: "Leads" };

// A queue is worthless cached. Every load must show what arrived a minute ago.
export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseLeadFilters(params);

  const [{ rows, hasNext }, counts, options] = await Promise.all([
    listLeads(filters),
    getLeadCounts(),
    getLeadFilterOptions(),
  ]);

  const showing = hasActiveFilters(filters);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy">Leads</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {filters.tab === "alerts"
              ? "People who asked to be told when new properties list. Not a call list."
              : filters.status === "new"
                ? "Newest first, still unworked."
                : "Newest first."}
          </p>
        </div>

        <ExportMenu query={leadFiltersToQuery(filters)} />
      </div>

      {/*
        `notify` rows are separated rather than filtered out. They are real
        people who asked for something, but they have no phone number and no
        enquiry — leaving them in the queue means every call list is padded
        with rows nobody can action.
      */}
      <div className="flex gap-1 border-b border-border">
        <Tab
          href="/admin/leads"
          label="Queue"
          count={counts.newLeads}
          active={filters.tab === "queue"}
        />
        <Tab
          href="/admin/leads?tab=alerts"
          label="Alert subscribers"
          count={counts.alerts}
          active={filters.tab === "alerts"}
        />
      </div>

      <LeadsFilterBar
        filters={filters}
        cities={options.cities}
        team={options.team}
      />

      {showing && (
        <p className="text-sm text-muted-foreground">
          Filtered view — {rows.length}
          {hasNext ? "+" : ""} matching.
        </p>
      )}

      <LeadsTable
        rows={rows.map((row) => ({
          id: row.id,
          name: row.name,
          phone: row.phone,
          email: row.email,
          amountInterested: row.amountInterested,
          status: row.status,
          enquiryType: row.enquiryType,
          source: row.source,
          createdAt: row.createdAt.toISOString(),
          propertySlug: row.propertySlug,
          propertyTitle: row.propertyTitle,
          assigneeName: row.assigneeName,
          duplicateCount: Number(row.duplicateCount ?? 0),
          noteCount: Number(row.noteCount ?? 0),
        }))}
      />

      {(filters.page > 1 || hasNext) && (
        <div className="flex items-center justify-between text-sm">
          <PageLink
            href={`/admin/leads${leadFiltersToQuery(filters, { page: filters.page - 1 })}`}
            disabled={filters.page <= 1}
            label="← Newer"
          />
          <span className="text-muted-foreground">
            Page {filters.page} · {LEADS_PAGE_SIZE} per page
          </span>
          <PageLink
            href={`/admin/leads${leadFiltersToQuery(filters, { page: filters.page + 1 })}`}
            disabled={!hasNext}
            label="Older →"
          />
        </div>
      )}
    </div>
  );
}

function Tab({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
        active
          ? "border-brand-green font-medium text-navy"
          : "border-transparent text-muted-foreground hover:text-navy"
      )}
    >
      {label}
      {count > 0 && (
        <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs tabular-nums">
          {count}
        </span>
      )}
    </Link>
  );
}

function PageLink({
  href,
  disabled,
  label,
}: {
  href: string;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return <span className="text-muted-foreground/50">{label}</span>;
  }

  return (
    <Link href={href} className="text-navy hover:underline">
      {label}
    </Link>
  );
}
