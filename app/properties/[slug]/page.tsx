import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Clock,
  IndianRupee,
  LineChart,
  MapPin,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { PropertyQuickFacts } from "@/components/properties/property-quick-facts";
import { PropertyTags } from "@/components/properties/property-tags";
import { PropertyHighlights } from "@/components/properties/property-highlights";
import { PropertyListCard } from "@/components/properties/property-list-card";
import {
  BuildingPanel,
  ListingTerms,
  priceHeadline,
} from "@/components/properties/listing-terms";
import {
  ListingTypeBadge,
  StatusBadge,
} from "@/components/properties/listing-badges";
import { MobileCtaBar } from "@/components/properties/mobile-cta-bar";
import { TrustPanel } from "@/components/properties/sidebar";
import { InterestForm } from "@/components/properties/interest-form";
import {
  formatArea,
  formatCompactINR,
  formatPercent,
  truncateText,
} from "@/lib/format";
import { CATEGORY_LABEL, STATUS_LABEL, isOpen } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import {
  getPropertyBySlug,
  getSimilarProperties,
} from "@/lib/queries/properties";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {};
  }

  return {
    title: `${property.title} — GharShare`,
    // Google truncates around 155 chars; the raw description ran well past it.
    description: truncateText(
      property.summary ?? property.description,
      155
    ),
    alternates: { canonical: `/properties/${property.slug}` },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const building = property.building;
  const isFractional = property.listingType === "fractional";

  const fundingTarget = Number(property.fundingTarget ?? 0);
  const amountRaised = Number(property.amountRaised ?? 0);
  const percentFunded =
    fundingTarget > 0 ? Math.min(100, (amountRaised / fundingTarget) * 100) : 0;
  const remaining = Math.max(0, fundingTarget - amountRaised);

  const closingDate = property.fundingDeadline
    ? new Date(property.fundingDeadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const price = priceHeadline(property);
  const open = isOpen(property.status);

  const investmentStats = [
    {
      icon: IndianRupee,
      iconClassName: "bg-navy-light text-navy",
      label: "Property value",
      value: property.totalValuation
        ? formatCompactINR(Number(property.totalValuation))
        : "—",
    },
    {
      icon: Wallet,
      iconClassName: "bg-gold-light text-gold-700",
      label: "Min. ticket",
      value: property.minInvestment
        ? formatCompactINR(Number(property.minInvestment))
        : "—",
    },
    {
      icon: TrendingUp,
      iconClassName: "bg-brand-green-light text-brand-green",
      label: "Est. yield",
      value: property.estAnnualYield ? `${property.estAnnualYield}% p.a.` : "—",
    },
    {
      icon: LineChart,
      iconClassName: "bg-gold-light text-gold-700",
      // Shortened from "Projected Appreciation", which wrapped to two lines
      // and dropped its value out of line with the other three stats.
      label: "Appreciation",
      value: property.projectedAppreciation
        ? `${property.projectedAppreciation}% p.a.`
        : "—",
    },
  ];

  const similarProperties = await getSimilarProperties(property, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6 lg:px-8 lg:pb-10">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-navy">
          Home
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <Link href="/properties" className="hover:text-navy">
          Properties
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <span className="text-foreground">{property.title}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <PropertyGallery images={property.images} title={property.title} />

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <ListingTypeBadge listingType={property.listingType} />
              <Badge className="border-none bg-secondary text-secondary-foreground">
                {CATEGORY_LABEL[property.category]}
              </Badge>
              <StatusBadge
                status={property.status}
                percentFunded={isFractional ? percentFunded : undefined}
              />
            </div>

            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
              {property.title}
            </h1>

            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden="true" />
                {property.location}
              </span>
              {property.unitNumber && (
                <span>
                  Unit {property.unitNumber}
                  {property.floorLabel ? ` · ${property.floorLabel}` : ""}
                </span>
              )}
              <span>{formatArea(property.areaSqft)}</span>
            </p>

            {/* The summary, not a truncated copy of the description — the two
                used to render the identical text twice on one page. */}
            {property.summary && (
              <p className="mt-3 text-muted-foreground">{property.summary}</p>
            )}
          </div>

          <PropertyQuickFacts property={property} />
          <PropertyTags tags={property.tags} />

          {isFractional && (
            <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
              <h2 className="font-serif text-lg font-semibold text-navy">
                Investment overview
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
                {investmentStats.map((stat) => (
                  <div key={stat.label} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full",
                        stat.iconClassName
                      )}
                    >
                      <stat.icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 leading-tight">
                      <p
                        className="truncate text-xs text-muted-foreground"
                        title={stat.label}
                      >
                        {stat.label}
                      </p>
                      <p className="mt-1 truncate font-semibold text-navy">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-1.5 border-t border-border pt-6">
                <Progress
                  value={percentFunded}
                  aria-label={`${formatPercent(percentFunded)} of funding target raised`}
                  className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-indicator]]:bg-brand-green"
                />
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
                  <span className="font-medium text-brand-green">
                    {formatPercent(percentFunded)} funded
                  </span>
                  <span className="text-muted-foreground">
                    {formatCompactINR(amountRaised)} raised of{" "}
                    {formatCompactINR(fundingTarget)}
                    {/* Real remaining capital, not an investor headcount
                        derived from amountRaised / minInvestment. */}
                    {remaining > 0 &&
                      ` · ${formatCompactINR(remaining)} remaining`}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                {property.investmentHorizon && (
                  <span className="flex items-center gap-1.5">
                    <CalendarRange className="size-3.5" aria-hidden="true" />
                    {property.investmentHorizon} target hold period
                  </span>
                )}
                {property.status === "fundraising" && closingDate && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" aria-hidden="true" />
                    Closes {closingDate}
                  </span>
                )}
              </div>

              <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                Estimated yield and projected appreciation are forward-looking
                estimates, not guaranteed returns. Please read all
                property-specific documentation before investing.
              </p>
            </div>
          )}

          <ListingTerms property={property} building={building} />

          {building && <BuildingPanel building={building} />}

          <div className="mt-8 rounded-2xl bg-navy-light/50 p-6">
            <TrustPanel />
          </div>

          <div className="mt-8">
            <h2 className="font-serif text-xl font-semibold text-navy">
              About this property
            </h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">
              {property.description}
            </p>
          </div>

          {property.amenities.length > 0 && (
            <div className="mt-8">
              <h2 className="font-serif text-xl font-semibold text-navy">
                Amenities
              </h2>
              {/* Inline chips, not full-width outlined blocks — those read as
                  disabled form fields next to the enquiry form. */}
              <ul className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground/80"
                  >
                    <CheckCircle2
                      className="size-3.5 shrink-0 text-brand-green"
                      aria-hidden="true"
                    />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <PropertyHighlights property={property} />
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div
            id="enquiry"
            className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="border-b border-border bg-navy-light/60 px-6 py-5">
              <p className="text-xs font-medium text-muted-foreground">
                {price.label}
              </p>
              {/* Sans, not serif: Playfair's rupee glyph renders closer to
                  "R3" than "₹3" at display sizes, on the page's key number. */}
              <p className="mt-1 font-sans text-3xl font-semibold tracking-tight text-navy">
                {price.value}
              </p>
              {price.note && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {price.note}
                </p>
              )}
            </div>

            <div className="p-6">
              {open ? (
                <>
                  <h2 className="text-lg font-semibold text-navy">
                    {isFractional
                      ? "Interested in this property?"
                      : "Enquire about this unit"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Share your details and our team will get in touch within one
                    business day.
                  </p>
                  <div className="mt-5">
                    <InterestForm
                      propertyId={property.id}
                      listingType={property.listingType}
                      minInvestment={property.minInvestment}
                    />
                  </div>
                </>
              ) : (
                /* A closed or let listing used to show the same live CTA as an
                   open one, inviting enquiries that cannot be honoured. */
                <div className="text-center">
                  <p className="font-medium text-navy">
                    This listing is {STATUS_LABEL[property.status].toLowerCase()}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Join the waitlist and we&apos;ll tell you first when a
                    similar {CATEGORY_LABEL[property.category].toLowerCase()}{" "}
                    becomes available.
                  </p>
                  <Button
                    render={<Link href="/contact" />}
                    nativeButton={false}
                    className="mt-5 w-full bg-navy text-white hover:bg-navy/90"
                  >
                    Join the waitlist
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {similarProperties.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            {building ? `More units in ${building.name}` : "Similar properties"}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {building
              ? "Other spaces available in the same building"
              : `More opportunities in ${property.city}`}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-col sm:gap-6">
            {similarProperties.map((similar) => (
              <PropertyListCard key={similar.id} property={similar} />
            ))}
          </div>
        </section>
      )}

      <MobileCtaBar
        label={price.label}
        value={price.value}
        open={open}
        listingType={property.listingType}
      />
    </div>
  );
}
