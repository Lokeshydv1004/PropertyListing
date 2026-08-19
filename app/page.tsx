import { Hero } from "@/components/home/hero";
import { StatsBar } from "@/components/home/stats-bar";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { WhyFractional } from "@/components/home/why-fractional";
import { TrustStrip } from "@/components/home/trust-strip";
import { CtaBanner } from "@/components/home/cta-banner";
import { getFeaturedProperties, getPlatformStats } from "@/lib/queries/properties";

// Without this, Next statically freezes this page (funding stats,
// featured properties) at build time instead of fetching fresh data —
// wrong for a page whose whole point is live funding progress.
export const revalidate = 60;

export default async function Home() {
  const [stats, featuredProperties] = await Promise.all([
    getPlatformStats(),
    getFeaturedProperties(3),
  ]);

  return (
    <>
      <Hero />
      <StatsBar
        propertyCount={stats.propertyCount}
        fundedCount={stats.fundedCount}
        totalRaised={stats.totalRaised}
        cityCount={stats.cityCount}
      />
      <FeaturedProperties properties={featuredProperties} />
      <WhyFractional />
      {/* <TrustStrip /> */}
      <CtaBanner />
    </>
  );
}
