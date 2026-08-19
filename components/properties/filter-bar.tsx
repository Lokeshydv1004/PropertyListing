"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CATEGORY_GROUPS,
  CATEGORY_LABEL,
  STATUSES_FOR_LISTING_TYPE,
  STATUS_LABEL,
} from "@/lib/taxonomy";
import type { ListingType, PropertyCategory } from "@/db/schema";

const ALL_VALUE = "__all__";

/** Ticket-size bands for fractional listings. */
const MIN_INVESTMENT_OPTIONS = [
  { value: "100000", label: "Up to ₹1 Lakh" },
  { value: "250000", label: "Up to ₹2.5 Lakh" },
  { value: "500000", label: "Up to ₹5 Lakh" },
  { value: "1000000", label: "Up to ₹10 Lakh" },
];

/** Monthly rent bands — retail and office rents span a wide range. */
const RENT_OPTIONS = [
  { value: "100000", label: "Up to ₹1 L/mo" },
  { value: "300000", label: "Up to ₹3 L/mo" },
  { value: "600000", label: "Up to ₹6 L/mo" },
  { value: "1200000", label: "Up to ₹12 L/mo" },
];

const FOOTFALL_OPTIONS = [
  { value: "250000", label: "2.5 L+ / month" },
  { value: "500000", label: "5 L+ / month" },
  { value: "1000000", label: "10 L+ / month" },
];

const SORT_OPTIONS_BY_TYPE: Record<
  ListingType | "all",
  { value: string; label: string }[]
> = {
  all: [
    { value: "newest", label: "Newest" },
    { value: "price_low", label: "Price: low to high" },
    { value: "price_high", label: "Price: high to low" },
  ],
  fractional: [
    { value: "newest", label: "Newest" },
    { value: "most_funded", label: "Most funded" },
    { value: "closing_soon", label: "Closing soon" },
    { value: "price_low", label: "Ticket: low to high" },
  ],
  sale: [
    { value: "newest", label: "Newest" },
    { value: "price_low", label: "Price: low to high" },
    { value: "price_high", label: "Price: high to low" },
  ],
  rent: [
    { value: "newest", label: "Newest" },
    { value: "price_low", label: "Rent: low to high" },
    { value: "price_high", label: "Rent: high to low" },
  ],
};

// Params that count as an active *filter*. `listingType` is the mode switch
// and `sort` never narrows results, so neither belongs here.
const FILTER_KEYS = [
  "search",
  "city",
  "category",
  "status",
  "minPrice",
  "maxPrice",
  "maxMinInvestment",
  "maxMonthlyRent",
  "minFootfall",
  "kitchenOnly",
];

function useUpdateParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL_VALUE) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
}

/** A select whose empty state reads "Any …", never its own label. */
function OptionSelect({
  options,
  value,
  onValueChange,
  anyLabel,
  className,
  groups,
}: {
  options?: { value: string; label: string }[];
  groups?: { label: string; options: { value: string; label: string }[] }[];
  value: string;
  onValueChange: (value: string | null) => void;
  anyLabel: string;
  className?: string;
}) {
  const flat = groups ? groups.flatMap((g) => g.options) : (options ?? []);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue>
          {(current: string) =>
            flat.find((option) => option.value === current)?.label ?? anyLabel
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{anyLabel}</SelectItem>
        {groups
          ? groups.map((group) => (
              <div key={group.label}>
                <p className="px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {group.label}
                </p>
                {group.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </div>
            ))
          : flat.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
      </SelectContent>
    </Select>
  );
}

export function FilterBar({
  cities,
  categories,
  resultCount,
}: {
  cities: string[];
  categories: PropertyCategory[];
  resultCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateParam = useUpdateParam();

  const listingType = (searchParams.get("listingType") ?? "all") as
    | ListingType
    | "all";
  const activeFilterCount = FILTER_KEYS.filter((key) =>
    searchParams.has(key)
  ).length;
  const hasActiveFilters = activeFilterCount > 0;
  const sortOptions = SORT_OPTIONS_BY_TYPE[listingType];

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of FILTER_KEYS) params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const cityOptions = cities.map((city) => ({ value: city, label: city }));

  // Only offer categories that exist in the catalogue, grouped so a
  // twelve-item list stays scannable.
  const categoryGroups = CATEGORY_GROUPS.map((group) => ({
    label: group.label,
    options: group.categories
      .filter((category) => categories.includes(category))
      .map((category) => ({
        value: category,
        label: CATEGORY_LABEL[category],
      })),
  })).filter((group) => group.options.length > 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3">
        <SearchField />

        {/* Mobile & tablet: one sheet holds every field. */}
        <div className="flex items-center gap-2 lg:hidden">
          <MobileFiltersSheet
            cityOptions={cityOptions}
            categoryGroups={categoryGroups}
            listingType={listingType}
            activeFilterCount={activeFilterCount}
            resultCount={resultCount}
            onClear={clearFilters}
          />
          <SortSelect options={sortOptions} className="!h-11 w-32 shrink-0 sm:w-40" />
        </div>

        {/* Desktop: quick-access selects inline. */}
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <OptionSelect
              options={cityOptions}
              value={searchParams.get("city") ?? ALL_VALUE}
              onValueChange={(value) => updateParam("city", value)}
              anyLabel="All cities"
              className="!h-11 w-40"
            />
            <OptionSelect
              groups={categoryGroups}
              value={searchParams.get("category") ?? ALL_VALUE}
              onValueChange={(value) => updateParam("category", value)}
              anyLabel="All property types"
              className="!h-11 w-48"
            />

            {/* Budget control is mode-specific: a ticket cap is meaningless
                on a lease, and a rent cap is meaningless on a raise. */}
            {listingType === "rent" ? (
              <OptionSelect
                options={RENT_OPTIONS}
                value={searchParams.get("maxMonthlyRent") ?? ALL_VALUE}
                onValueChange={(value) => updateParam("maxMonthlyRent", value)}
                anyLabel="Any rent"
                className="!h-11 w-40"
              />
            ) : listingType === "fractional" ? (
              <OptionSelect
                options={MIN_INVESTMENT_OPTIONS}
                value={searchParams.get("maxMinInvestment") ?? ALL_VALUE}
                onValueChange={(value) =>
                  updateParam("maxMinInvestment", value)
                }
                anyLabel="Any ticket size"
                className="!h-11 w-44"
              />
            ) : null}

            <MoreFiltersSheet listingType={listingType} />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-11 gap-1.5 text-muted-foreground"
              >
                <X className="size-4" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>

          <SortSelect options={sortOptions} className="!h-11 w-56" withPrefix />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 self-start text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline lg:hidden"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
          </button>
        )}
      </div>
    </div>
  );
}

