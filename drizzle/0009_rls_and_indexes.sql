-- Row Level Security, plus the indexes Supabase's advisor flagged.
--
-- ---------------------------------------------------------------------------
-- Why RLS, when this app never uses PostgREST
-- ---------------------------------------------------------------------------
-- The app talks to Postgres directly through Drizzle over DATABASE_URL. It has
-- never used the auto-generated REST API. But that API is enabled on the
-- project and exposes the `public` schema, and the publishable key that
-- authorises it is — correctly, by design — shipped to every visitor's browser
-- in the client bundle.
--
-- With RLS off, "exposed" means readable. Verified before writing this:
--
--   GET /rest/v1/leads?select=*      → 200, every lead with name, phone, email
--   GET /rest/v1/admin_users         → 200, the whole admin allowlist
--
-- That is the lead database and the list of who can sign in to the console,
-- available to anyone who opens devtools. Enabling RLS with no policies makes
-- PostgREST return an empty set to `anon` and `authenticated` instead.
--
-- The app is unaffected: it connects as the `postgres` role, which owns these
-- tables, and a table owner bypasses RLS unless FORCE ROW LEVEL SECURITY is
-- set — which it deliberately is not. Every console and public-site query was
-- re-run after this migration to confirm that.
--
-- No policies are added on purpose. A policy would grant somebody access; the
-- correct amount of access for `anon` here is none, and the app does not need
-- any. If the Data API is ever genuinely wanted, add policies then, per table,
-- deliberately.

ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "lead_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "buildings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "admin_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "admin_activity" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- Foreign keys with no index
-- ---------------------------------------------------------------------------
-- Postgres does not index a foreign key for you. Without one, every "show me
-- this actor's activity" or "who is this lead assigned to" is a sequential
-- scan, and — more sharply — deleting or deactivating a referenced row has to
-- scan the whole child table to enforce the constraint.

CREATE INDEX IF NOT EXISTS "admin_activity_actor_id_idx" ON "admin_activity" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_notes_author_id_idx" ON "lead_notes" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_assigned_to_idx" ON "leads" USING btree ("assigned_to");--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- The phone index, replaced rather than dropped
-- ---------------------------------------------------------------------------
-- leads_phone_idx indexed the raw string, and the duplicate-detection query no
-- longer compares raw strings: the same person writes "+91 96254 23454" on one
-- form and "09625423454" on the next, so it matches on the last ten digits.
-- That made the old index genuinely dead — the advisor was right about this
-- one for a real reason, not merely for lack of traffic.
--
-- The replacement is a functional index on the same expression the query uses,
-- so the duplicate check on every row of the lead queue can use it.

DROP INDEX IF EXISTS "leads_phone_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_phone_digits_idx" ON "leads" USING btree ((right(regexp_replace("phone", '\D', '', 'g'), 10)));
