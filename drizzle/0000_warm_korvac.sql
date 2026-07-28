CREATE TYPE "public"."property_status" AS ENUM('fundraising', 'fully_funded', 'closed');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'closed');--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"location" text NOT NULL,
	"property_type" text NOT NULL,
	"description" text NOT NULL,
	"total_valuation" numeric NOT NULL,
	"funding_target" numeric NOT NULL,
	"amount_raised" numeric DEFAULT '0' NOT NULL,
	"min_investment" numeric NOT NULL,
	"est_annual_yield" numeric NOT NULL,
	"investment_horizon" text NOT NULL,
	"funding_deadline" date,
	"status" "property_status" DEFAULT 'fundraising' NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"amenities" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "properties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"amount_interested" numeric,
	"message" text,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;