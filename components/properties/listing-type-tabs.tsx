"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2, KeyRound, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListingType } from "@/db/schema";

const TABS: {
  value: ListingType | "all";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "all", label: "All", icon: Building2 },
  { value: "fractional", label: "Invest", icon: PieChart },
  { value: "sale", label: "Buy", icon: Building2 },
  { value: "rent", label: "Rent", icon: KeyRound },
];

/**
 * Top-level mode switch.
 *
 * With three transaction types in one catalogue, this has to come before any
 * other filter — "budget" means a ₹2.6 Cr asking price under Buy and a ₹4.65 L
 * monthly rent under Rent, so the mode decides what every control below means.
 */
export function ListingTypeTabs({
  counts,
}: {
  counts: Record<ListingType, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("listingType") ?? "all";

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("listingType");
    } else {
      params.set("listingType", value);
    }
    // Price and status controls are mode-specific — carrying them across a
    // mode switch silently produces zero results.
    for (const key of [
      "page",
      "status",
      "minPrice",
      "maxPrice",
      "maxMinInvestment",
      "maxMonthlyRent",
      "sort",
    ]) {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const total = counts.fractional + counts.sale + counts.rent;

  return (
    <div
      role="tablist"
      aria-label="Listing type"
      className="flex w-full gap-1 overflow-x-auto rounded-xl bg-secondary p-1 [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.value;
        const count = tab.value === "all" ? total : counts[tab.value];
        const Icon = tab.icon;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => select(tab.value)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors sm:px-4",
              isActive
                ? "bg-navy text-white shadow-sm"
                : "text-foreground/70 hover:bg-white/60 hover:text-navy"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {tab.label}
            <span
              className={cn(
                "text-xs",
                isActive ? "text-white/70" : "text-muted-foreground"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
