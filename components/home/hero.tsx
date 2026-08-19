import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCompactINR } from "@/lib/format";

/**
 * Claims about our own process, not about our regulatory status.
 *
 * These three lines used to read "SEBI Compliant Structure", "Legally
 * Secured" and "Transparent & Trusted". "SEBI Compliant" is not a badge
 * anyone can self-award — fractional real estate in India sits under SEBI's
 * SM REIT framework, and either you hold a registration number you can print
 * or you are making an unbacked regulatory claim on your home page. Each
 * statement below describes something we control and can evidence on demand.
 */
// const TRUST_POINTS = [
//   { icon: ShieldCheck, label: "Title-verified properties" },
//   { icon: Lock, label: "Funds held in escrow" },
//   { icon: CheckCircle2, label: "Independent legal due diligence" },
// ];

export function Hero({ minTicket }: { minTicket: number | null }) {
  // The copy used to promise "as little as ₹1 Lakh" while the cheapest live
  // listing was ₹2 L. A visitor who clicks that promise and finds a ₹2.5 L
  // minimum feels baited, so the figure comes from the catalogue itself.
  const ticketCopy = minTicket ? formatCompactINR(minTicket) : "a fraction of the cost";
  return (
    <section className="relative -mt-16 overflow-hidden lg:min-h-[530px] bg-[#032E24]">
      <div className="absolute inset-0">
        {/* Below lg the image runs full-bleed behind the text (there's no room
            to reserve a side column), so it needs a flat, even wash rather than
            the side gradient — otherwise wrapped text lands right on top of
            bright window lights and loses contrast. At lg+, image is anchored
            to the right at its native aspect so it's never upscaled past its
            actual resolution (1754px wide) — that's what caused blur before. */}
        <div className="absolute inset-0 lg:left-auto lg:w-[62%]">
          <Image
            src="/assets/images/home-hero.png"
            alt="Featured luxury residential tower at dusk"
            fill
            priority
            sizes="(min-width: 1024px) 62vw, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#032E24]/78 lg:hidden" />
          {/* Gradient lives inside the image's own box now, so 0% here is the box's
              actual left edge — it starts fully opaque (matching bg-navy exactly, no
              seam) and only reveals the photo well after that edge. */}
          <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,#032E24_0%,rgba(3,46,36,0.96)_16%,rgba(3,46,36,0.6)_38%,rgba(3,46,36,0.2)_55%,rgba(3,46,36,0)_70%)] lg:block" />
        </div>
        {/* Thin top scrim so the transparent nav stays legible over bright sky. */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[440px] max-w-[1340px] items-center px-6 py-12 sm:px-8 lg:min-h-[530px] lg:px-10 lg:py-0">
        <div className="max-w-[520px]">
          <h1 className="font-serif text-4xl leading-[0.98] font-semibold tracking-[-1.5px] text-white sm:text-[3rem] lg:text-[52px]">
            Own a piece of{" "}
            <span className="text-gold">premium real estate.</span> Without
            buying the whole property.
          </h1>

          <p className="mt-4 max-w-[430px] text-base leading-[1.45] text-[#D5DDD9]">
            Invest in high-quality properties from {ticketCopy} and earn
            rental income + potential appreciation.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              render={<Link href="/properties" />}
              nativeButton={false}
              className="h-[46px] gap-2 bg-gold px-5 text-sm text-navy hover:bg-gold/90"
            >
              Explore Investment Opportunities
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              render={<Link href="/how-it-works" />}
              nativeButton={false}
              variant="outline"
              className="h-[46px] border-white/35 bg-transparent px-5 text-sm text-white hover:bg-white/10"
            >
              See How It Works
            </Button>
          </div>
{/* 
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7 sm:gap-y-2">
            {TRUST_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.label}
                  className="flex items-center gap-1.5 text-[13px] text-white"
                >
                  <Icon
                    className="size-3.5 shrink-0 text-gold"
                    aria-hidden="true"
                  />
                  {point.label}
                </div>
              );
            })}
          </div> */}
        </div>
      </div>
    </section>
  );
}
