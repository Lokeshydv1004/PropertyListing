import type { Metadata } from "next";
import { FilterBar } from "@/components/properties/filter-bar";
import { PropertyCard } from "@/components/properties/property-card";
import {
  getOpenPropertiesCount,
  getProperties,
  getPropertyFilterOptions,
  type PropertyFilters,
  type PropertySort,
} from "@/lib/queries/properties";

export const metadata: Metadata = {
  title: "Properties — GharShare",
  description:
    "Browse verified properties open for fractional real estate investment.",
};

const VALID_STATUSES = new Set(["fundraising", "fully_funded", "closed"]);
const VALID_SORTS = new Set(["newest", "most_funded", "closing_soon"]);

function parseNumberParam(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const get = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const status = get("status");
  const sort = get("sort");

  const filters: PropertyFilters = {
    location: get("location"),
    propertyType: get("propertyType"),
    status: status && VALID_STATUSES.has(status)
      ? (status as PropertyFilters["status"])
      : undefined,
    minValuation: parseNumberParam(get("minValuation")),
    maxValuation: parseNumberParam(get("maxValuation")),
    maxMinInvestment: parseNumberParam(get("maxMinInvestment")),
    sort: sort && VALID_SORTS.has(sort) ? (sort as PropertySort) : undefined,
  };

  const [openCount, filterOptions, results] = await Promise.all([
    getOpenPropertiesCount(),
    getPropertyFilterOptions(),
    getProperties(filters),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          Properties
        </h1>
        <p className="text-muted-foreground">
          <span className="font-medium text-brand-green">{openCount}</span>{" "}
          {openCount === 1 ? "property" : "properties"} open for investment
          right now.
        </p>
      </div>

      <div className="mt-8 border-b border-border pb-6">
        <FilterBar
          locations={filterOptions.locations}
          propertyTypes={filterOptions.propertyTypes}
        />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Showing {results.length}{" "}
        {results.length === 1 ? "property" : "properties"}
      </p>

      {results.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-lg font-medium text-navy">
            No properties match your filters
          </p>
          <p className="text-muted-foreground">
            Try adjusting or clearing some filters.
          </p>
        </div>
      )}
    </div>
  );
}
