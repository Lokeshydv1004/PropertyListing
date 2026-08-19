ALTER TABLE "properties" ADD COLUMN "bedrooms" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "area_sqft" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "possession_status" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "projected_appreciation" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "tags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
UPDATE "properties" SET "area_sqft" = 1000 WHERE "area_sqft" IS NULL;--> statement-breakpoint
UPDATE "properties" SET "possession_status" = 'Ready to Move-in' WHERE "possession_status" IS NULL;--> statement-breakpoint
UPDATE "properties" SET "projected_appreciation" = "est_annual_yield" WHERE "projected_appreciation" IS NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "area_sqft" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "possession_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "projected_appreciation" SET NOT NULL;
