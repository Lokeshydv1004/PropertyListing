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
- [x] GitHub repo for this project — https://github.com/Lokeshydv1004/PropertyListing
- [x] Supabase project (free tier) — connected via `DATABASE_URL` (transaction pooler) in local `.env.local`; migration + seed applied to the real project
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

### Step 4 — Database Schema ✅ done, live on Supabase
- [x] Drizzle schema: `properties` table (per data model) — done in Step 1
- [x] Drizzle schema: `leads` table, FK to `properties.id`, nullable for general enquiries — done in Step 1
- [x] Migration (`drizzle/0000_warm_korvac.sql`) applied to the real Supabase project
- [x] Seed script (`db/seed/seed.ts`, `npm run db:seed`) run against the real project — 7 sample properties across Mumbai/Bangalore/Pune/Gurgaon/Goa/Hyderabad/Chennai, mixed `fundraising`/`fully_funded`/`closed` status and funding progress; idempotent via `onConflictDoNothing` on slug; images are placeholder `picsum.photos` URLs (swap for real Supabase Storage URLs once photos are uploaded — see Open Questions)
- [x] Verified live: `/api/health` returns ok and `/properties` renders the real seeded data from Supabase

### Step 5 — Static Content Pages ✅ done
- [x] How It Works — 4-step model, expanded detail, FAQs specific to investment mechanics
- [x] FAQ — accordion (fractional investing explainer, min ticket, returns, risk disclosures, exits)
- [x] Contact — general enquiry form (React Hook Form + Zod, `lib/actions/leads.ts` server action) writes to `leads` with `property_id = null` + phone/email/WhatsApp links — verified end-to-end (form submit → DB row) with Playwright against a throwaway local Postgres

### Step 6 — Properties Listing Page ✅ done
- [x] `/properties` — header with live open-properties count (`getOpenPropertiesCount()`, counts `status = 'fundraising'` regardless of active filters) + "Showing X properties" reflecting current filters
- [x] Filter bar: location, property type, funding status (all populated from distinct DB values), valuation range (min/max), max min.-investment — all drive the URL query string so filters are shareable/bookmarkable and survive back/forward navigation
- [x] Sort: newest / most funded (SQL ratio `amount_raised/funding_target`) / closing soon
- [x] Responsive grid: 3-col desktop → 2-col tablet → 1-col mobile
- [x] Property card: image, status badge, title, location, funding progress bar, % funded, funding target, min. investment, est. yield — currency formatted Indian-style (`lib/format.ts`, e.g. "₹5 Cr", "₹2.5 L")
- [x] Mobile: filter bar collapses into a "Filters" button opening a bottom Sheet drawer with the same fields
- [x] Empty state for zero-match filters

Verified end-to-end with Playwright against a throwaway local Postgres: filter selection updates the URL and narrows results correctly, sort changes result order correctly, empty-filter state renders, and the mobile filter drawer opens with all fields. Along the way, fixed: Base UI `Select` showing the raw sentinel value instead of a label, and a client-only hydration mismatch from Base UI's numeric-`inputMode` caret handling (suppressed via `suppressHydrationWarning`, since it's a harmless style-only difference — confirmed via source inspection this isn't from our code).

### Step 7 — Property Detail Page ✅ done
- [x] `/properties/[slug]` dynamic route (SSR from DB), returns real Next.js 404 for unknown slugs via `notFound()`
- [x] Breadcrumb + image gallery (main image + clickable thumbnail strip)
- [x] Key stats block: valuation, min. investment, est. yield, horizon
- [x] Description + amenities/specs
- [x] Submit Interest form (RHF + Zod, `submitInterestLead` server action): name, phone, email, amount (pre-filled with the property's min. investment), optional message → `leads` table with the property's `id`
- [x] Confirmation state after submit
- [x] Desktop: form is a sticky sidebar (`lg:sticky`). Mobile: form renders below all property content, not sticky — verified via screenshot

Verified end-to-end with Playwright against a throwaway local Postgres: real slug renders full page + gallery thumbnail switching works, unknown slug 404s, a real form submission produces a `leads` row correctly linked via `property_id`, and mobile layout stacks form below content as specified.

### Step 8 — Home Page ✅ done
- [x] Hero: headline, subtext, primary ("Browse Properties") + secondary ("How It Works") CTA, key stats row — stats are real, computed from the DB (`getPlatformStats()`: property count, total raised, avg. estimated yield), not hardcoded
- [x] How It Works summary (4 steps, condensed version of the dedicated page, links to it)
- [x] Featured properties (3 cards from DB, reusing `PropertyCard`; `getFeaturedProperties()` picks the most-funded currently-`fundraising` properties)
- [x] CTA banner
- [x] Assembled last from components already built (Navbar/Footer from Step 3, PropertyCard from Step 6)

Verified end-to-end with Playwright against a throwaway local Postgres: real stats render, 3 featured cards render with correct data and images, primary CTA navigates to `/properties`, responsive at desktop and mobile widths, zero console errors.

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
- Placeholder property images/content for seed data — decided: `picsum.photos` deterministic placeholders for now (see Step 4); swap for real photos via Supabase Storage before go-live.
- Exact copy for FAQ / risk disclosures — drafted generic placeholder copy in `app/faq/page.tsx` and the How It Works mechanics FAQ; replace with legal-reviewed text before go-live if your legal team provides it.
- Contact page phone/email/WhatsApp numbers (`app/contact/page.tsx`) are placeholders (`+91 98765 43210`, `hello@gharshare.in`) — replace with real team contact details.
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
