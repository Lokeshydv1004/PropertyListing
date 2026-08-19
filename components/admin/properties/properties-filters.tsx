"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listingTypeEnum,
  listingStatusEnum,
  propertyCategoryEnum,
} from "@/db/schema";
import {
  propertyFiltersToQuery,
  type AdminPropertyFilters,
} from "@/lib/admin/properties-filters";
import { CATEGORY_LABEL, LISTING_TYPE_LABEL, STATUS_LABEL } from "@/lib/taxonomy";

export function PropertiesFilterBar({
  filters,
  cities,
  buildings,
}: {
  filters: AdminPropertyFilters;
  cities: string[];
  buildings: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.q);

  const [lastQ, setLastQ] = useState(filters.q);
  if (lastQ !== filters.q) {
    setLastQ(filters.q);
    setSearch(filters.q);
  }

  function apply(overrides: Partial<AdminPropertyFilters>) {
    const query = propertyFiltersToQuery(filters, { ...overrides, page: 1 });
    startTransition(() =>
      router.replace(`${pathname}${query}`, { scroll: false })
    );
  }

  const active =
    filters.q ||
    filters.listingType ||
    filters.category ||
    filters.status ||
    filters.city ||
    filters.published ||
    filters.featured ||
    filters.building;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/*
        A fixed width, not `flex-1`.

        Flexing meant the search box was the control that gave way whenever
        the row got crowded — and with seven filters beside it, it collapsed
        to a few characters wide, which is useless for the thing it holds
        (a title or a slug). It is also the most-used control in the row, so
        it is the one that should be biggest. Full width on a phone, where it
        is the only control on its line.
      */}
      <div className="relative w-full shrink-0 sm:w-80">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            apply({ q: event.target.value });
          }}
          placeholder="Title, slug, unit or location"
          className="h-10 pl-9 text-sm"
          aria-label="Search listings"
        />
        {pending && (
          <Loader2
            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </div>

      <Select
        label="Listing type"
        value={filters.listingType}
        onChange={(value) => apply({ listingType: value })}
        options={[
          { value: "", label: "All types" },
          ...listingTypeEnum.enumValues.map((type) => ({
            value: type,
            label: LISTING_TYPE_LABEL[type],
          })),
        ]}
      />

      <Select
        label="Category"
        value={filters.category}
        onChange={(value) => apply({ category: value })}
        options={[
          { value: "", label: "All categories" },
          ...propertyCategoryEnum.enumValues.map((category) => ({
            value: category,
            label: CATEGORY_LABEL[category],
          })),
        ]}
      />

      <Select
        label="Status"
        value={filters.status}
        onChange={(value) => apply({ status: value })}
        options={[
          { value: "", label: "Any status" },
          ...listingStatusEnum.enumValues.map((status) => ({
            value: status,
            label: STATUS_LABEL[status],
          })),
        ]}
      />

      {cities.length > 0 && (
        <Select
          label="City"
          value={filters.city}
          onChange={(value) => apply({ city: value })}
          options={[
            { value: "", label: "Any city" },
            ...cities.map((city) => ({ value: city, label: city })),
          ]}
        />
      )}

      <Select
        label="Published"
        value={filters.published}
        onChange={(value) => apply({ published: value })}
        options={[
          { value: "", label: "Live and drafts" },
          { value: "yes", label: "Live only" },
          { value: "no", label: "Drafts only" },
        ]}
      />

      <Select
        label="Featured"
        value={filters.featured}
        onChange={(value) => apply({ featured: value })}
        options={[
          { value: "", label: "Any" },
          { value: "yes", label: "Featured only" },
        ]}
      />

      {buildings.length > 0 && (
        <Select
          label="Building"
          value={filters.building}
          onChange={(value) => apply({ building: value })}
          options={[
            { value: "", label: "Any building" },
            ...buildings.map((building) => ({
              value: building.id,
              label: building.name,
            })),
          ]}
        />
      )}

      {active && (
        <Button
          variant="ghost"
          size="sm"
          className="h-10"
          onClick={() =>
            startTransition(() => router.replace(pathname, { scroll: false }))
          }
        >
          <X className="size-3.5" aria-hidden="true" />
          Clear
        </Button>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-1">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-input bg-background px-2 text-sm text-navy focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
