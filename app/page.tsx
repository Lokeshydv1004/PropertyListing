import { Hero } from "@/components/home/hero";
import { HowItWorksSummary } from "@/components/home/how-it-works-summary";
import { FeaturedProperties } from "@/components/home/featured-properties";
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
      <Hero
        propertyCount={stats.propertyCount}
        totalRaised={stats.totalRaised}
        avgYield={stats.avgYield}
      />
      <HowItWorksSummary />
      <FeaturedProperties properties={featuredProperties} />
      <CtaBanner />
    </>
  );
}
