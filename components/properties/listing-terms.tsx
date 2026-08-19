import {
  Banknote,
  CalendarClock,
  Flame,
  Footprints,
  Lock,
  Maximize2,
  Ruler,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  formatArea,
  formatCompactINR,
  formatExactINR,
  formatFootfall,
  formatMonths,
} from "@/lib/format";
import { isFnB, isRetail } from "@/lib/taxonomy";
import type { Building, Property } from "@/db/schema";

type Row = { icon: React.ComponentType<{ className?: string }>; label: string; value: string };

/**
 * The commercial terms of the deal, by listing type.
 *
 * A lease is decided on deposit, lock-in, escalation and CAM — none of which
 * the fractional-only page had anywhere to put. Showing them as a labelled
 * table also makes it obvious when a figure is missing, rather than silently
 * rendering a blank.
 */
export function ListingTerms({
  property,
  building,
}: {
  property: Property;
  building: Building | null;
}) {
  const rows: Row[] = [];

  if (property.listingType === "rent") {
    if (property.monthlyRent)
      rows.push({
        icon: Banknote,
        label: "Monthly rent",
        value: formatExactINR(Number(property.monthlyRent)),
      });
    if (property.securityDeposit)
      rows.push({
        icon: Lock,
        label: "Security deposit",
        value: `${formatExactINR(Number(property.securityDeposit))}${
          property.monthlyRent
            ? ` (${Math.round(
                Number(property.securityDeposit) / Number(property.monthlyRent)
              )} months)`
            : ""
        }`,
      });
    if (property.leaseTermMonths)
      rows.push({
        icon: CalendarClock,
        label: "Lease term",
        value: formatMonths(property.leaseTermMonths),
      });
    if (property.lockInMonths)
      rows.push({
        icon: Lock,
        label: "Lock-in period",
        value: formatMonths(property.lockInMonths),
      });
    if (property.rentEscalationPct)
      rows.push({
        icon: TrendingUp,
        label: "Rent escalation",
        value: `${property.rentEscalationPct}% every 3 years`,
      });
    if (property.camPerSqftMonthly)
      rows.push({
        icon: Banknote,
        label: "CAM charges",
        value: `₹${property.camPerSqftMonthly}/sq.ft./month`,
      });
    if (property.furnishingStatus)
      rows.push({
        icon: Maximize2,
        label: "Handover condition",
        value: property.furnishingStatus,
      });
  }

  if (property.listingType === "sale") {
    if (property.salePrice)
      rows.push({
        icon: Banknote,
        label: "Asking price",
        value: formatExactINR(Number(property.salePrice)),
      });
    if (property.pricePerSqft)
      rows.push({
        icon: Ruler,
        label: "Price per sq.ft.",
        value: formatExactINR(Number(property.pricePerSqft)),
      });
    if (property.monthlyRent)
      rows.push({
        icon: TrendingUp,
        label: "Current rent in place",
        value: `${formatExactINR(Number(property.monthlyRent))}/month`,
      });
    if (property.salePrice && property.monthlyRent)
      rows.push({
        icon: TrendingUp,
        label: "Gross yield on asking",
        value: `${(
          ((Number(property.monthlyRent) * 12) / Number(property.salePrice)) *
          100
        ).toFixed(1)}% p.a.`,
      });
    if (property.maintenanceMonthly)
      rows.push({
        icon: Banknote,
        label: "Maintenance",
        value: `${formatExactINR(Number(property.maintenanceMonthly))}/month`,
      });
  }

  // Size and fit-out facts that matter across all three modes for commercial
  // space, and are the whole decision for retail.
  const spec: Row[] = [];
  if (property.carpetAreaSqft)
    spec.push({
      icon: Maximize2,
      label: "Carpet area",
      value: formatArea(property.carpetAreaSqft),
    });
  if (property.frontageFt)
    spec.push({
      icon: Ruler,
      label: "Frontage",
      value: `${property.frontageFt} ft`,
    });
  const footfall = property.footfallMonthly ?? building?.footfallMonthly;
  if (footfall && isRetail(property.category))
    spec.push({
      icon: Footprints,
      label: "Footfall",
      value: `${formatFootfall(footfall)} visitors/month`,
    });
  if (property.seatingCapacity)
    spec.push({
      icon: Users,
      label: isFnB(property.category) ? "Shared seating" : "Seating",
      value: `${property.seatingCapacity} covers`,
    });
  if (property.hasKitchenProvision !== null)
    spec.push({
      icon: Flame,
      label: "Kitchen provisioning",
      value: property.hasKitchenProvision
        ? "Installed — exhaust, gas, drainage"
        : "Not provided",
    });
  if (property.powerLoadKva)
    spec.push({
      icon: Zap,
      label: "Sanctioned load",
      value: `${property.powerLoadKva} kVA`,
    });

  if (rows.length === 0 && spec.length === 0) return null;

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2">
      {rows.length > 0 && (
        <TermsCard
          title={
            property.listingType === "rent" ? "Lease terms" : "Sale terms"
          }
          rows={rows}
        />
      )}
      {spec.length > 0 && (
        <TermsCard title="Unit specification" rows={spec} />
      )}
    </div>
  );
}

