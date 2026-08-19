ALTER TABLE "properties" ADD COLUMN "short_location" text;--> statement-breakpoint
UPDATE "properties" SET "short_location" = TRIM(SPLIT_PART("location", ',', 2)) WHERE "short_location" IS NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "short_location" SET NOT NULL;