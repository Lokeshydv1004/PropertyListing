import Link from "next/link";
import { parseDocuments } from "@/lib/documents";
import {
  AlertTriangle,
  CalendarClock,
  Download,
  FileText,
  MapPin,
  Percent,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { formatCompactINR, formatPercent } from "@/lib/format";
import type { Property } from "@/db/schema";

/**
 * Everything a serious investor needed and could not find anywhere.
 *
 * The detail page showed a gallery, four headline stats and a description.
 * It could not answer: what does this cost me, who is the tenant, what
 * documents can I read, what could go wrong with *this* property, who manages
 * it, or where is it actually located. Those are the questions that decide a
 * six-figure commitment, and their absence read as evasion.
 *
 * Every block here renders only when the underlying data exists. An empty
 * section is worse than no section — it advertises what you are not telling
 * people — so a listing with nothing recorded shows nothing, and the gap is
 * visible in the CMS rather than papered over on the page.
 */

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof FileText;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-light text-navy">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-serif text-xl font-semibold text-navy">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** Fees, stated. Silence here reads as "hidden fees", and rightly. */
export function PropertyFees({ property }: { property: Property }) {
  const rows = [
    property.platformFeePct && {
      name: "Platform fee",
      value: `${property.platformFeePct}% of the amount you invest`,
      when: "One time, at onboarding",
    },
    property.managementFeePct && {
      name: "Annual management fee",
      value: `${property.managementFeePct}% of rent collected`,
      when: "Deducted before each distribution",
    },
    property.exitFeePct && {
      name: "Exit fee",
      value: `${property.exitFeePct}% of gains`,
      when: "On sale, from the proceeds",
    },
  ].filter(Boolean) as { name: string; value: string; when: string }[];

  if (rows.length === 0) return null;

  return (
    <Section
      icon={Percent}
      title="Fees on this property"
      subtitle="Nothing is deducted that is not on this list and in your documentation."
    >
      {/* Cards below sm, table above — a three-column fee table scrolled its
          amounts off-screen on a phone, which is the one thing it exists for. */}
      <ul className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <li
            key={row.name}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 bg-navy-light px-4 py-2.5">
              <span className="text-sm font-semibold text-navy">
                {row.name}
              </span>
              <span className="text-sm font-semibold text-brand-green">
                {row.value}
              </span>
            </div>
            <p className="px-4 py-2.5 text-xs text-muted-foreground">
              {row.when}
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-xl border border-border sm:block">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.name}>
                <th
                  scope="row"
                  className="px-4 py-3 text-left font-medium text-navy"
                >
                  {row.name}
                </th>
                <td className="px-4 py-3 font-medium text-brand-green">
                  {row.value}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{row.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/**
 * The yield's working. "9.4% p.a." with nothing behind it is an assertion;
 * rent, occupancy and escalation are the evidence for it.
 */
export function PropertyIncome({ property }: { property: Property }) {
  const rent = property.monthlyRent ? Number(property.monthlyRent) : null;

  const rows = [
    rent && { label: "Monthly rent", value: formatCompactINR(rent) },
    rent && {
      label: "Annualised rent",
      value: formatCompactINR(rent * 12),
    },
    property.occupancyRate && {
      label: "Occupancy",
      value: formatPercent(Number(property.occupancyRate)),
    },
    property.estAnnualYield && {
      label: "Gross yield on valuation",
      value: `${property.estAnnualYield}% p.a.`,
    },
    property.rentEscalationPct && {
      label: "Rent escalation",
      value: `${property.rentEscalationPct}% per cycle`,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  if (rows.length < 2) return null;

  return (
    <Section
      icon={FileText}
      title="How the income works"
      subtitle="The figures the estimated yield is calculated from."
    >
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="font-semibold text-navy">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/** For a leased asset, the lease is the investment. */
export function PropertyTenant({ property }: { property: Property }) {
  if (!property.tenantName) return null;

  const leaseEnd = property.leaseEndDate
    ? new Date(property.leaseEndDate).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Section icon={UserCheck} title="The tenant">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-lg font-semibold text-navy">{property.tenantName}</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {leaseEnd && (
            <div className="flex items-center gap-2.5">
              <CalendarClock
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="leading-tight">
                <dt className="text-xs text-muted-foreground">Lease ends</dt>
                <dd className="font-medium text-navy">{leaseEnd}</dd>
              </div>
            </div>
          )}
          {property.lockInMonths && (
            <div className="flex items-center gap-2.5">
              <CalendarClock
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="leading-tight">
                <dt className="text-xs text-muted-foreground">Lock-in</dt>
                <dd className="font-medium text-navy">
                  {property.lockInMonths} months
                </dd>
              </div>
            </div>
          )}
        </dl>
      </div>
    </Section>
  );
}

/**
 * Downloadable documents are the strongest trust signal available to a
 * platform, and the site offered none.
 */
export function PropertyDocuments({ property }: { property: Property }) {
  if (property.documents.length === 0) return null;

  return (
    <Section
      icon={Download}
      title="Documents"
      subtitle="Read these before you commit. Ask us for anything that is missing."
    >
      <ul className="space-y-2">
        {/* Labels are stored with the URL now ("Title report|https://…"), so
            the name is whatever the team typed. Entries without a label fall
            back to the filename exactly as before — which stopped producing
            anything readable once uploads started generating UUID names. */}
        {parseDocuments(property.documents).map(({ label, url }) => {
          return (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-brand-green"
              >
                <FileText
                  className="size-4 shrink-0 text-navy"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy capitalize">
                  {label}
                </span>
                <Download
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </a>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

/**
 * Risks specific to this asset.
 *
 * Generic FAQ risk text is not the same as "the lease on this unit expires in
 * 2029 and the tenant has not indicated whether they will renew". Naming the
 * real risk builds more trust than omitting it, and omitting it is the thing
 * that gets platforms into trouble.
 */
export function PropertyRisks({ property }: { property: Property }) {
  if (property.propertyRisks.length === 0) return null;

  return (
    <Section
      icon={ShieldAlert}
      title="Risks specific to this property"
      subtitle="In addition to the general risks set out in our risk disclosure."
    >
      <ul className="space-y-2.5">
        {property.propertyRisks.map((risk) => (
          <li
            key={risk}
            className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold-light/30 px-4 py-3"
          >
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0 text-gold-700"
              aria-hidden="true"
            />
            <span className="text-sm leading-relaxed text-foreground/85">
              {risk}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted-foreground">
        Read the full{" "}
        <Link
          href="/risk-disclosure"
          className="font-medium text-navy underline underline-offset-2"
        >
          risk disclosure
        </Link>
        .
      </p>
    </Section>
  );
}

/**
 * Location and management.
 *
 * Deliberately not an embedded map: every third-party map embed loads a
 * tracking script, which contradicts the privacy policy's current statement
 * that this site sets no cross-site tracking cookies. A link out to the
 * coordinates does the same job with none of that, and works offline of any
 * API key. Swap in an embed when you add a consent banner.
 */
export function PropertyLocation({ property }: { property: Property }) {
  const hasCoords = property.latitude && property.longitude;
  if (!hasCoords && !property.managedBy && !property.yearBuilt) return null;

  return (
    <Section icon={MapPin} title="Location and management">
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <dt className="text-xs text-muted-foreground">Address</dt>
          <dd className="mt-0.5 font-medium text-navy">{property.location}</dd>
          {hasCoords && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-navy underline underline-offset-2 hover:text-brand-green"
            >
              <MapPin className="size-3.5" aria-hidden="true" />
              Open in Maps
            </a>
          )}
        </div>

        {property.managedBy && (
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <dt className="text-xs text-muted-foreground">Managed by</dt>
            <dd className="mt-0.5 font-medium text-navy">
              {property.managedBy}
            </dd>
          </div>
        )}

        {property.yearBuilt && (
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <dt className="text-xs text-muted-foreground">Year built</dt>
            <dd className="mt-0.5 font-medium text-navy">
              {property.yearBuilt}
            </dd>
          </div>
        )}

        {property.reraNumber && (
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <dt className="text-xs text-muted-foreground">
              RERA registration
            </dt>
            {/* Verifiable equals credible: this is checkable on the state
                authority's portal, which is the entire point of showing it. */}
            <dd className="mt-0.5 font-mono text-sm font-medium break-all text-navy">
              {property.reraNumber}
            </dd>
          </div>
        )}
      </dl>
    </Section>
  );
}
