import Link from "next/link";
import { ArrowRight, Layers, Scale, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The exit ramp for the visitor who cannot choose.
 *
 * The home page ran hero → stats → three featured listings → why fractional,
 * and every one of those steps asked the same thing: pick a property. There
 * was no path at all for someone who is sold on the idea and stuck on the
 * choice, and "stuck on the choice" is the most common place to lose them —
 * they leave to think about it and do not come back.
 *
 * Placed directly after the featured listings, which is the exact moment the
 * hesitation happens: three assets side by side, no way to tell which is
 * better. Kept to a single band with one link; the argument, the trade-off
 * and the risk language all live on /invest-with-us, because a home page
 * teaser is not the place to make a claim about returns.
 */
const POINTS = [
  {
    icon: Layers,
    text: "Spread across every property we've underwritten, not one building",
  },
  {
    icon: Scale,
    text: "Steadier income — one vacancy can't take it to zero",
  },
  {
    icon: Wallet,
    text: "Lower target return than the best single listing. That's the trade",
  },
];

export function ManagedPlanTeaser() {
  return (
    <section
      className="bg-white py-10 sm:py-14"
      aria-labelledby="managed-plan-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-navy-light px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-wide text-brand-green uppercase">
                Managed portfolio
              </p>
              <h2
                id="managed-plan-heading"
                className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-3xl"
              >
                Can&apos;t decide which property?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Invest with GharShare instead. One commitment, spread across
                the whole portfolio and managed by us — steadier than any
                single asset, at a lower target return than the best one.
                Targeted, not guaranteed.
              </p>

              <ul className="mt-5 space-y-2.5">
                {POINTS.map((point) => {
                  const Icon = point.icon;
                  return (
                    <li key={point.text} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-brand-green">
                        <Icon className="size-3.5" aria-hidden="true" />
                      </span>
                      <span className="text-sm leading-relaxed text-foreground/80">
                        {point.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="shrink-0">
              <Button
                render={<Link href="/invest-with-us" />}
                nativeButton={false}
                className="h-12 w-full gap-2 bg-brand-green px-6 text-white hover:bg-brand-green/90 sm:w-auto"
              >
                See how it works
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <p className="mt-3 max-w-[16rem] text-xs leading-relaxed text-muted-foreground">
                Not a deposit and not a fixed return. Capital is at risk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
