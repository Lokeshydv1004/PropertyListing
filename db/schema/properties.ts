import {
  pgEnum,
  pgTable,
  uuid,
  text,
  numeric,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

export const propertyStatusEnum = pgEnum("property_status", [
  "fundraising",
  "fully_funded",
  "closed",
]);

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  location: text("location").notNull(),
  propertyType: text("property_type").notNull(),
  description: text("description").notNull(),
  totalValuation: numeric("total_valuation").notNull(),
  fundingTarget: numeric("funding_target").notNull(),
  amountRaised: numeric("amount_raised").notNull().default("0"),
  minInvestment: numeric("min_investment").notNull(),
  estAnnualYield: numeric("est_annual_yield").notNull(),
  investmentHorizon: text("investment_horizon").notNull(),
  fundingDeadline: date("funding_deadline"),
  status: propertyStatusEnum("status").notNull().default("fundraising"),
  images: text("images").array().notNull().default([]),
  amenities: text("amenities").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
