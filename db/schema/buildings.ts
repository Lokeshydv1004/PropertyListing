import {
  pgEnum,
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * The kind of structure a listing sits inside. Drives the parent page's
 * copy and which shared facts are worth showing (footfall matters for a
 * mall, not for a residential complex).
 */
export const buildingTypeEnum = pgEnum("building_type", [
  "mall",
  "high_street",
  "office_park",
  "mixed_use",
  "residential_complex",
  "food_court",
  "warehouse_park",
]);

/**
 * A mall, tower or complex that individual listings belong to.
 *
 * Exists so shared facts (address, footfall, anchor tenants, amenities)
 * are stored once instead of being retyped on every shop unit — retyping
 * is how the same building ends up with three different footfall numbers.
 *
 * Optional: a standalone villa or a whole-floor office has no parent and
 * `properties.building_id` stays null.
 */
export const buildings = pgTable("buildings", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  buildingType: buildingTypeEnum("building_type").notNull(),

  location: text("location").notNull(),
  shortLocation: text("short_location").notNull(),
  city: text("city").notNull(),

  description: text("description").notNull().default(""),
  images: text("images").array().notNull().default([]),
  amenities: text("amenities").array().notNull().default([]),

  /** Total units in the building, of which we may list only a few. */
  totalUnits: integer("total_units"),
  /** Average monthly visitors — the headline number for retail. */
  footfallMonthly: integer("footfall_monthly"),
  /** Named tenants that draw traffic, e.g. ['Zara', 'PVR', 'Lifestyle']. */
  anchorTenants: text("anchor_tenants").array().notNull().default([]),

  yearBuilt: integer("year_built"),
  reraNumber: text("rera_number"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Building = typeof buildings.$inferSelect;
export type NewBuilding = typeof buildings.$inferInsert;
