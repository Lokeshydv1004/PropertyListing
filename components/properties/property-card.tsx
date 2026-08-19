import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PropertyImage } from "@/components/properties/property-image";
import {
  ListingTypeBadge,
  StatusBadge,
} from "@/components/properties/listing-badges";
import { formatCompactINR, formatPercent } from "@/lib/format";
import type { Property } from "@/db/schema";

/** Compact card used on the home page. */
export function PropertyCard({ property }: { property: Property }) {
  const fundingTarget = Number(property.fundingTarget ?? 0);
  const amountRaised = Number(property.amountRaised ?? 0);
  const percentFunded =
    fundingTarget > 0 ? Math.min(100, (amountRaised / fundingTarget) * 100) : 0;
  const isFractional = property.listingType === "fractional";
  const href = `/properties/${property.slug}`;

  // Every figure is optional now that sale and rent listings share this card,
  // so each one falls back rather than rendering "₹0".
  const stats = isFractional
    ? [
        {
          label: "Property value",
          value: property.totalValuation
            ? formatCompactINR(Number(property.totalValuation))
            : "—",
        },
        {
          label: "Min. investment",
          value: property.minInvestment
            ? formatCompactINR(Number(property.minInvestment))
            : "—",
        },
        {
          label: "Est. yield",
          value: property.estAnnualYield
            ? `${property.estAnnualYield}% p.a.`
            : "—",
        },
      ]
    : [
        {
          label: property.listingType === "rent" ? "Monthly rent" : "Price",
          value: formatCompactINR(
            Number(property.monthlyRent ?? property.salePrice ?? 0)
          ),
        },
        {
          label: "Area",
          value: `${Number(property.areaSqft).toLocaleString("en-IN")} sq.ft.`,
        },
        {
          label: "Possession",
          value: property.possessionStatus,
        },
      ];

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-navy-light">
        <Link href={href} className="absolute inset-0 z-0">
          <PropertyImage
            src={property.images[0]}
            alt={`${property.title}, ${property.shortLocation}`}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute top-2 left-2 flex flex-col items-start gap-1 sm:top-3 sm:left-3">
          <ListingTypeBadge listingType={property.listingType} />
          <StatusBadge
            status={property.status}
            percentFunded={isFractional ? percentFunded : undefined}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-5">
        <Link href={href} className="flex flex-col gap-0.5">
          {/* line-clamp, not truncate — titles were being cut mid-word. */}
          <h3
            className="line-clamp-2 text-sm leading-snug font-semibold text-navy sm:text-base"
            title={property.title}
          >
            {property.title}
          </h3>
          <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground sm:text-sm">
            <MapPin className="size-3 shrink-0 sm:size-3.5" aria-hidden="true" />
            <span className="truncate">{property.shortLocation}</span>
          </p>
        </Link>

        <div className="grid grid-cols-3 gap-1.5 text-xs sm:gap-2 sm:text-sm">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <p
                className="truncate text-[11px] text-muted-foreground sm:text-xs"
                title={stat.label}
              >
                {stat.label}
              </p>
              <p className="mt-0.5 truncate font-medium text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {isFractional && (
          <div className="mt-auto space-y-1.5">
            <Progress
              value={percentFunded}
              aria-label={`${formatPercent(percentFunded)} of funding target raised`}
              className="[&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-indicator]]:bg-brand-green"
            />
            <p className="text-right text-[11px] font-medium text-muted-foreground sm:text-xs">
              {formatPercent(percentFunded)} funded
            </p>
          </div>
        )}

        {/* One action per card. There used to be two buttons pointing at the
            same URL, one of them labelled "Invest Now" — a promise the site
            cannot keep, since there is no payment flow. */}
        <Button
          render={<Link href={href} />}
          nativeButton={false}
          className="mt-auto h-9 w-full bg-navy text-xs text-white hover:bg-navy/90 sm:text-sm"
        >
          View details
        </Button>
      </div>
    </div>
  );
}