function SortSelect({
  options,
  className,
  withPrefix,
}: {
  options: { value: string; label: string }[];
  className?: string;
  withPrefix?: boolean;
}) {
  const searchParams = useSearchParams();
  const updateParam = useUpdateParam();

  return (
    <Select
      value={searchParams.get("sort") ?? "newest"}
      onValueChange={(value) => updateParam("sort", value)}
    >
      <SelectTrigger className={className}>
        <SlidersHorizontal
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <SelectValue>
          {(value: string) => {
            const label =
              options.find((option) => option.value === value)?.label ??
              "Newest";
            return withPrefix ? `Sort by: ${label}` : label;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function StatusSelect({ listingType }: { listingType: ListingType | "all" }) {
  const searchParams = useSearchParams();
  const updateParam = useUpdateParam();

  const statuses =
    listingType === "all"
      ? Object.values(STATUSES_FOR_LISTING_TYPE).flat()
      : STATUSES_FOR_LISTING_TYPE[listingType];

  const options = Array.from(new Set(statuses)).map((status) => ({
    value: status,
    label: STATUS_LABEL[status],
  }));

  return (
    <OptionSelect
      options={options}
      value={searchParams.get("status") ?? ALL_VALUE}
      onValueChange={(value) => updateParam("status", value)}
      anyLabel="Any status"
      className="!h-10 w-full"
    />
  );
}

/** Retail-only controls. Hidden entirely when no retail filter applies. */
function RetailFilters() {
  const searchParams = useSearchParams();
  const updateParam = useUpdateParam();
  const kitchenOnly = searchParams.get("kitchenOnly") === "1";

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label>Minimum footfall</Label>
        <OptionSelect
          options={FOOTFALL_OPTIONS}
          value={searchParams.get("minFootfall") ?? ALL_VALUE}
          onValueChange={(value) => updateParam("minFootfall", value)}
          anyLabel="Any footfall"
          className="!h-10 w-full"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3 py-2.5">
        <input
          type="checkbox"
          checked={kitchenOnly}
          onChange={(event) =>
            updateParam("kitchenOnly", event.target.checked ? "1" : null)
          }
          className="size-4 accent-[var(--brand-green)]"
        />
        <span className="text-sm text-foreground">
          Kitchen provisioning only
          <span className="block text-xs text-muted-foreground">
            Exhaust, gas and drainage already installed
          </span>
        </span>
      </label>
    </>
  );
}

function MobileFiltersSheet({
  cityOptions,
  categoryGroups,
  listingType,
  activeFilterCount,
  resultCount,
  onClear,
}: {
  cityOptions: { value: string; label: string }[];
  categoryGroups: { label: string; options: { value: string; label: string }[] }[];
  listingType: ListingType | "all";
  activeFilterCount: number;
  resultCount: number;
  onClear: () => void;
}) {
  const searchParams = useSearchParams();
  const updateParam = useUpdateParam();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" className="h-11 flex-1 gap-2 border-border" />
        }
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
        {activeFilterCount > 0 && (
          <Badge className="h-5 min-w-5 rounded-full bg-navy px-1 text-white">
            {activeFilterCount}
          </Badge>
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-sm"
      >
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 px-4 pb-6">
            <div className="flex flex-col gap-1.5">
              <Label>City</Label>
              <OptionSelect
                options={cityOptions}
                value={searchParams.get("city") ?? ALL_VALUE}
                onValueChange={(value) => updateParam("city", value)}
                anyLabel="All cities"
                className="!h-10 w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Property type</Label>
              <OptionSelect
                groups={categoryGroups}
                value={searchParams.get("category") ?? ALL_VALUE}
                onValueChange={(value) => updateParam("category", value)}
                anyLabel="All property types"
                className="!h-10 w-full"
              />
            </div>

            {listingType === "rent" && (
              <div className="flex flex-col gap-1.5">
                <Label>Monthly rent</Label>
                <OptionSelect
                  options={RENT_OPTIONS}
                  value={searchParams.get("maxMonthlyRent") ?? ALL_VALUE}
                  onValueChange={(value) =>
                    updateParam("maxMonthlyRent", value)
                  }
                  anyLabel="Any rent"
                  className="!h-10 w-full"
                />
              </div>
            )}

            {listingType === "fractional" && (
              <div className="flex flex-col gap-1.5">
                <Label>Minimum investment</Label>
                <OptionSelect
                  options={MIN_INVESTMENT_OPTIONS}
                  value={searchParams.get("maxMinInvestment") ?? ALL_VALUE}
                  onValueChange={(value) =>
                    updateParam("maxMinInvestment", value)
                  }
                  anyLabel="Any ticket size"
                  className="!h-10 w-full"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <StatusSelect listingType={listingType} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Min. price (₹)" paramKey="minPrice" />
              <NumberField label="Max. price (₹)" paramKey="maxPrice" />
            </div>

            <RetailFilters />
          </div>
        </div>

        {/* Filters apply live behind the sheet, so without this the user
            changed a value, saw no confirmation, and had to work out that
            dismissing the panel was how you saw the result. */}
        <div className="sticky bottom-0 border-t border-border bg-card p-4">
          <div className="flex gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                onClick={onClear}
                className="h-12 shrink-0 px-4"
              >
                Clear
              </Button>
            )}
            <SheetClose
              nativeButton={false}
              render={
                <Button className="h-12 flex-1 bg-navy text-white hover:bg-navy/90" />
              }
            >
              Show {resultCount} {resultCount === 1 ? "result" : "results"}
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SearchField() {
  const searchParams = useSearchParams();
  const updateParam = useUpdateParam();
  const urlValue = searchParams.get("search") ?? "";
  const [value, setValue] = useState(urlValue);
  const [syncedUrlValue, setSyncedUrlValue] = useState(urlValue);

  if (urlValue !== syncedUrlValue) {
    setSyncedUrlValue(urlValue);
    setValue(urlValue);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== urlValue) {
        updateParam("search", value || null);
      }
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative flex-1 sm:min-w-56">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        aria-label="Search properties"
        placeholder="Search by city, property or unit number"
        className="h-11 pl-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

function MoreFiltersSheet({
  listingType,
}: {
  listingType: ListingType | "all";
}) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" className="h-11 gap-2 border-border sm:w-auto" />
        }
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        More filters
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>More filters</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-1 gap-4 overflow-y-auto px-4 pb-6">
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <StatusSelect listingType={listingType} />
          </div>

          <NumberField label="Min. price (₹)" paramKey="minPrice" />
          <NumberField label="Max. price (₹)" paramKey="maxPrice" />

          <RetailFilters />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NumberField({
  label,
  paramKey,
}: {
  label: string;
  paramKey: string;
}) {
  const searchParams = useSearchParams();
  const updateParam = useUpdateParam();
  const urlValue = searchParams.get(paramKey) ?? "";
  const [value, setValue] = useState(urlValue);
  const [syncedUrlValue, setSyncedUrlValue] = useState(urlValue);

  // Reset local (typed) value whenever the URL param changes externally
  // (e.g. browser back/forward) — done during render, not an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (urlValue !== syncedUrlValue) {
    setSyncedUrlValue(urlValue);
    setValue(urlValue);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== urlValue) {
        updateParam(paramKey, value || null);
      }
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, urlValue, paramKey]);

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        // Base UI applies caret-color for numeric inputMode based on
        // client-only touch/virtual-keyboard detection, which SSR can't
        // know — harmless style-only hydration mismatch.
        suppressHydrationWarning
        placeholder="Any"
        className="!h-10"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
      />
    </div>
  );
}
