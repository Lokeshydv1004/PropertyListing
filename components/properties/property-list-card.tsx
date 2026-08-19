import Link from "next/link";
import {
  CalendarRange,
  Footprints,
  MapPin,
  Maximize2,
  TrendingUp,
  Utensils,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PropertyImage } from "@/components/properties/property-image";
import {
  ListingTypeBadge,
  StatusBadge,
} from "@/components/properties/listing-badges";
import {
  formatArea,
  formatCompactINR,
  formatFootfall,
  formatMonths,
  formatPercent,
} from "@/lib/format";
import { CATEGORY_LABEL, isFnB, isRetail } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import type { Property } from "@/db/schema";

/**
 * Three pricing shapes share one card.
 *
 * The stat row adapts to the listing type so each card shows the numbers that
 * decide that kind of deal — ticket size and yield for a raise, price per
 * sq.ft. for a sale, deposit and lease term for a lease.
 */
function statsFor(property: Property) {
  const areaStat = {
    icon: Maximize2,
    iconClassName: "bg-navy-light text-navy",
    label: "Area",
    value: formatArea(property.areaSqft),
  };

  switch (property.listingType) {
    case "fractional":
      return [
        {
          icon: Wallet,
          iconClassName: "bg-gold-light text-gold-700",
          label: "Min. investment",
          value: property.minInvestment
            ? formatCompactINR(Number(property.minInvestment))
            : "—",
        },
        {
          icon: TrendingUp,
          iconClassName: "bg-brand-green-light text-brand-green",
          label: "Est. yield",
          value: property.estAnnualYield
            ? `${property.estAnnualYield}% p.a.`
            : "—",
        },
        {
          icon: CalendarRange,
          iconClassName: "bg-navy-light text-navy",
          label: "Hold period",
          value: property.investmentHorizon ?? "—",
        },
      ];

    case "sale":
      return [
        areaStat,
        {
          icon: Wallet,
          iconClassName: "bg-gold-light text-gold-700",
          label: "Price / sq.ft.",
          value: property.pricePerSqft
            ? formatCompactINR(Number(property.pricePerSqft))
            : "—",
        },
        property.monthlyRent
          ? {
              icon: TrendingUp,
              iconClassName: "bg-brand-green-light text-brand-green",
              label: "Current rent",
              value: `${formatCompactINR(Number(property.monthlyRent))}/mo`,
            }
          : {
              icon: CalendarRange,
              iconClassName: "bg-brand-green-light text-brand-green",
              label: "Possession",
              value: property.possessionStatus,
            },
      ];

    case "rent":
      return [
        areaStat,
        {
          icon: Wallet,
          iconClassName: "bg-gold-light text-gold-700",
          label: "Deposit",
          value: property.securityDeposit
            ? formatCompactINR(Number(property.securityDeposit))
            : "—",
        },
        {
          icon: CalendarRange,
          iconClassName: "bg-brand-green-light text-brand-green",
          label: "Lease term",
          value: property.leaseTermMonths
            ? formatMonths(property.leaseTermMonths)
            : "—",
        },
      ];
  }
}

/** The one big number, and what it means. */
function headline(property: Property) {
  switch (property.listingType) {
    case "fractional":
      return {
        value: property.totalValuation
          ? formatCompactINR(Number(property.totalValuation))
          : "—",
        label: "Property value",
      };
    case "sale":
      return {
        value: property.salePrice
          ? formatCompactINR(Number(property.salePrice))
          : "—",
        label: "Asking price",
      };
    case "rent":
      return {
        value: property.monthlyRent
          ? `${formatCompactINR(Number(property.monthlyRent))}`
          : "—",
        label: "per month",
      };
  }
}

