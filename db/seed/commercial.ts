import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import type { NewBuilding, NewProperty } from "../schema";

/**
 * Seeds the retail / F&B / lease-side inventory: malls and office parks as
 * parent buildings, with individual shop, food-court and office units under
 * them, across all three listing types.
 *
 * Images are deliberately left empty. Random stock photography is worse than
 * no photography on a listing that represents a real asset — the UI renders a
 * "Photos coming soon" placeholder instead. Replace with Supabase Storage URLs
 * once real photos exist.
 *
 * Run with: npm run db:seed:commercial
 */

const SAMPLE_BUILDINGS: NewBuilding[] = [
  {
    name: "Crestview Marketcity",
    slug: "crestview-marketcity-kurla",
    buildingType: "mall",
    location: "Kurla West, Mumbai",
    shortLocation: "Kurla West",
    city: "Mumbai",
    description:
      "A five-level regional shopping centre anchored by a multiplex and a hypermarket, serving the central Mumbai catchment. Ground and first levels are fashion and accessories; the third level is a 1,100-seat food court.",
    amenities: [
      "Multi-level Parking",
      "Air Conditioned",
      "Power Backup",
      "Escalators & Lifts",
      "Housekeeping",
      "24/7 Security",
    ],
    totalUnits: 214,
    footfallMonthly: 1_150_000,
    anchorTenants: ["PVR Cinemas", "Lifestyle", "Westside", "Reliance Smart"],
    yearBuilt: 2014,
    images: [],
  },
  {
    name: "Orion Galleria",
    slug: "orion-galleria-whitefield",
    buildingType: "mall",
    location: "Whitefield, Bangalore",
    shortLocation: "Whitefield",
    city: "Bangalore",
    description:
      "A neighbourhood mall on the Whitefield tech corridor with a weekday lunch trade driven by surrounding IT parks and a weekend family catchment.",
    amenities: [
      "Basement Parking",
      "Air Conditioned",
      "Power Backup",
      "Food Court",
      "Valet Parking",
    ],
    totalUnits: 96,
    footfallMonthly: 620_000,
    anchorTenants: ["INOX", "Zudio", "Decathlon"],
    yearBuilt: 2018,
    images: [],
  },
  {
    name: "Cyber Greens Business Park",
    slug: "cyber-greens-business-park",
    buildingType: "office_park",
    location: "DLF Cyber City, Gurgaon",
    shortLocation: "DLF Cyber City",
    city: "Gurgaon",
    description:
      "Grade-A office campus of four towers with a shared retail and F&B podium serving roughly 14,000 desk-based workers on site.",
    amenities: [
      "Grade-A Specification",
      "100% Power Backup",
      "Central Air Conditioning",
      "Food Court",
      "Gymnasium",
      "24/7 Security",
    ],
    totalUnits: 58,
    footfallMonthly: 410_000,
    anchorTenants: ["Accenture", "KPMG", "Concentrix"],
    yearBuilt: 2016,
    images: [],
  },
  {
    name: "Banjara High Street",
    slug: "banjara-high-street",
    buildingType: "high_street",
    location: "Banjara Hills, Hyderabad",
    shortLocation: "Banjara Hills",
    city: "Hyderabad",
    description:
      "A premium high-street retail stretch on Road No. 12, dominated by flagship fashion, jewellery and speciality dining. Strong evening and weekend footfall.",
    amenities: ["Surface Parking", "Wide Frontage", "24/7 Security"],
    totalUnits: 32,
    footfallMonthly: 285_000,
    anchorTenants: ["Starbucks", "Sephora"],
    yearBuilt: 2011,
    images: [],
  },
];

type UnitSeed = Omit<NewProperty, "buildingId"> & { buildingSlug?: string };

