# GharShare — Fractional Real Estate Investment Platform
## Project Plan & Build Log

> This file is the working plan for the project. The original spec (Section A) is preserved as-agreed; Section B breaks it into concrete, checkable build steps we'll work through in order. Check items off as we complete them so the plan stays a live status board, not just a design doc.

---

## A. Spec Summary

**What it is:** A lead-generation marketing site for fractional real estate investment. Agents/owners list properties with a funding target; investors browse and submit interest via a form. No accounts, no payments, no dashboard — just clean presentation + lead capture routed to the team.

**Design reference:** Figma wireframes (Home, Properties Listing, Property Detail) — https://www.figma.com/design/tBkTAD1shNHoZ8vXRZuAIN

**Visual direction:** Fintech, not classifieds. Navy `#16324F` + green `#0EA671`, Inter font, generous whitespace, funding-progress bars and stat blocks as the core visual language. Mobile / tablet / desktop all first-class.

**Tech stack:**

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript _(spec said 15; bumped to the current release — no known incompatibilities)_ |
| Styling | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| Hosting | Netlify (Free) |
| Database | Supabase Postgres (Free) |
| ORM | Drizzle |
| Image storage | Supabase Storage |
| Email | Resend (Free) |

Cost: $0/month + ~$10–15/yr domain when going live.

**Pages:** Home, Properties Listing (`/properties`), Property Detail (`/properties/[slug]`), How It Works, FAQ, Contact.

**Data model:** `properties` table, `leads` table (see spec dump at bottom of this file for full column list).

**Out of scope:** auth, admin UI, payments, investor portfolio tracking, legal/SPV logic — just a generic `status` enum on properties.

**Keep-alive strategy:** Supabase free tier pauses after 7 days idle. Mitigate with a GitHub Actions scheduled workflow hitting `/api/health` every 3 days.

---

## B. Build Steps

Each step should end in a working, deployable state where reasonably possible — so we can catch integration issues early instead of at the end.

### Step 0 — Prerequisites (needs you)
Before I can wire up real infra, I need you to create accounts/projects on:
- [ ] GitHub repo for this project (empty is fine, I can init and push)
- [ ] Supabase project (free tier) — give me the project URL + anon key + service role key (or you can add them to `.env.local` yourself once I generate the template)
- [ ] Resend account + API key (can be deferred to Step 10)
- [ ] Netlify account, linked to the GitHub repo (can be deferred until we have something to deploy)

I can build and run everything locally against a local `.env.local` before any of these exist, except real DB reads/writes. **We can start Step 1 immediately without waiting on these.**

### Step 1 — Environment Setup ✅ done locally
- [x] Scaffold Next.js 16 (App Router, TypeScript, Tailwind) via `create-next-app`
- [x] Install & init shadcn/ui
- [x] Install Drizzle ORM + `postgres` driver
- [x] Project structure: `app/`, `components/`, `lib/`, `db/` (schema + client), `drizzle/` (migrations, generated on first `db:generate`)
- [x] `.env.local.example` with placeholders for Supabase URL/keys, Resend key
- [x] Git init, initial commit
- [x] Push to GitHub — https://github.com/Lokeshydv1004/PropertyListing
- [ ] Connect repo to Netlify for auto-deploy (needs Netlify account)

### Step 2 — Keep-Alive Workflow ✅ code done, needs live URL
- [x] `app/api/health/route.ts` — trivial DB read (`select 1`)
- [x] `.github/workflows/keepalive.yml` — scheduled (every 3 days) `curl` against `${{ secrets.SITE_URL }}/api/health`
- [ ] Once deployed: add repo secret `SITE_URL` (the Netlify URL) so the workflow has something to ping
- [ ] Documented fallback: cron-job.org / UptimeRobot as manual alternative if Actions is disabled

### Step 3 — Design System Foundation ✅ done
- [x] Tailwind theme: navy `#16324F` / green `#0EA671` palette, Inter font, spacing scale
- [x] Base shadcn components pulled in (Button, Card, Input, Badge, Progress, Sheet, etc.)
- [x] `Navbar` — logo, nav links, CTA, mobile hamburger menu (built mobile-first, verified with Playwright screenshots at 1440px/375px)
- [x] `Footer`
- [x] Shared layout (`app/layout.tsx`) wiring Navbar/Footer around all pages

