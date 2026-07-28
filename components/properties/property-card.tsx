import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCompactINR, formatPercent } from "@/lib/format";
import type { Property } from "@/db/schema";

const STATUS_LABEL: Record<Property["status"], string> = {
  fundraising: "Fundraising",
  fully_funded: "Fully Funded",
  closed: "Closed",
};

export function PropertyCard({ property }: { property: Property }) {
  const fundingTarget = Number(property.fundingTarget);
  const amountRaised = Number(property.amountRaised);
  const percentFunded =
    fundingTarget > 0
      ? Math.min(100, (amountRaised / fundingTarget) * 100)
      : 0;

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-navy-light">
        {property.images[0] && (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <Badge
          className="absolute top-3 left-3 border-none bg-white/95 text-navy"
        >
          {STATUS_LABEL[property.status]}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-semibold text-navy">{property.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {property.location}
          </p>
        </div>

        <div className="mt-auto space-y-1.5">
          <Progress
            value={percentFunded}
            className="[&_[data-slot=progress-track]]:h-2"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-brand-green">
              {formatPercent(percentFunded)} funded
            </span>
            <span className="text-muted-foreground">
              {formatCompactINR(fundingTarget)} target
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <div>
            <p className="text-muted-foreground">Min. investment</p>
            <p className="font-medium text-foreground">
              {formatCompactINR(Number(property.minInvestment))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Est. yield</p>
            <p className="font-medium text-foreground">
              {property.estAnnualYield}% p.a.
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
