ALTER TABLE "properties" ADD COLUMN "platform_fee_pct" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "management_fee_pct" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "exit_fee_pct" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "occupancy_rate" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "tenant_name" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "lease_end_date" date;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "latitude" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "longitude" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "documents" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "property_risks" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "managed_by" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "year_built" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;