import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { FilterBar } from "@/components/properties/filter-bar";
import { ListingTypeTabs } from "@/components/properties/listing-type-tabs";
import { PropertyInfiniteList } from "@/components/properties/property-infinite-list";
import {
  NotifyBarMobile,
  PropertiesSidebar,
} from "@/components/properties/sidebar";
import { parsePropertyFilters } from "@/lib/queries/parse-filters";
import {
  getListingTypeCounts,
  getProperties,
  getPropertiesCount,
  getPropertyFilterOptions,
} from "@/lib/queries/properties";
import { withDbRetry } from "@/lib/with-db-retry";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  // "page" is pagination of the same result set, not a different filter.
  const isFiltered = Object.keys(params).some((key) => key !== "page");

  return {
    title: "Properties",
    description:
      "Browse title-verified properties available for fractional investment, purchase or lease across India.",
    // Always points at the unfiltered page, so link equity from any filtered
    // URL consolidates onto the one page that should rank.
    alternates: { canonical: "/properties" },
    openGraph: {
      title: "Properties | GharShare",
      description:
        "Browse title-verified properties available for fractional investment, purchase or lease across India.",
      url: "/properties",
    },
    // follow, not nofollow: we still want crawlers walking through to the
    // individual listings, we just don't want the filter permutations indexed.
    ...(isFiltered && { robots: { index: false, follow: true } }),
  };
}

const PAGE_SIZE = 6;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // The same parser /api/properties uses, so the server-rendered first page
  // and everything infinite scroll appends are filtered identically.
  const { filters } = parsePropertyFilters(params);

  const [filterOptions, listingTypeCounts, totalCount, results] =
    await withDbRetry(() =>
      Promise.all([
        getPropertyFilterOptions(),
        getListingTypeCounts(),
        getPropertiesCount(filters),
        getProperties(filters, { page: 1, pageSize: PAGE_SIZE }),
      ])
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            Properties
          </h1>
          {/* Filters used to arrive with no explanation of what qualifies a
              listing to appear here at all. One line, and it is the single
              most reassuring thing we can say at this point in the journey. */}
          <p className="mt-2 flex items-start gap-2 text-muted-foreground">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-brand-green"
              aria-hidden="true"
            />
            Every property is title-verified and legally vetted before it is
            listed.
          </p>
        </div>

        <ListingTypeTabs counts={listingTypeCounts} />
      </div>

      <div className="mt-8">
        <FilterBar
          cities={filterOptions.cities}
          categories={filterOptions.categories}
          resultCount={totalCount}
        />
      </div>

      {/* `items-start` is what lets the sidebar stick. Grid items stretch to
          the row height by default, and an item already as tall as its row has
          nowhere to travel — sticky silently does nothing. */}
      <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {/* lg:hidden, not sm:hidden — the sidebar that carries this signup
              on desktop only appears at lg, so gating here at sm left tablets
              between 640px and 1024px with no way to subscribe at all. */}
          <div className="mb-4 lg:hidden">
            <NotifyBarMobile />
          </div>

          {results.length > 0 ? (
            /* The "Showing X of Y" line lives inside this component: it has to
               count what infinite scroll has actually appended, which only the
               client knows. Rendered here from `results.length` it was stuck
               at the first page forever. */
            <PropertyInfiniteList
              // Remounts on a filter change so the appended pages from the
              // previous filter set cannot survive into the new one.
              key={JSON.stringify(filters)}
              initialProperties={results}
              totalCount={totalCount}
            />
          ) : (
            <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-lg font-medium text-navy">
                No properties match your filters
              </p>
              <p className="max-w-sm text-muted-foreground">
                Try clearing a filter or switching mode — we list for
                investment, purchase and lease.
              </p>
            </div>
          )}
        </div>

        {/* Pinned while the results scroll past it, instead of sliding away
            the moment you start browsing. `top-24` clears the fixed 4rem
            navbar with breathing room.

            The max-h/overflow pair keeps the lower half reachable when the
            sidebar is taller than the viewport, which it usually is on a
            laptop. The bar itself is hidden — it sat in the gap between the
            two columns looking like a rendering fault — but the panel still
            scrolls under the pointer, so nothing becomes unreachable. Same
            idiom as the carousels elsewhere in the app. */}
        <div className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <PropertiesSidebar />
        </div>
      </div>
    </div>
  );
}
