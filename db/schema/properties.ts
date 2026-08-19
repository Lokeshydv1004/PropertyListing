import {
  pgEnum,
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { buildings } from "./buildings";

/**
 * How this listing is transacted. This is the single most important
 * column on the table — it decides which price fields are meaningful,
 * which status values are valid, and what the card and detail page show.
 *
 *   fractional — co-invest in a raise (funding bar, min ticket, yield)
 *   sale       — buy the unit outright (asking price, price per sq.ft.)
 *   rent       — lease the unit (monthly rent, deposit, lease term, CAM)
 */
export const listingTypeEnum = pgEnum("listing_type", [
  "fractional",
  "sale",
  "rent",
]);

/**
 * What the asset actually is. Replaces the old free-text `property_type`,
 * which allowed silent typos to create new filter options.
 *
 * Display labels live in `lib/taxonomy.ts` — keep the two in sync.
 */
export const propertyCategoryEnum = pgEnum("property_category", [
  // Residential
  "residential_apartment",
  "villa",
  "plot_land",
  // Workspace
  "commercial_office",
  "coworking_space",
  // Retail
  "retail_shop",
  "mall_shop",
  "showroom",
  // Food & beverage
  "food_court_unit",
  "restaurant_space",
  // Industrial & hospitality
  "warehouse",
  "holiday_rental",
]);

/**
 * Unified status across all three listing types.
 *
 * The first three values are the original fractional-only states; the rest
 * were added when sale and rent listings arrived, because "fundraising"
 * has nothing valid to say about a shop that is available to let.
 *
 *   fractional → fundraising | fully_funded | closed
 *   sale       → available | under_offer | sold
 *   rent       → available | under_offer | let
 *   any        → off_market
 *
 * The Postgres type is still named `property_status`. Extending an enum in
 * place is a metadata-only change; renaming it would mean rewriting the
 * column on a live table for no functional gain, so the old type name stays.
 */
export const listingStatusEnum = pgEnum("property_status", [
  "fundraising",
  "fully_funded",
  "closed",
  "available",
  "under_offer",
  "sold",
  "let",
  "off_market",
]);

export const properties = pgTable(
  "properties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),

    // ---- Classification -------------------------------------------------
    listingType: listingTypeEnum("listing_type").notNull().default("fractional"),
    category: propertyCategoryEnum("category")
      .notNull()
      .default("residential_apartment"),
    status: listingStatusEnum("status").notNull().default("fundraising"),

    // ---- Location -------------------------------------------------------
    location: text("location").notNull(),
    shortLocation: text("short_location").notNull(),
    /** Split out of `location` so "more in Mumbai" is a real query. */
    city: text("city").notNull().default(""),

    /** Legacy free-text label. Superseded by `category`; kept for display. */
    propertyType: text("property_type").notNull(),
    description: text("description").notNull(),
    /** Short blurb for cards and the detail intro, so the full description
     *  isn't printed twice on the same page. */
    summary: text("summary"),

    // ---- Parent building (optional) -------------------------------------
    buildingId: uuid("building_id").references(() => buildings.id, {
      onDelete: "set null",
    }),
    /** Unit identifier within the parent, e.g. "G-12", "FC-04". */
    unitNumber: text("unit_number"),
    /** Human floor label, e.g. "Ground", "Level 2", "Basement". */
    floorLabel: text("floor_label"),

    // ---- Size -----------------------------------------------------------
    areaSqft: numeric("area_sqft").notNull(),
    /** Usable area. For retail the gap vs built-up drives the real rent. */
    carpetAreaSqft: numeric("carpet_area_sqft"),
    /** Shopfront width in feet — a primary value driver for retail. */
    frontageFt: numeric("frontage_ft"),
    bedrooms: integer("bedrooms"),

    // ---- Fractional pricing (null unless listing_type = 'fractional') ----
    totalValuation: numeric("total_valuation"),
    fundingTarget: numeric("funding_target"),
    amountRaised: numeric("amount_raised").default("0"),
    minInvestment: numeric("min_investment"),
    estAnnualYield: numeric("est_annual_yield"),
    projectedAppreciation: numeric("projected_appreciation"),
    investmentHorizon: text("investment_horizon"),
    fundingDeadline: date("funding_deadline"),
    /** Real count, not derived from amountRaised / minInvestment. */
    investorCount: integer("investor_count").notNull().default(0),

    // ---- Sale pricing (null unless listing_type = 'sale') ----------------
    salePrice: numeric("sale_price"),
    pricePerSqft: numeric("price_per_sqft"),

    // ---- Rent pricing (null unless listing_type = 'rent') ----------------
    monthlyRent: numeric("monthly_rent"),
    securityDeposit: numeric("security_deposit"),
    leaseTermMonths: integer("lease_term_months"),
    lockInMonths: integer("lock_in_months"),
    rentEscalationPct: numeric("rent_escalation_pct"),
    /** Common Area Maintenance, ₹ per sq.ft. per month. Standard in malls. */
    camPerSqftMonthly: numeric("cam_per_sqft_monthly"),
    availableFrom: date("available_from"),
    /** "Bare Shell" | "Warm Shell" | "Furnished" — varies by category. */
    furnishingStatus: text("furnishing_status"),

    // ---- Retail & F&B specifics -----------------------------------------
    /** Unit-level footfall; falls back to the parent building's figure. */
    footfallMonthly: integer("footfall_monthly"),
    /** Covers for a food-court unit or restaurant space. */
    seatingCapacity: integer("seating_capacity"),
    /** Whether the unit has kitchen provisioning (exhaust, gas, drainage). */
    hasKitchenProvision: boolean("has_kitchen_provision"),
    /** Sanctioned electrical load — the gate on whether a kitchen can run. */
    powerLoadKva: numeric("power_load_kva"),

    // ---- Common ---------------------------------------------------------
    possessionStatus: text("possession_status").notNull(),
    maintenanceMonthly: numeric("maintenance_monthly"),
    reraNumber: text("rera_number"),
    images: text("images").array().notNull().default([]),
    amenities: text("amenities").array().notNull().default([]),
    /** Per-property selling points. Replaces the hardcoded generic four. */
    highlights: text("highlights").array().notNull().default([]),
    tags: text("tags").array().notNull().default([]),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Every filter on /properties hit a sequential scan before these.
    index("properties_listing_type_idx").on(table.listingType),
    index("properties_category_idx").on(table.category),
    index("properties_status_idx").on(table.status),
    index("properties_city_idx").on(table.city),
    index("properties_location_idx").on(table.location),
    index("properties_building_id_idx").on(table.buildingId),
    // Pagination tiebreaker: created_at alone is not unique (the seed wrote
    // 13 rows with an identical timestamp), which made OFFSET paging return
    // duplicate rows and skip others entirely.
    index("properties_created_at_id_idx").on(table.createdAt, table.id),
  ]
);

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type ListingType = (typeof listingTypeEnum.enumValues)[number];
export type PropertyCategory = (typeof propertyCategoryEnum.enumValues)[number];
export type ListingStatus = (typeof listingStatusEnum.enumValues)[number];