const SAMPLE_UNITS: UnitSeed[] = [
  // ---------------------------------------------------------------- RENT ---
  {
    buildingSlug: "crestview-marketcity-kurla",
    title: "Ground Floor Retail Shop — Crestview Marketcity",
    slug: "crestview-marketcity-shop-g12",
    listingType: "rent",
    category: "mall_shop",
    status: "available",
    location: "Kurla West, Mumbai",
    shortLocation: "Kurla West",
    city: "Mumbai",
    propertyType: "Mall Shop",
    unitNumber: "G-12",
    floorLabel: "Ground",
    summary:
      "Ground-floor shop facing the main atrium, on the primary escalator path between the hypermarket and the fashion wing.",
    description:
      "A 620 sq.ft. ground-floor unit in Crestview Marketcity with 18 ft of glazed frontage facing the central atrium.\n\nThe unit sits on the main circulation path between the hypermarket entrance and the escalator bank serving the fashion levels, which is the highest-dwell corridor in the centre. Suited to accessories, footwear, eyewear or a quick-service beverage brand.\n\nHanded over as a warm shell: flooring, false ceiling grid, and a 12 kVA sanctioned load in place. Fit-out is the tenant's scope, with a 45-day rent-free period for the works.",
    areaSqft: "620",
    carpetAreaSqft: "545",
    frontageFt: "18",
    monthlyRent: "465000",
    securityDeposit: "2790000",
    leaseTermMonths: 60,
    lockInMonths: 36,
    rentEscalationPct: "15",
    camPerSqftMonthly: "38",
    availableFrom: "2026-10-01",
    furnishingStatus: "Warm Shell",
    footfallMonthly: 1_150_000,
    powerLoadKva: "12",
    possessionStatus: "Ready to Move-in",
    images: [],
    amenities: ["Air Conditioned", "Power Backup", "Customer Parking", "Housekeeping"],
    highlights: [
      "18 ft glazed frontage onto the central atrium",
      "On the hypermarket-to-escalator circulation path",
      "45-day rent-free fit-out period",
      "12 kVA sanctioned load already in place",
    ],
    tags: ["High Footfall", "Atrium Facing", "Warm Shell"],
  },
  {
    buildingSlug: "crestview-marketcity-kurla",
    title: "Food Court Counter — Crestview Marketcity",
    slug: "crestview-marketcity-food-court-fc04",
    listingType: "rent",
    category: "food_court_unit",
    status: "available",
    location: "Kurla West, Mumbai",
    shortLocation: "Kurla West",
    city: "Mumbai",
    propertyType: "Food Court Unit",
    unitNumber: "FC-04",
    floorLabel: "Level 3",
    summary:
      "Fully serviced food-court counter with kitchen provisioning, sharing 1,100 seats on the mall's dining level.",
    description:
      "A 340 sq.ft. counter unit on the third-level food court, sharing a common seating hall of approximately 1,100 covers with sixteen other operators.\n\nThe unit comes with kitchen provisioning already in place: dedicated exhaust ducting to the terrace, piped gas connection, grease trap and drainage, and a 25 kVA sanctioned load. Common seating, table clearing and hall housekeeping are managed by the centre and recovered through CAM.\n\nSuited to a QSR or regional cuisine brand. Trading hours are mall hours, 11:00 to 22:00, seven days.",
    areaSqft: "340",
    carpetAreaSqft: "310",
    frontageFt: "14",
    monthlyRent: "238000",
    securityDeposit: "1428000",
    leaseTermMonths: 36,
    lockInMonths: 24,
    rentEscalationPct: "12",
    camPerSqftMonthly: "52",
    availableFrom: "2026-09-15",
    furnishingStatus: "Kitchen Provisioned",
    footfallMonthly: 1_150_000,
    seatingCapacity: 1100,
    hasKitchenProvision: true,
    powerLoadKva: "25",
    possessionStatus: "Ready to Move-in",
    images: [],
    amenities: [
      "Shared Seating (1,100 covers)",
      "Exhaust Ducting",
      "Piped Gas",
      "Grease Trap & Drainage",
      "Managed Housekeeping",
    ],
    highlights: [
      "Kitchen provisioning already installed — exhaust, gas, drainage",
      "25 kVA sanctioned load",
      "1,100 shared covers, cleared and managed by the centre",
      "Adjacent to the multiplex ticketing lobby",
    ],
    tags: ["Kitchen Ready", "High Footfall", "QSR Suitable"],
  },
  {
    buildingSlug: "orion-galleria-whitefield",
    title: "First Floor Shop — Orion Galleria",
    slug: "orion-galleria-shop-f07",
    listingType: "rent",
    category: "mall_shop",
    status: "available",
    location: "Whitefield, Bangalore",
    shortLocation: "Whitefield",
    city: "Bangalore",
    propertyType: "Mall Shop",
    unitNumber: "F-07",
    floorLabel: "Level 1",
    summary:
      "First-floor unit beside the escalator landing, in the mall's fashion and lifestyle cluster.",
    description:
      "A 480 sq.ft. first-floor unit positioned at the escalator landing, within the fashion and lifestyle cluster.\n\nWeekday trade is driven by the surrounding IT parks — the catchment includes roughly 40,000 desk-based workers within two kilometres — with a family-led weekend profile. Handed over as a bare shell.",
    areaSqft: "480",
    carpetAreaSqft: "420",
    frontageFt: "14",
    monthlyRent: "168000",
    securityDeposit: "1008000",
    leaseTermMonths: 36,
    lockInMonths: 24,
    rentEscalationPct: "15",
    camPerSqftMonthly: "32",
    availableFrom: "2026-09-01",
    furnishingStatus: "Bare Shell",
    footfallMonthly: 620_000,
    powerLoadKva: "8",
    possessionStatus: "Ready to Move-in",
    images: [],
    amenities: ["Air Conditioned", "Power Backup", "Basement Parking"],
    highlights: [
      "Directly at the first-floor escalator landing",
      "~40,000 desk-based workers within 2 km",
      "Within the mall's fashion cluster",
    ],
    tags: ["Escalator Facing", "Tech Corridor"],
  },
  {
    buildingSlug: "cyber-greens-business-park",
    title: "Half-Floor Office Suite — Cyber Greens",
    slug: "cyber-greens-office-t2-604",
    listingType: "rent",
    category: "commercial_office",
    status: "available",
    location: "DLF Cyber City, Gurgaon",
    shortLocation: "DLF Cyber City",
    city: "Gurgaon",
    propertyType: "Commercial Office",
    unitNumber: "T2-604",
    floorLabel: "Level 6",
    summary:
      "8,400 sq.ft. warm-shell office half-floor in a Grade-A campus, with 140 car parks.",
    description:
      "A half-floor suite of 8,400 sq.ft. on the sixth level of Tower 2, offered as a warm shell with raised flooring, central air conditioning and 100% DG backup.\n\nThe campus runs a shared retail and F&B podium and is a six-minute walk from the Rapid Metro station. 140 car parking bays are allocated to the unit.",
    areaSqft: "8400",
    carpetAreaSqft: "6720",
    monthlyRent: "1092000",
    securityDeposit: "6552000",
    leaseTermMonths: 60,
    lockInMonths: 36,
    rentEscalationPct: "15",
    camPerSqftMonthly: "22",
    availableFrom: "2026-11-01",
    furnishingStatus: "Warm Shell",
    possessionStatus: "Ready to Move-in",
    images: [],
    amenities: [
      "Central Air Conditioning",
      "100% Power Backup",
      "Raised Flooring",
      "140 Car Parks",
      "Food Court on Campus",
    ],
    highlights: [
      "6-minute walk to Rapid Metro",
      "140 allocated car parking bays",
      "100% DG backup at Grade-A specification",
      "Shared F&B podium on campus",
    ],
    tags: ["Grade-A", "Metro Connected", "Warm Shell"],
  },
  {
    buildingSlug: "banjara-high-street",
    title: "Corner Restaurant Space — Banjara High Street",
    slug: "banjara-high-street-restaurant-r03",
    listingType: "rent",
    category: "restaurant_space",
    status: "under_offer",
    location: "Banjara Hills, Hyderabad",
    shortLocation: "Banjara Hills",
    city: "Hyderabad",
    propertyType: "Restaurant Space",
    unitNumber: "R-03",
    floorLabel: "Ground + Mezzanine",
    summary:
      "Corner restaurant unit with 32 ft frontage, terrace rights and full kitchen provisioning.",
    description:
      "A 2,150 sq.ft. corner unit across ground and mezzanine levels on Road No. 12, with 32 ft of frontage on two sides and rights to a 600 sq.ft. terrace.\n\nFull kitchen provisioning is in place — exhaust to terrace, piped gas, grease interceptor and a 45 kVA sanctioned load. Seats approximately 90 covers indoors plus 40 on the terrace. Suited to a full-service dining or premium café format.",
    areaSqft: "2150",
    carpetAreaSqft: "1820",
    frontageFt: "32",
    monthlyRent: "645000",
    securityDeposit: "3870000",
    leaseTermMonths: 60,
    lockInMonths: 36,
    rentEscalationPct: "12",
    camPerSqftMonthly: "18",
    availableFrom: "2026-12-01",
    furnishingStatus: "Kitchen Provisioned",
    footfallMonthly: 285_000,
    seatingCapacity: 130,
    hasKitchenProvision: true,
    powerLoadKva: "45",
    possessionStatus: "Ready to Move-in",
    images: [],
    amenities: [
      "Terrace Rights",
      "Piped Gas",
      "Exhaust to Terrace",
      "Grease Interceptor",
      "Surface Parking",
    ],
    highlights: [
      "32 ft frontage on a two-side corner",
      "600 sq.ft. terrace with seating rights",
      "45 kVA load and full kitchen provisioning",
      "~130 covers across indoor and terrace",
    ],
    tags: ["Corner Unit", "Terrace", "Kitchen Ready"],
  },
  {
    title: "Logistics Warehouse — Bhiwandi",
    slug: "bhiwandi-logistics-warehouse-w9",
    listingType: "rent",
    category: "warehouse",
    status: "available",
    location: "Bhiwandi, Mumbai",
    shortLocation: "Bhiwandi",
    city: "Mumbai",
    propertyType: "Warehouse",
    summary:
      "42,000 sq.ft. Grade-A warehouse with 12 m clear height and eight dock levellers.",
    description:
      "A 42,000 sq.ft. Grade-A warehousing unit in the Bhiwandi logistics cluster, with 12 metre clear height, FM2 flooring rated to 6 t/sq.m, and eight dock levellers.\n\nThe park is fully compliant with fire-safety norms including a sprinkler system, and sits 4 km from the Mumbai–Nashik highway junction.",
    areaSqft: "42000",
    monthlyRent: "1050000",
    securityDeposit: "6300000",
    leaseTermMonths: 108,
    lockInMonths: 60,
    rentEscalationPct: "5",
    camPerSqftMonthly: "3",
    availableFrom: "2026-10-15",
    furnishingStatus: "Bare Shell",
    possessionStatus: "Ready to Move-in",
    images: [],
    amenities: [
      "8 Dock Levellers",
      "12 m Clear Height",
      "FM2 Flooring",
      "Sprinkler System",
      "24/7 Security",
    ],
    highlights: [
      "12 m clear height, FM2 flooring rated 6 t/sq.m",
      "8 dock levellers",
      "4 km from the Mumbai–Nashik highway junction",
    ],
    tags: ["Grade-A", "Logistics Cluster"],
  },

  // ---------------------------------------------------------------- SALE ---
  {
    buildingSlug: "orion-galleria-whitefield",
    title: "Ground Floor Shop for Sale — Orion Galleria",
    slug: "orion-galleria-shop-g03-sale",
    listingType: "sale",
    category: "mall_shop",
    status: "available",
    location: "Whitefield, Bangalore",
    shortLocation: "Whitefield",
    city: "Bangalore",
    propertyType: "Mall Shop",
    unitNumber: "G-03",
    floorLabel: "Ground",
    summary:
      "Ground-floor shop for outright purchase, currently let to a national eyewear brand at ₹1.4 L per month.",
    description:
      "A 410 sq.ft. ground-floor unit offered for outright purchase with the existing tenancy in place.\n\nThe unit is let to a national eyewear retailer until March 2029 at ₹1,40,000 per month, with a 15% escalation due in 2027. On the asking price this represents a gross yield of roughly 6.4%.\n\nTitle is clear and the unit is registered under the project's RERA approval.",
    areaSqft: "410",
    carpetAreaSqft: "358",
    frontageFt: "12",
    salePrice: "26000000",
    pricePerSqft: "63415",
    maintenanceMonthly: "13120",
    monthlyRent: "140000",
    possessionStatus: "Ready to Move-in",
    reraNumber: "PRM/KA/RERA/1251/446/PR/180214/002456",
    footfallMonthly: 620_000,
    images: [],
    amenities: ["Air Conditioned", "Power Backup", "Basement Parking"],
    highlights: [
      "Let to a national eyewear brand until March 2029",
      "~6.4% gross yield on the asking price",
      "15% rent escalation due in 2027",
      "Clear title, RERA registered",
    ],
    tags: ["Tenanted", "Income Producing", "RERA Registered"],
  },
  {
    title: "Sea-Facing Apartment for Sale — Marine Drive",
    slug: "marine-drive-apartment-sale-1204",
    listingType: "sale",
    category: "residential_apartment",
    status: "available",
    location: "Marine Drive, Kochi",
    shortLocation: "Marine Drive",
    city: "Kochi",
    propertyType: "Residential Apartment",
    unitNumber: "1204",
    floorLabel: "Level 12",
    summary:
      "3 BHK sea-facing apartment of 1,680 sq.ft. on the twelfth floor, with two covered car parks.",
    description:
      "A 1,680 sq.ft. three-bedroom apartment on the twelfth floor with an uninterrupted backwater view across Marine Drive.\n\nThe unit is fully furnished, comes with two covered car parking bays, and the building provides 100% power backup and a residents' gym. Handover is immediate.",
    areaSqft: "1680",
    carpetAreaSqft: "1310",
    bedrooms: 3,
    salePrice: "21500000",
    pricePerSqft: "12798",
    maintenanceMonthly: "8400",
    possessionStatus: "Ready to Move-in",
    reraNumber: "K-RERA/PRJ/KKD/044/2021",
    images: [],
    amenities: [
      "Sea Facing",
      "2 Covered Parking",
      "100% Power Backup",
      "Gymnasium",
      "24/7 Security",
    ],
    highlights: [
      "Uninterrupted backwater view from the 12th floor",
      "Fully furnished, immediate handover",
      "Two covered car parking bays",
    ],
    tags: ["Sea Facing", "Furnished", "Ready to Move-in"],
  },

  // ---------------------------------------------------------- FRACTIONAL ---
  {
    buildingSlug: "crestview-marketcity-kurla",
    title: "Anchor Retail Block — Crestview Marketcity",
    slug: "crestview-marketcity-anchor-block",
    listingType: "fractional",
    category: "mall_shop",
    status: "fundraising",
    location: "Kurla West, Mumbai",
    shortLocation: "Kurla West",
    city: "Mumbai",
    propertyType: "Mall Shop",
    unitNumber: "A-01",
    floorLabel: "Ground + Level 1",
    summary:
      "Co-invest in a 4,200 sq.ft. anchor retail block let to a national fashion retailer on a nine-year lease.",
    description:
      "A 4,200 sq.ft. anchor block spanning ground and first levels, let to a national fashion retailer on a nine-year lease with a five-year lock-in and 15% escalation every three years.\n\nThe tenant has traded from this location since 2019 and renewed in 2025. Rent is ₹31.5 L per month against a total valuation of ₹42 Cr, giving a gross yield of about 9%.\n\nThe fractional raise is for the full block; investors hold a proportional share of the rental income and of the sale proceeds at the end of the eight-year horizon.",
    areaSqft: "4200",
    carpetAreaSqft: "3650",
    frontageFt: "46",
    totalValuation: "420000000",
    fundingTarget: "420000000",
    amountRaised: "147000000",
    minInvestment: "500000",
    estAnnualYield: "9",
    projectedAppreciation: "7.5",
    investmentHorizon: "8 years",
    fundingDeadline: "2027-01-31",
    investorCount: 0,
    monthlyRent: "3150000",
    leaseTermMonths: 108,
    lockInMonths: 60,
    rentEscalationPct: "15",
    footfallMonthly: 1_150_000,
    possessionStatus: "Ready to Move-in",
    images: [],
    amenities: ["Air Conditioned", "Power Backup", "Customer Parking"],
    highlights: [
      "Let to a national fashion retailer until 2034",
      "Tenant in occupation since 2019, renewed 2025",
      "15% escalation every three years",
      "46 ft frontage across two levels",
    ],
    tags: ["Anchor Tenant", "Long Lease", "Income Producing"],
  },
  {
    buildingSlug: "cyber-greens-business-park",
    title: "Food Court Block — Cyber Greens",
    slug: "cyber-greens-food-court-block",
    listingType: "fractional",
    category: "food_court_unit",
    status: "fundraising",
    location: "DLF Cyber City, Gurgaon",
    shortLocation: "DLF Cyber City",
    city: "Gurgaon",
    propertyType: "Food Court Unit",
    unitNumber: "P-FC",
    floorLabel: "Podium",
    summary:
      "Co-invest in a nine-counter food court serving a 14,000-worker office campus, fully let on individual operator leases.",
    description:
      "The complete podium-level food court at Cyber Greens Business Park: nine operator counters and a 480-cover shared seating hall, totalling 6,800 sq.ft.\n\nAll nine counters are let on three-year operator leases with staggered expiries, which spreads renewal risk rather than concentrating it in a single tenant. Weekday trade is underpinned by roughly 14,000 desk-based workers on the campus, with lunch representing the dominant daypart.\n\nCombined rent across the nine counters is ₹18.7 L per month against a valuation of ₹24 Cr — a gross yield of about 9.4%.",
    areaSqft: "6800",
    carpetAreaSqft: "5900",
    totalValuation: "240000000",
    fundingTarget: "240000000",
    amountRaised: "62400000",
    minInvestment: "300000",
    estAnnualYield: "9.4",
    projectedAppreciation: "6.5",
    investmentHorizon: "7 years",
    fundingDeadline: "2027-03-15",
    investorCount: 0,
    monthlyRent: "1870000",
    rentEscalationPct: "12",
    footfallMonthly: 410_000,
    seatingCapacity: 480,
    hasKitchenProvision: true,
    powerLoadKva: "180",
    possessionStatus: "Ready to Move-in",
    images: [],
    amenities: [
      "480 Shared Covers",
      "Central Exhaust",
      "Piped Gas",
      "Managed Housekeeping",
      "Campus Parking",
    ],
    highlights: [
      "Nine counters let on staggered three-year leases",
      "~14,000 desk-based workers on campus",
      "Tenant risk spread across nine operators, not one",
      "9.4% gross yield on valuation",
    ],
    tags: ["Multi-Tenant", "Campus Catchment", "Income Producing"],
  },
];

