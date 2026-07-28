import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { InterestForm } from "@/components/properties/interest-form";
import { formatCompactINR, formatPercent } from "@/lib/format";
import { getPropertyBySlug } from "@/lib/queries/properties";
import type { Property } from "@/db/schema";

const STATUS_LABEL: Record<Property["status"], string> = {
  fundraising: "Fundraising",
  fully_funded: "Fully Funded",
  closed: "Closed",
};

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
    description: property.description,
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

  const fundingTarget = Number(property.fundingTarget);
  const amountRaised = Number(property.amountRaised);
  const percentFunded =
    fundingTarget > 0
      ? Math.min(100, (amountRaised / fundingTarget) * 100)
      : 0;

  const stats = [
    {
      label: "Total valuation",
      value: formatCompactINR(Number(property.totalValuation)),
    },
    {
      label: "Min. investment",
      value: formatCompactINR(Number(property.minInvestment)),
    },
    { label: "Est. annual yield", value: `${property.estAnnualYield}% p.a.` },
    { label: "Investment horizon", value: property.investmentHorizon },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-navy">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/properties" className="hover:text-navy">
          Properties
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{property.title}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <PropertyGallery images={property.images} title={property.title} />

          <div className="mt-8">
            <Badge className="border-none bg-navy-light text-navy">
              {STATUS_LABEL[property.status]}
            </Badge>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy">
              {property.title}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {property.location} · {property.propertyType}
            </p>
          </div>

          <div className="mt-5 space-y-1.5">
            <Progress
              value={percentFunded}
              className="[&_[data-slot=progress-track]]:h-2"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-brand-green">
                {formatPercent(percentFunded)} funded
              </span>
              <span className="text-muted-foreground">
                {formatCompactINR(amountRaised)} raised of{" "}
                {formatCompactINR(fundingTarget)}
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6 rounded-2xl border border-border p-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 font-semibold text-navy">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-navy">
              About this property
            </h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">
              {property.description}
            </p>
          </div>

          {property.amenities.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-navy">Amenities</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="rounded-lg bg-navy-light px-3 py-2 text-sm text-navy"
                  >
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-navy">
              Submit Interest
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us how much you&apos;d like to invest and we&apos;ll be in
              touch.
            </p>
            <div className="mt-5">
              <InterestForm
                propertyId={property.id}
                minInvestment={property.minInvestment}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
