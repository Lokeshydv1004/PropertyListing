ALTER TABLE "properties" ADD COLUMN "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "properties_is_published_idx" ON "properties" USING btree ("is_published");--> statement-breakpoint
-- Backfill, hand-added to the generated migration.
--
-- is_published defaults to false so that NEW listings start as drafts. Every
-- row that already exists, however, is currently live on the public site, and
-- every public query is being changed in this same change to filter on this
-- column. Without these two statements the deploy that ships them empties the
-- catalogue: no listings on /properties, no featured section, no detail pages,
-- and a sitemap of 404s.
--
-- published_at is seeded from created_at rather than now(), so "recently
-- published" sorts sensibly from day one instead of showing the entire
-- catalogue as published in the same second.
UPDATE "properties" SET "is_published" = true WHERE "is_published" = false;--> statement-breakpoint
UPDATE "properties" SET "published_at" = "created_at" WHERE "published_at" IS NULL;