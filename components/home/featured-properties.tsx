import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";
import type { Property } from "@/db/schema";

export function FeaturedProperties({ properties }: { properties: Property[] }) {
  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-4xl">
                Featured Investment Opportunities
              </h2>
              <Link
                href="/properties"
                className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-gold hover:text-gold/80 sm:flex"
              >
                View All Properties
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-6 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-3 [&::-webkit-scrollbar]:hidden">
              {properties.slice(0, 3).map((property) => (
                <div
                  key={property.id}
                  className="w-[78%] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink"
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center sm:hidden">
              <Link
                href="/properties"
                className="flex items-center gap-1.5 text-sm font-medium text-gold"
              >
                View All Properties
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

      </div>
    </section>
  );
}