function TermsCard({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-serif text-lg font-semibold text-navy">{title}</h2>
      <dl className="mt-4 divide-y divide-border">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex items-start justify-between gap-4 py-2.5"
            >
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                {row.label}
              </dt>
              <dd className="text-right text-sm font-medium text-navy">
                {row.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/** Context card for a unit that sits inside a mall or office park. */
export function BuildingPanel({ building }: { building: Building }) {
  return (
    <div className="mt-8 rounded-2xl border border-border bg-navy-light/40 p-6">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Part of
      </p>
      <h2 className="mt-1 font-serif text-xl font-semibold text-navy">
        {building.name}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {building.description}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {building.footfallMonthly ? (
          <Fact
            label="Footfall"
            value={`${formatFootfall(building.footfallMonthly)}/mo`}
          />
        ) : null}
        {building.totalUnits ? (
          <Fact label="Total units" value={String(building.totalUnits)} />
        ) : null}
        {building.yearBuilt ? (
          <Fact label="Built" value={String(building.yearBuilt)} />
        ) : null}
        {building.anchorTenants.length > 0 ? (
          <Fact
            label="Anchor tenants"
            value={building.anchorTenants.slice(0, 2).join(", ")}
          />
        ) : null}
      </div>

      {building.anchorTenants.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">Anchors & key brands</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {building.anchorTenants.map((tenant) => (
              <span
                key={tenant}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground/80"
              >
                {tenant}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="leading-tight">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-navy">{value}</p>
    </div>
  );
}

/** Compact helper used by the detail hero. */
export function priceHeadline(property: Property): {
  label: string;
  value: string;
  note: string | null;
} {
  switch (property.listingType) {
    case "fractional":
      return {
        label: "Starting from",
        value: property.minInvestment
          ? formatCompactINR(Number(property.minInvestment))
          : "—",
        note: property.estAnnualYield
          ? `Min. investment · ${property.estAnnualYield}% p.a. est. yield`
          : "Minimum investment",
      };
    case "sale":
      return {
        label: "Asking price",
        value: property.salePrice
          ? formatCompactINR(Number(property.salePrice))
          : "—",
        note: property.pricePerSqft
          ? `${formatExactINR(Number(property.pricePerSqft))} per sq.ft.`
          : null,
      };
    case "rent":
      return {
        label: "Monthly rent",
        value: property.monthlyRent
          ? formatCompactINR(Number(property.monthlyRent))
          : "—",
        note: property.securityDeposit
          ? `Deposit ${formatCompactINR(Number(property.securityDeposit))}`
          : null,
      };
  }
}
