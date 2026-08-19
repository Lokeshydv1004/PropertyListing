"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_STATUS,
  LEAD_ENQUIRY_TYPES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  hasActiveFilters,
  leadFiltersToQuery,
  type LeadFilters,
} from "@/lib/admin/leads-filters";

/**
 * Filters live in the URL, so this component's only job is to rewrite it.
 *
 * Every change replaces the current history entry rather than pushing a new
 * one — otherwise Back walks through nine intermediate filter states instead
 * of returning where the user came from.
 */
export function LeadsFilterBar({
  filters,
  cities,
  team,
}: {
  filters: LeadFilters;
  cities: string[];
  team: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.q);

  /**
   * The URL is the source of truth: Back, a shared link, or "clear filters"
   * must all be reflected in the box.
   *
   * Adjusted during render rather than in an effect — the effect version
   * renders once with the stale value and then again with the right one,
   * which is visible as a flicker in the search box on every navigation.
   */
  const [lastQ, setLastQ] = useState(filters.q);
  if (lastQ !== filters.q) {
    setLastQ(filters.q);
    setSearch(filters.q);
  }

  function apply(overrides: Partial<LeadFilters>) {
    // Any filter change invalidates the page number — staying on page 3 of a
    // result set that now has one page shows an empty table.
    const query = leadFiltersToQuery(filters, { ...overrides, page: 1 });
    startTransition(() => router.replace(`${pathname}${query}`, { scroll: false }));
  }

  // Debounced so typing a phone number doesn't fire eight queries.
  useEffect(() => {
    if (search === filters.q) return;

    const timer = setTimeout(() => apply({ q: search }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const active = hasActiveFilters(filters);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="lead-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, phone or email"
            className="pl-8"
            aria-label="Search leads"
          />
          {pending && (
            <Loader2
              className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>

        {filters.tab === "queue" && (
          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={(value) => apply({ status: value })}
            options={[
              { value: "all", label: "Any status" },
              ...LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label })),
            ]}
          />
        )}

        <FilterSelect
          label="Source"
          value={filters.source}
          onChange={(value) => apply({ source: value })}
          options={[
            { value: "", label: "Any source" },
            ...LEAD_SOURCES.map((s) => ({ value: s.value, label: s.label })),
          ]}
        />

        <FilterSelect
          label="Type"
          value={filters.enquiryType}
          onChange={(value) => apply({ enquiryType: value })}
          options={[
            { value: "", label: "Any type" },
            ...LEAD_ENQUIRY_TYPES.map((t) => ({
              value: t.value,
              label: t.label,
            })),
          ]}
        />

        {cities.length > 0 && (
          <FilterSelect
            label="City"
            value={filters.city}
            onChange={(value) => apply({ city: value })}
            options={[
              { value: "", label: "Any city" },
              ...cities.map((city) => ({ value: city, label: city })),
            ]}
          />
        )}

        {team.length > 1 && (
          <FilterSelect
            label="Assigned"
            value={filters.assigned}
            onChange={(value) => apply({ assigned: value })}
            options={[
              { value: "", label: "Anyone" },
              { value: "unassigned", label: "Unassigned" },
              ...team.map((member) => ({
                value: member.id,
                label: member.name,
              })),
            ]}
          />
        )}

        <FilterSelect
          label="Property"
          value={filters.hasProperty}
          onChange={(value) => apply({ hasProperty: value })}
          options={[
            { value: "", label: "Any listing" },
            { value: "yes", label: "About a listing" },
            { value: "no", label: "General enquiry" },
          ]}
        />

        <label className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="sr-only sm:not-sr-only">From</span>
          <input
            type="date"
            value={filters.from}
            onChange={(event) => apply({ from: event.target.value })}
            className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-navy"
          />
        </label>
        <label className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="sr-only sm:not-sr-only">to</span>
          <input
            type="date"
            value={filters.to}
            onChange={(event) => apply({ to: event.target.value })}
            className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-navy"
          />
        </label>

        {active && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              startTransition(() =>
                router.replace(
                  `${pathname}${filters.tab === "alerts" ? "?tab=alerts" : ""}`,
                  { scroll: false }
                )
              )
            }
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Quick views:</span>
        <QuickView
          href={`${pathname}${leadFiltersToQuery({ tab: "queue", status: DEFAULT_STATUS })}`}
          label="Unworked"
        />
        <QuickView
          href={`${pathname}${leadFiltersToQuery({
            tab: "queue",
            status: "all",
            from: todayInIST(),
          })}`}
          label="Today"
        />
        <QuickView
          href={`${pathname}${leadFiltersToQuery({ tab: "queue", status: "all" })}`}
          label="Everything"
        />
      </div>
    </div>
  );
}

/** The date input wants YYYY-MM-DD in the user's day, which is IST. */
function todayInIST(): string {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

function QuickView({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-border px-2.5 py-0.5 text-sm text-navy transition-colors hover:border-brand-green hover:bg-brand-green-light"
    >
      {label}
    </Link>
  );
}

function FilterSelect({
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
        className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-navy focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
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
