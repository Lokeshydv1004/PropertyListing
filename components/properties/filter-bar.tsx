"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
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
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const STATUS_OPTIONS = [
  { value: "fundraising", label: "Fundraising" },
  { value: "fully_funded", label: "Fully Funded" },
  { value: "closed", label: "Closed" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "most_funded", label: "Most Funded" },
  { value: "closing_soon", label: "Closing Soon" },
];

const ALL_VALUE = "__all__";

export function FilterBar({
  locations,
  propertyTypes,
}: {
  locations: string[];
  propertyTypes: string[];
}) {
  return (
    <>
      <div className="hidden flex-wrap items-end gap-4 md:flex">
        <FilterFields locations={locations} propertyTypes={propertyTypes} />
      </div>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger
            render={<Button variant="outline" className="gap-2" />}
          >
            <SlidersHorizontal className="size-4" />
            Filters
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-4 pb-6">
              <FilterFields
                locations={locations}
                propertyTypes={propertyTypes}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function FilterFields({
  locations,
  propertyTypes,
}: {
  locations: string[];
  propertyTypes: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL_VALUE) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <div className="flex min-w-40 flex-col gap-1.5">
        <Label>Location</Label>
        <Select
          value={searchParams.get("location") ?? ALL_VALUE}
          onValueChange={(value) => updateParam("location", value)}
        >
          <SelectTrigger>
            <SelectValue>
              {(value: string) => (value === ALL_VALUE ? "All locations" : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-w-40 flex-col gap-1.5">
        <Label>Property type</Label>
        <Select
          value={searchParams.get("propertyType") ?? ALL_VALUE}
          onValueChange={(value) => updateParam("propertyType", value)}
        >
          <SelectTrigger>
            <SelectValue>
              {(value: string) => (value === ALL_VALUE ? "All types" : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All types</SelectItem>
            {propertyTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-w-40 flex-col gap-1.5">
        <Label>Funding status</Label>
        <Select
          value={searchParams.get("status") ?? ALL_VALUE}
          onValueChange={(value) => updateParam("status", value)}
        >
          <SelectTrigger>
            <SelectValue>
              {(value: string) =>
                STATUS_OPTIONS.find((option) => option.value === value)
                  ?.label ?? "All statuses"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3">
        <NumberField
          label="Min. valuation (₹)"
          paramKey="minValuation"
          updateParam={updateParam}
        />
        <NumberField
          label="Max. valuation (₹)"
          paramKey="maxValuation"
          updateParam={updateParam}
        />
      </div>

      <NumberField
        label="Max. min. investment (₹)"
        paramKey="maxMinInvestment"
        updateParam={updateParam}
      />

      <div className="flex min-w-40 flex-col gap-1.5">
        <Label>Sort by</Label>
        <Select
          value={searchParams.get("sort") ?? "newest"}
          onValueChange={(value) => updateParam("sort", value)}
        >
          <SelectTrigger>
            <SelectValue>
              {(value: string) =>
                SORT_OPTIONS.find((option) => option.value === value)
                  ?.label ?? "Newest"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

function NumberField({
  label,
  paramKey,
  updateParam,
}: {
  label: string;
  paramKey: string;
  updateParam: (key: string, value: string | null) => void;
}) {
  const searchParams = useSearchParams();
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
  }, [value, urlValue, paramKey, updateParam]);

  return (
    <div className="flex min-w-32 flex-1 flex-col gap-1.5">
      <Label>{label}</Label>
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        // Base UI applies caret-color for numeric inputMode based on
        // client-only touch/virtual-keyboard detection, which SSR can't
        // know — harmless style-only hydration mismatch.
        suppressHydrationWarning
        value={value}
        onChange={(e) => {
          const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
          setValue(digitsOnly);
        }}
      />
    </div>
  );
}
