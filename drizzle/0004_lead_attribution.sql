ALTER TABLE "leads" ADD COLUMN "enquiry_type" text DEFAULT 'investor' NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "page_url" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "utm_source" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "utm_medium" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "utm_campaign" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "contacted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "notes" text;--> statement-breakpoint
CREATE INDEX "leads_status_created_at_idx" ON "leads" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "leads_property_id_idx" ON "leads" USING btree ("property_id");