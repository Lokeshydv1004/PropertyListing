import { Bed, Building2, Key, Maximize2, Ruler, Store } from "lucide-react";
import { formatArea } from "@/lib/format";
import { CATEGORY_LABEL } from "@/lib/taxonomy";
import type { Property } from "@/db/schema";

export function PropertyQuickFacts({ property }: { property: Property }) {
  const facts = [
    {
      icon: Building2,
      value: CATEGORY_LABEL[property.category],
      label: "Property type",
    },
    {
      icon: Maximize2,
      value: formatArea(property.areaSqft),
      label: "Built-up area",
    },
    property.carpetAreaSqft
      ? {
          icon: Ruler,
          value: formatArea(property.carpetAreaSqft),
          label: "Carpet area",
        }
      : null,
    property.bedrooms
      ? { icon: Bed, value: String(property.bedrooms), label: "Bedrooms" }
      : null,
    property.frontageFt
      ? {
          icon: Store,
          value: `${property.frontageFt} ft`,
          label: "Frontage",
        }
      : null,
    { icon: Key, value: property.possessionStatus, label: "Possession" },
  ].filter((fact): fact is NonNullable<typeof fact> => Boolean(fact));

  return (
    // A grid, not flex-wrap. Wrapping produced a ragged 1-2-1 layout on mobile
    // that read as a bug rather than a design.
    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {facts.map((fact) => {
        const Icon = fact.icon;
        return (
          <div key={fact.label} className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-light text-gold-700">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-medium text-navy" title={fact.value}>
                {fact.value}
              </p>
              <p className="text-xs text-muted-foreground">{fact.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