export function PropertyListCard({ property }: { property: Property }) {
  const fundingTarget = Number(property.fundingTarget ?? 0);
  const amountRaised = Number(property.amountRaised ?? 0);
  const percentFunded =
    fundingTarget > 0 ? Math.min(100, (amountRaised / fundingTarget) * 100) : 0;
  const remaining = Math.max(0, fundingTarget - amountRaised);

  const isFractional = property.listingType === "fractional";
  const stats = statsFor(property);
  const big = headline(property);
  const href = `/properties/${property.slug}`;
  const alt = `${property.title}, ${property.shortLocation}`;

  const footfall = property.footfallMonthly;
  const showFootfall = isRetail(property.category) && footfall;

  return (
    <>
      {/* Compact mobile card — sits 2-up in a grid. */}
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg sm:hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-navy-light">
          <Link href={href} className="absolute inset-0 z-0">
            <PropertyImage
              src={property.images[0]}
              alt={alt}
              sizes="50vw"
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <div className="pointer-events-none absolute top-2 left-2 flex flex-col items-start gap-1">
            <ListingTypeBadge listingType={property.listingType} />
            <StatusBadge
              status={property.status}
              percentFunded={isFractional ? percentFunded : undefined}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <Link href={href}>
            {/* line-clamp, not truncate: every title was being cut mid-word
                on mobile, hiding the listing's primary identifier. */}
            <h3
              className="line-clamp-2 text-sm leading-snug font-semibold text-navy"
              title={property.title}
            >
              {property.title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{property.shortLocation}</span>
            </p>
          </Link>

          {/* The affordable number, not the intimidating one. Showing only
              "₹15 Cr" told a mobile visitor this wasn't for them. */}
          <div className="mt-auto flex items-baseline justify-between gap-2 pt-1">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">
                {isFractional ? "From" : big.label}
              </p>
              <p className="truncate text-sm font-semibold text-navy">
                {isFractional && property.minInvestment
                  ? formatCompactINR(Number(property.minInvestment))
                  : big.value}
              </p>
            </div>
            {isFractional && property.estAnnualYield ? (
              <div className="shrink-0 text-right">
                <p className="text-[11px] text-muted-foreground">Est. yield</p>
                <p className="text-sm font-semibold text-brand-green">
                  {property.estAnnualYield}%
                </p>
              </div>
            ) : (
              <div className="shrink-0 text-right">
                <p className="text-[11px] text-muted-foreground">Area</p>
                <p className="text-sm font-semibold text-navy">
                  {Number(property.areaSqft).toLocaleString("en-IN")}
                </p>
              </div>
            )}
          </div>

          {isFractional && (
            <div className="space-y-1">
              <Progress
                value={percentFunded}
                aria-label={`${formatPercent(percentFunded)} of funding target raised`}
                className="[&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-indicator]]:bg-brand-green"
              />
              <p className="text-[11px] font-medium text-muted-foreground">
                {formatPercent(percentFunded)} funded
              </p>
            </div>
          )}

          <Button
            render={<Link href={href} />}
            nativeButton={false}
            className="mt-1 h-8 w-full bg-navy text-xs text-white hover:bg-navy/90"
          >
            View details
          </Button>
        </div>
      </div>

      {/* Full horizontal card — sm and up */}
      <div className="group hidden overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg sm:flex sm:flex-row sm:gap-5">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-l-2xl bg-navy-light sm:w-[300px] md:w-[320px]">
          <Link href={href} className="absolute inset-0 z-0">
            <PropertyImage
              src={property.images[0]}
              alt={alt}
              sizes="(min-width: 768px) 320px, 100vw"
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
            <ListingTypeBadge listingType={property.listingType} />
            <StatusBadge
              status={property.status}
              percentFunded={isFractional ? percentFunded : undefined}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 pl-0">
          <div className="flex items-start justify-between gap-3">
            <Link href={href} className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                {CATEGORY_LABEL[property.category]}
                {property.unitNumber ? ` · Unit ${property.unitNumber}` : ""}
                {property.floorLabel ? ` · ${property.floorLabel}` : ""}
              </p>
              <h3 className="mt-0.5 text-lg leading-snug font-semibold text-navy">
                {property.title}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" aria-hidden="true" />
                {property.shortLocation}
              </p>
            </Link>
            <div className="shrink-0 text-right">
              <p className="text-xl font-semibold text-navy">{big.value}</p>
              <p className="text-xs text-muted-foreground">{big.label}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-y border-border py-4">
            {stats.map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </div>

          {(showFootfall || isFnB(property.category)) && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              {showFootfall && (
                <span className="flex items-center gap-1.5">
                  <Footprints className="size-3.5" aria-hidden="true" />
                  {formatFootfall(footfall!)} visitors/mo
                </span>
              )}
              {property.hasKitchenProvision && (
                <span className="flex items-center gap-1.5">
                  <Utensils className="size-3.5" aria-hidden="true" />
                  Kitchen provisioned
                </span>
              )}
              {property.seatingCapacity ? (
                <span>{property.seatingCapacity} covers</span>
              ) : null}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {isFractional ? (
              <div className="flex-1 space-y-1.5">
                <Progress
                  value={percentFunded}
                  aria-label={`${formatPercent(percentFunded)} of funding target raised`}
                  className="[&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-indicator]]:bg-brand-green"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">
                    {formatPercent(percentFunded)} funded
                  </span>
                  {/* Real and more persuasive than a derived investor count. */}
                  {remaining > 0 && (
                    <span>{formatCompactINR(remaining)} remaining</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 text-xs text-muted-foreground">
                {property.availableFrom
                  ? `Available from ${new Date(
                      property.availableFrom
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}`
                  : property.possessionStatus}
              </div>
            )}

            <Button
              render={<Link href={href} />}
              nativeButton={false}
              className="h-10 shrink-0 bg-navy px-5 text-sm text-white hover:bg-navy/90"
            >
              View details
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({
  icon: Icon,
  iconClassName,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  iconClassName: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          iconClassName
        )}
      >
        <Icon className="size-4" aria-hidden={true} />
      </span>
      <div className="min-w-0">
        {/* Single line, always: a wrapping label used to push its value out of
            alignment with the rest of the row. Labels here are kept short
            enough that this never actually clips. */}
        <p className="truncate text-xs text-muted-foreground" title={label}>
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
