import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCompactINR } from "@/lib/format";

export function Hero({
  propertyCount,
  totalRaised,
  avgYield,
}: {
  propertyCount: number;
  totalRaised: number;
  avgYield: number;
}) {
  const stats = [
    { label: "Properties listed", value: `${propertyCount}+` },
    { label: "Raised across the platform", value: formatCompactINR(totalRaised) },
    { label: "Avg. estimated yield", value: `${avgYield.toFixed(1)}%` },
  ];

  return (
    <section className="border-b border-border bg-navy-light">
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
          Own a piece of premium real estate, starting small.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Browse verified properties, submit your interest, and start
          building a fractional real estate portfolio — no crores required.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            render={<Link href="/properties" />}
            nativeButton={false}
            className="h-11 w-full bg-brand-green px-6 text-base text-white hover:bg-brand-green/90 sm:w-auto"
          >
            Browse Properties
          </Button>
          <Button
            render={<Link href="/how-it-works" />}
            nativeButton={false}
            variant="outline"
            className="h-11 w-full bg-background px-6 text-base sm:w-auto"
          >
            How It Works
          </Button>
        </div>

        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-3xl font-semibold text-navy">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
