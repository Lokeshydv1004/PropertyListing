import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PropertiesFilterBar } from "@/components/admin/properties/properties-filters";
import { PropertiesTable } from "@/components/admin/properties/properties-table";
import { Button } from "@/components/ui/button";
import {
  PROPERTIES_PAGE_SIZE,
  parsePropertyFilters,
  propertyFiltersToQuery,
} from "@/lib/admin/properties-filters";
import {
  getAdminPropertyCounts,
  getPropertyFilterChoices,
  listAdminProperties,
} from "@/lib/queries/admin-properties";

export const metadata: Metadata = { title: "Properties" };

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parsePropertyFilters(await searchParams);

  const [{ rows, hasNext }, counts, choices] = await Promise.all([
    listAdminProperties(filters),
    getAdminPropertyCounts(),
    getPropertyFilterChoices(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy">
            Properties
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {counts.published} live · {counts.drafts} draft
            {counts.drafts === 1 ? "" : "s"} · drafts first
          </p>
        </div>

        <Button
          size="sm"
          className="bg-brand-green text-white hover:bg-brand-green/90"
          nativeButton={false}
          render={<Link href="/admin/properties/new" />}
        >
          <Plus className="size-4" aria-hidden="true" />
          New listing
        </Button>
      </div>

      {/* getFeaturedProperties() only ever shows three. Any more than that
          and the extras are flagged but invisible, which looks like a bug to
          whoever ticked the box. */}
      {counts.featured > 3 && (
        <p className="rounded-lg bg-gold-light p-3 text-sm text-gold-700">
          {counts.featured} listings are featured, but the home page shows
          three. The rest are flagged and invisible.
        </p>
      )}

      <PropertiesFilterBar
        filters={filters}
        cities={choices.cities}
        buildings={choices.buildings}
      />

      <PropertiesTable
        rows={rows.map((row) => ({
          ...row,
          updatedAt: row.updatedAt.toISOString(),
        }))}
      />

      {(filters.page > 1 || hasNext) && (
        <div className="flex items-center justify-between text-sm">
          {filters.page > 1 ? (
            <Link
              href={`/admin/properties${propertyFiltersToQuery(filters, { page: filters.page - 1 })}`}
              className="text-navy hover:underline"
            >
              ← Previous
            </Link>
          ) : (
            <span className="text-muted-foreground/50">← Previous</span>
          )}

          <span className="text-muted-foreground">
            Page {filters.page} · {PROPERTIES_PAGE_SIZE} per page
          </span>

          {hasNext ? (
            <Link
              href={`/admin/properties${propertyFiltersToQuery(filters, { page: filters.page + 1 })}`}
              className="text-navy hover:underline"
            >
              Next →
            </Link>
          ) : (
            <span className="text-muted-foreground/50">Next →</span>
          )}
        </div>
      )}
    </div>
  );
}
