import { Building2, CheckCircle2, IndianRupee, MapPin } from "lucide-react";
import { formatCompactINR } from "@/lib/format";

/**
 * Platform stats — every figure computed from the database.
 *
 * The previous version hardcoded "327+ Happy Investors" and "₹56.2 L+ Rental
 * Income Distributed", neither of which was true, and labelled the total
 * property count as "Properties Funded". The listing page's sidebar carried a
 * different investor number again (500+), so a visitor who noticed both had
 * good reason to distrust every other number on the site — including the
 * yields. Nothing here is a claim we cannot substantiate from a query.
 */
export function StatsBar({
  propertyCount,
  fundedCount,
  totalRaised,
  cityCount,
}: {
  propertyCount: number;
  fundedCount: number;
  totalRaised: number;
  cityCount: number;
}) {
  const stats = [
    { icon: Building2, value: String(propertyCount), label: "Properties listed" },
    { icon: CheckCircle2, value: String(fundedCount), label: "Fully funded" },
    {
      icon: IndianRupee,
      value: formatCompactINR(totalRaised),
      label: "Committed by investors",
    },
    { icon: MapPin, value: String(cityCount), label: "Cities" },
  ];

  return (
    <section className="border-b border-[#E5E5E5] bg-white">
      {/* 2×2 on mobile, not 4-across. Four columns at 390px left ~90px each
          and forced 9px labels — below any reasonable legibility floor, on
          the site's trust content. */}
      <div className="mx-auto grid max-w-[1340px] grid-cols-2 gap-x-4 gap-y-5 px-4 py-6 sm:grid-cols-4 sm:px-8 lg:divide-x lg:divide-[#E5E5E5] lg:px-10 lg:py-7">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-2.5 lg:justify-center lg:px-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold-700">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-[#111111] sm:text-xl lg:text-[26px]">
                  {stat.value}
                </p>
                <p className="text-[11px] leading-tight text-[#555555] sm:text-xs">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