### Step 4 — Database Schema ✅ done, pending real Supabase URL
- [x] Drizzle schema: `properties` table (per data model) — done in Step 1
- [x] Drizzle schema: `leads` table, FK to `properties.id`, nullable for general enquiries — done in Step 1
- [x] Migration generated (`drizzle/0000_warm_korvac.sql`) — verified end-to-end against a throwaway local Postgres (Docker); applying to the real Supabase project just needs `DATABASE_URL` in `.env.local`
- [x] Seed script (`db/seed/seed.ts`, `npm run db:seed`) — 7 sample properties across Mumbai/Bangalore/Pune/Gurgaon/Goa/Hyderabad/Chennai, mixed `fundraising`/`fully_funded`/`closed` status and funding progress; idempotent via `onConflictDoNothing` on slug; images are placeholder `picsum.photos` URLs (swap for real Supabase Storage URLs once photos are uploaded — see Open Questions)

### Step 5 — Static Content Pages
- [ ] How It Works — 4-step model, expanded detail, FAQs specific to investment mechanics
- [ ] FAQ — accordion (fractional investing explainer, min ticket, returns, risk disclosures, exits)
- [ ] Contact — general enquiry form (writes to `leads`, `property_id = null`) + phone/email/WhatsApp links

### Step 6 — Properties Listing Page
- [ ] `/properties` — header with live open-properties count (DB query)
- [ ] Filter bar: location, property type, funding status, price range, min. investment
- [ ] Sort: newest / most funded / closing soon
- [ ] Responsive grid: 3-col desktop → 2-col tablet → 1-col mobile
- [ ] Property card: image, title, location, funding progress bar, % funded, min. investment, est. yield
- [ ] Mobile: filter bar as collapsible drawer or horizontal scroll

### Step 7 — Property Detail Page
- [ ] `/properties/[slug]` dynamic route (SSR/SSG from DB)
- [ ] Breadcrumb + image gallery
- [ ] Key stats block: valuation, min. investment, est. yield, horizon
- [ ] Description + amenities/specs
- [ ] Submit Interest form (RHF + Zod): name, phone, email, amount, optional message → `leads` table with property `id`
- [ ] Confirmation state after submit
- [ ] Mobile: form moves below content instead of sticky sidebar

### Step 8 — Home Page
- [ ] Hero: headline, subtext, primary/secondary CTA, key stats row
- [ ] How It Works summary (4 steps)
- [ ] Featured properties (3 cards from DB)
- [ ] CTA banner
- [ ] Assembled last from components already built

### Step 9 — Responsive QA Pass
- [ ] Every page tested at 375px / 768px / 1440px
- [ ] Fix breakpoint issues, tap targets, overflow

### Step 10 — Polish
- [ ] Loading states (skeletons) for DB-driven pages
- [ ] Empty states (no properties match filter, etc.)
- [ ] Form validation error states
- [ ] Resend email notification to team on new lead insert

---

## C. Open Questions / Decisions Needed Later
- Placeholder property images/content for seed data — stock photos vs. Lorem-Picsum-style placeholders?
- Exact copy for FAQ / risk disclosures — draft ourselves or do you have legal-reviewed text to drop in?
- Domain name — not needed until go-live, flagged here so it's not forgotten.

---

## D. Full Data Model (reference)

```
properties
  id                  uuid, primary key
  title               text
  slug                text, unique
  location            text
  property_type       text
  description         text
  total_valuation     numeric
  funding_target      numeric
  amount_raised       numeric
  min_investment      numeric
  est_annual_yield    numeric
  investment_horizon  text
  funding_deadline    date
  status              enum: fundraising | fully_funded | closed
  images              text[]      -- Supabase Storage public URLs
  amenities           text[]
  created_at          timestamp

leads
  id                  uuid, primary key
  property_id         uuid, nullable, foreign key → properties.id
  name                text
  phone               text
  email               text
  amount_interested   numeric, nullable
  message             text, nullable
  status              enum: new | contacted | closed
  created_at          timestamp
```
