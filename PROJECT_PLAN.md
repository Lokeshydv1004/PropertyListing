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
| Email | ~~Resend~~ — descoped by decision (2026-07-28): leads are captured in the `leads` table only; no email notifications. The team reviews new leads directly via the Supabase dashboard. |

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
- [x] ~~Resend account + API key~~ — not needed, descoped (see Section 2: leads are DB-only, no email)
- [ ] Netlify account, linked to the GitHub repo (can be deferred until we have something to deploy)

I can build and run everything locally against a local `.env.local` before any of these exist, except real DB reads/writes. **We can start Step 1 immediately without waiting on these.**

### Step 1 — Environment Setup ✅ done locally
- [x] Scaffold Next.js 16 (App Router, TypeScript, Tailwind) via `create-next-app`
- [x] Install & init shadcn/ui
- [x] Install Drizzle ORM + `postgres` driver
- [x] Project structure: `app/`, `components/`, `lib/`, `db/` (schema + client), `drizzle/` (migrations, generated on first `db:generate`)
- [x] `.env.local.example` with placeholders for Supabase URL/keys
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

### Step 9 — Responsive QA Pass ✅ done
- [x] Every page tested at 375px / 768px / 1440px — zero breakpoint bugs found; every page already handled mobile/tablet/desktop correctly from the mobile-first build approach used throughout
- [x] Along the way, redesigned the properties filter bar (user feedback) — clean grid layout, taller controls, "Clear filters"

### Step 10 — Polish ✅ done
- [x] Loading states (skeletons) for DB-driven pages — `app/properties/loading.tsx`, `app/properties/[slug]/loading.tsx` (route-specific skeletons matching each page's real layout), plus a generic spinner at `app/loading.tsx` (this one is Next's root-level Suspense fallback, which — confirmed via raw HTML stream inspection, not just guessing — briefly flashes on *every* route's cold load, not just "/", so it has to stay content-agnostic rather than being home-page-shaped)
- [x] Empty states — "No properties match your filters" (Step 6), custom branded 404 page (`app/not-found.tsx`)
- [x] Form validation error states — Zod + RHF inline messages (Steps 5/7) now also wired to `aria-invalid` so invalid fields get a red border, not just text below
- [x] ~~Resend email notification~~ — descoped by decision (2026-07-28): leads are DB-only. Every Contact and Submit Interest form submission already writes a full row to `leads` (name, phone, email, amount, message, linked `property_id`, `status`), verified end-to-end in Steps 5 and 7 and again in this step's production-build check. The team works leads directly from the Supabase Table Editor (matches the spec's "no dashboard" scope — `leads.status` is there for them to mark new/contacted/closed manually).

Also found and fixed during this pass: the Home page (`/`) was being statically frozen at build time (funding stats/featured properties would never update after deploy) — added `revalidate = 60` so it refreshes at least every minute. Verified everything end-to-end against a **production build** (`next build && next start`) with the real Supabase database, not just dev mode.

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

---

# Addendum — audit remediation (19 August 2026)

The sections above are the original build plan and are kept as a record of
what was decided when. Several of those decisions have since been superseded
by the work in `reports/WEBSITE_AUDIT.md`. Where this addendum and the plan
above disagree, this addendum is current.

## Decisions reversed

| Original decision | Now |
| --- | --- |
| Lead notifications descoped; team reads the Supabase dashboard | `lib/notify.ts` posts to `LEAD_WEBHOOK_URL` (Slack/Discord/Telegram-compatible). Unset means it no-ops silently and leads still save. Reversed because response speed is the largest single driver of lead conversion, and a Saturday-night lead sat unseen until Monday. |
| `getFeaturedProperties()` ranks by funding progress descending | Ranks `is_featured` first, then funding progress **ascending**. The old order promoted the raises closest to closing — the ones needing promotion least. |
| Seed writes `picsum.photos` placeholder images | Seeds empty image arrays. `PropertyImage` renders an honest "Photos coming soon" panel. A stock photograph on a listing is a representation about the asset, not a neutral placeholder. **Rows already in the live database still hold picsum URLs — clear them before launch.** |
| Inline success states on both forms | Both redirect to `/thank-you`, so ad platforms have a URL change to attribute a conversion to. |

## Routes added since the plan

`/about` · `/list-your-property` · `/insights` (+ `/insights/[slug]`) ·
`/privacy` · `/terms` · `/risk-disclosure` · `/thank-you` · `app/error.tsx` ·
`app/sitemap.ts` · `app/robots.ts` · `app/opengraph-image.tsx` ·
`app/properties/[slug]/opengraph-image.tsx` · `app/icon.svg` · `app/apple-icon.tsx`

## Schema changes since the plan

The table sketches at the end of the original plan are out of date. `db/schema/`
is the source of truth. Migrations added since:

- `0004_lead_attribution` — `leads` gains `enquiry_type`, `source`, `page_url`,
  `utm_*`, `contacted_at`, `notes`.
- `0005` — `properties` gains fee transparency (`platform_fee_pct`,
  `management_fee_pct`, `exit_fee_pct`), `occupancy_rate`, tenant detail
  (`tenant_name`, `lease_end_date`), coordinates, `documents[]`,
  `property_risks[]`, `managed_by`, `year_built`, `is_featured`.

All of `0005` is additive and nullable or defaulted; it has been applied to the
live database.

## Stale references in the plan above

- `property-card-skeleton.tsx` was deleted; the equivalent is
  `property-list-card-skeleton.tsx`.
- The `/properties` "Showing X properties" line described in Step 6 did not
  exist in the shipped page. It does now.

## Outstanding before launch

Search the codebase for `TODO(pre-launch)`. The blocking ones are listed in
`README.md` under "Before you send traffic" — contact details, fee figures,
the About page's team and story, legal review of `/privacy`, `/terms` and
`/risk-disclosure`, professional review of the `/insights` drafts (all
currently `noindex`), and real property photographs.
