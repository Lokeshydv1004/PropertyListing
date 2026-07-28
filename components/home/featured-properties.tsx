import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";
import type { Property } from "@/db/schema";

export function FeaturedProperties({ properties }: { properties: Property[] }) {
  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="bg-secondary/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-navy">
            Featured properties
          </h2>
          <p className="mt-2 max-w-lg text-muted-foreground">
            A snapshot of properties currently open for fractional
            investment.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/properties"
            className="flex items-center gap-1.5 text-sm font-medium text-navy hover:text-brand-green"
          >
            View all properties
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