async function seedCommercial() {
  // Dynamic imports so `config()` above runs before `../client` reads
  // process.env.DATABASE_URL — static imports would otherwise be hoisted
  // ahead of it.
  const { db } = await import("../client");
  const { buildings, properties } = await import("../schema");
  const { sql } = await import("drizzle-orm");

  /** `excluded.<column>` for upsert SET clauses. */
  const excluded = (column: string) => sql.raw(`excluded.${column}`);

  // console.log(`Seeding ${SAMPLE_BUILDINGS.length} buildings...`);

  await db
    .insert(buildings)
    .values(SAMPLE_BUILDINGS)
    .onConflictDoUpdate({
      target: buildings.slug,
      set: {
        name: excluded("name"),
        buildingType: excluded("building_type"),
        description: excluded("description"),
        amenities: excluded("amenities"),
        totalUnits: excluded("total_units"),
        footfallMonthly: excluded("footfall_monthly"),
        anchorTenants: excluded("anchor_tenants"),
      },
    });

  const buildingRows = await db
    .select({ id: buildings.id, slug: buildings.slug })
    .from(buildings);
  const idBySlug = new Map(buildingRows.map((row) => [row.slug, row.id]));

  const units: NewProperty[] = SAMPLE_UNITS.map(({ buildingSlug, ...unit }) => ({
    ...unit,
    buildingId: buildingSlug ? idBySlug.get(buildingSlug) ?? null : null,
  }));

  // console.log(`Seeding ${units.length} commercial / retail units...`);

  for (const unit of units) {
    await db
      .insert(properties)
      .values(unit)
      .onConflictDoUpdate({ target: properties.slug, set: unit });
  }

  const [totals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      fractional: sql<number>`count(*) filter (where listing_type = 'fractional')::int`,
      sale: sql<number>`count(*) filter (where listing_type = 'sale')::int`,
      rent: sql<number>`count(*) filter (where listing_type = 'rent')::int`,
    })
    .from(properties);

  // console.log(
  //   `Done. ${totals.total} properties total — ` +
  //     `${totals.fractional} fractional, ${totals.sale} for sale, ${totals.rent} for rent.`
  // );
  process.exit(0);
}

seedCommercial().catch((error) => {
  // console.error("Commercial seed failed:", error);
  process.exit(1);
});
