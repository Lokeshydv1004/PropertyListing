import { config } from "dotenv";
config({ path: ".env.local" });

import type { NewProperty } from "../schema";

function placeholderImages(slug: string, count: number) {
  return Array.from(
    { length: count },
    (_, i) => `https://picsum.photos/seed/${slug}-${i}/1200/800`
  );
}

const SAMPLE_PROPERTIES: NewProperty[] = [
  {
    title: "Skyline Residency",
    slug: "skyline-residency-bandra",
    location: "Bandra West, Mumbai",
    propertyType: "Residential Apartment",
    description:
      "A premium residential tower in the heart of Bandra West, offering fractional ownership in a fully-leased apartment block with strong rental demand from young professionals.",
    totalValuation: "50000000",
    fundingTarget: "50000000",
    amountRaised: "31500000",
    minInvestment: "250000",
    estAnnualYield: "9.5",
    investmentHorizon: "5 years",
    fundingDeadline: "2026-10-15",
    status: "fundraising",
    images: placeholderImages("skyline-residency-bandra", 4),
    amenities: ["24/7 Security", "Power Backup", "Covered Parking", "Gym"],
  },
  {
    title: "Whitefield Tech Park Suites",
    slug: "whitefield-tech-park-suites",
    location: "Whitefield, Bangalore",
    propertyType: "Commercial Office",
    description:
      "Grade-A office suites leased to IT tenants near Bangalore's tech corridor, generating stable long-term rental income with annual escalation clauses.",
    totalValuation: "80000000",
    fundingTarget: "80000000",
    amountRaised: "80000000",
    minInvestment: "500000",
    estAnnualYield: "11",
    investmentHorizon: "7 years",
    fundingDeadline: "2026-04-01",
    status: "fully_funded",
    images: placeholderImages("whitefield-tech-park-suites", 5),
    amenities: ["Cafeteria", "Conference Rooms", "High-Speed Internet", "Parking"],
  },
  {
    title: "Koregaon Park Villas",
    slug: "koregaon-park-villas",
    location: "Koregaon Park, Pune",
    propertyType: "Villa",
    description:
      "A gated community of luxury villas in one of Pune's most sought-after neighborhoods, ideal for long-term capital appreciation.",
    totalValuation: "35000000",
    fundingTarget: "35000000",
    amountRaised: "12250000",
    minInvestment: "200000",
    estAnnualYield: "8",
    investmentHorizon: "6 years",
    fundingDeadline: "2026-12-20",
    status: "fundraising",
    images: placeholderImages("koregaon-park-villas", 4),
    amenities: ["Private Garden", "Clubhouse", "Swimming Pool", "24/7 Security"],
  },
  {
    title: "Cyber City Business Hub",
    slug: "cyber-city-business-hub",
    location: "DLF Cyber City, Gurgaon",
    propertyType: "Commercial Office",
    description:
      "A multi-tenant commercial building in DLF Cyber City with a diversified tenant mix across fintech and consulting firms.",
    totalValuation: "120000000",
    fundingTarget: "120000000",
    amountRaised: "45000000",
    minInvestment: "500000",
    estAnnualYield: "10.5",
    investmentHorizon: "7 years",
    fundingDeadline: "2026-11-30",
    status: "fundraising",
    images: placeholderImages("cyber-city-business-hub", 5),
    amenities: ["Food Court", "Conference Rooms", "EV Charging", "Metro Connectivity"],
  },
  {
    title: "Candolim Beachside Residences",
    slug: "candolim-beachside-residences",
    location: "Candolim, Goa",
    propertyType: "Holiday Rental",
    description:
      "A boutique holiday-rental property near Candolim beach, generating income through short-term vacation rentals managed by a professional operator.",
    totalValuation: "28000000",
    fundingTarget: "28000000",
    amountRaised: "28000000",
    minInvestment: "150000",
    estAnnualYield: "12",
    investmentHorizon: "5 years",
    fundingDeadline: "2026-02-28",
    status: "closed",
    images: placeholderImages("candolim-beachside-residences", 4),
    amenities: ["Private Pool", "Beach Access", "Housekeeping", "Managed Rentals"],
  },
  {
    title: "Gachibowli Financial Square",
    slug: "gachibowli-financial-square",
    location: "Gachibowli, Hyderabad",
    propertyType: "Commercial Office",
    description:
      "A modern office complex in Hyderabad's financial district, anchor-leased to a Fortune 500 tenant on a long-term lease.",
    totalValuation: "95000000",
    fundingTarget: "95000000",
    amountRaised: "20000000",
    minInvestment: "500000",
    estAnnualYield: "10",
    investmentHorizon: "8 years",
    fundingDeadline: "2027-01-15",
    status: "fundraising",
    images: placeholderImages("gachibowli-financial-square", 4),
    amenities: ["Anchor Tenant", "Cafeteria", "Parking", "Backup Power"],
  },
  {
    title: "Adyar Riverside Apartments",
    slug: "adyar-riverside-apartments",
    location: "Adyar, Chennai",
    propertyType: "Residential Apartment",
    description:
      "A mid-rise residential development along the Adyar riverside, popular with families and long-term tenants for its central location.",
    totalValuation: "42000000",
    fundingTarget: "42000000",
    amountRaised: "6300000",
    minInvestment: "200000",
    estAnnualYield: "8.5",
    investmentHorizon: "6 years",
    fundingDeadline: "2026-09-10",
    status: "fundraising",
    images: placeholderImages("adyar-riverside-apartments", 4),
    amenities: ["River View", "Gym", "Children's Play Area", "Covered Parking"],
  },
];

async function seed() {
  // Dynamic imports so `config()` above runs before `../client` reads
  // process.env.DATABASE_URL — static imports would otherwise be hoisted
  // ahead of it.
  const { db } = await import("../client");
  const { properties } = await import("../schema");

  console.log(`Seeding ${SAMPLE_PROPERTIES.length} properties...`);

  await db
    .insert(properties)
    .values(SAMPLE_PROPERTIES)
    .onConflictDoNothing({ target: properties.slug });

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
