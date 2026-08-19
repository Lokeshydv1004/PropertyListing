import { Hero } from "@/components/home/hero";
import { StatsBar } from "@/components/home/stats-bar";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { ManagedPlanTeaser } from "@/components/home/managed-plan-teaser";
import { WhyFractional } from "@/components/home/why-fractional";
import { HowItWorksSummary } from "@/components/home/how-it-works-summary";
import { FaqTeaser } from "@/components/home/faq-teaser";
import {
  FounderNote,
  Partners,
  Testimonials,
} from "@/components/home/social-proof";
import { CtaBanner } from "@/components/home/cta-banner";
import {
  getFeaturedProperties,
  getMinTicket,
  getPlatformStats,
} from "@/lib/queries/properties";
import { withDbRetry } from "@/lib/with-db-retry";

// Without this, Next statically freezes this page (funding stats,
// featured properties) at build time instead of fetching fresh data —
// wrong for a page whose whole point is live funding progress.
export const revalidate = 60;

export default async function Home() {
  const [stats, featuredProperties, minTicket] = await withDbRetry(() =>
    Promise.all([getPlatformStats(), getFeaturedProperties(3), getMinTicket()])
  );

  return (
    <>
      <Hero minTicket={minTicket} />
      {/*
        There is deliberately no separate trust band here.

        One existed, immediately below the hero, and it repeated the hero
        verbatim: "Title verified", "Escrow held" and "Independent legal"
        were the same three claims as the badges directly above them. The
        duplication was introduced when the hero's unbacked regulatory badges
        ("SEBI Compliant Structure", "Legally Secured") were replaced with
        defensible process claims — which collided with what the band already
        said. On a phone the two blocks sat back to back and read as padding.

        Its other two claims are still made, in the place they carry more
        weight: "fees stated upfront on every listing" and "handled by a
        professional manager" are both in the third Why Fractional pillar,
        with the context that makes them mean something. Nothing was lost by
        removing the band — only the repetition.
      */}
      <StatsBar
        propertyCount={stats.propertyCount}
        fundedCount={stats.fundedCount}
        totalRaised={stats.totalRaised}
        cityCount={stats.cityCount}
      />
      <FeaturedProperties properties={featuredProperties} />
      {/* Immediately after the three listings, which is where "I like this
          but I can't tell which one" happens. See the header comment in
          managed-plan-teaser.tsx. */}
      <ManagedPlanTeaser />
      <WhyFractional />
      {/* Reinstated: the page used to jump from a row of statistics straight
          to ₹5 crore listings, with no explanation of what fractional
          ownership is in between. */}
      <HowItWorksSummary />
      {/* All three render null until they hold real, permissioned material —
          see the header comment in social-proof.tsx. */}
      <Testimonials />
      <Partners />
      <FounderNote />
      <FaqTeaser />
      <CtaBanner />
    </>
  );
}
