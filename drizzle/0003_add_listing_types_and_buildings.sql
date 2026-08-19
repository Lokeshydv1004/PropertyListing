CREATE TYPE "public"."building_type" AS ENUM('mall', 'high_street', 'office_park', 'mixed_use', 'residential_complex', 'food_court', 'warehouse_park');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('fractional', 'sale', 'rent');--> statement-breakpoint
CREATE TYPE "public"."property_category" AS ENUM('residential_apartment', 'villa', 'plot_land', 'commercial_office', 'coworking_space', 'retail_shop', 'mall_shop', 'showroom', 'food_court_unit', 'restaurant_space', 'warehouse', 'holiday_rental');--> statement-breakpoint
ALTER TYPE "public"."property_status" ADD VALUE 'available';--> statement-breakpoint
ALTER TYPE "public"."property_status" ADD VALUE 'under_offer';--> statement-breakpoint
ALTER TYPE "public"."property_status" ADD VALUE 'sold';--> statement-breakpoint
ALTER TYPE "public"."property_status" ADD VALUE 'let';--> statement-breakpoint
ALTER TYPE "public"."property_status" ADD VALUE 'off_market';--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"building_type" "building_type" NOT NULL,
	"location" text NOT NULL,
	"short_location" text NOT NULL,
	"city" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"amenities" text[] DEFAULT '{}' NOT NULL,
	"total_units" integer,
	"footfall_monthly" integer,
	"anchor_tenants" text[] DEFAULT '{}' NOT NULL,
	"year_built" integer,
	"rera_number" text,
	"latitude" numeric,
	"longitude" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "buildings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "total_valuation" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "funding_target" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "amount_raised" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "min_investment" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "est_annual_yield" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "investment_horizon" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "projected_appreciation" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "listing_type" "listing_type" DEFAULT 'fractional' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "category" "property_category" DEFAULT 'residential_apartment' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "city" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "building_id" uuid;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "unit_number" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "floor_label" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "carpet_area_sqft" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "frontage_ft" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "investor_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "sale_price" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "price_per_sqft" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "monthly_rent" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "security_deposit" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "lease_term_months" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "lock_in_months" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "rent_escalation_pct" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "cam_per_sqft_monthly" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "available_from" date;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "furnishing_status" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "footfall_monthly" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "seating_capacity" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "has_kitchen_provision" boolean;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "power_load_kva" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "maintenance_monthly" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "rera_number" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "highlights" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "properties_listing_type_idx" ON "properties" USING btree ("listing_type");--> statement-breakpoint
CREATE INDEX "properties_category_idx" ON "properties" USING btree ("category");--> statement-breakpoint
CREATE INDEX "properties_status_idx" ON "properties" USING btree ("status");--> statement-breakpoint
CREATE INDEX "properties_city_idx" ON "properties" USING btree ("city");--> statement-breakpoint
CREATE INDEX "properties_location_idx" ON "properties" USING btree ("location");--> statement-breakpoint
CREATE INDEX "properties_building_id_idx" ON "properties" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "properties_created_at_id_idx" ON "properties" USING btree ("created_at","id");--> statement-breakpoint
-- Backfill: split the city out of the existing "Area, City" location strings,
-- so "more properties in Mumbai" becomes a real query instead of a LIKE on a
-- hyper-specific string that never matched anything.
UPDATE "properties"
SET "city" = COALESCE(NULLIF(TRIM(SPLIT_PART("location", ',', 2)), ''), "location")
WHERE "city" = '';--> statement-breakpoint
-- Backfill: map the legacy free-text property_type onto the new enum.
UPDATE "properties" SET "category" = (CASE "property_type"
  WHEN 'Commercial Office'     THEN 'commercial_office'
  WHEN 'Residential Apartment' THEN 'residential_apartment'
  WHEN 'Holiday Rental'        THEN 'holiday_rental'
  WHEN 'Villa'                 THEN 'villa'
  ELSE 'residential_apartment'
END)::"public"."property_category";--> statement-breakpoint
-- Every pre-existing row was a fractional raise; nothing else could be stored.
UPDATE "properties" SET "listing_type" = 'fractional';--> statement-breakpoint
-- Integrity: a listing must carry the price field its listing type is priced by.
-- Without this, a rent listing with no monthly_rent renders a blank price and
-- nothing upstream catches it.
ALTER TABLE "properties" ADD CONSTRAINT "properties_pricing_matches_listing_type" CHECK (
  ("listing_type" = 'fractional' AND "funding_target" IS NOT NULL AND "min_investment" IS NOT NULL)
  OR ("listing_type" = 'sale' AND "sale_price" IS NOT NULL)
  OR ("listing_type" = 'rent' AND "monthly_rent" IS NOT NULL)
);
