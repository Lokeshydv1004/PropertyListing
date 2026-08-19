# GharShare

Lead-generation marketing site for fractional real-estate investment in India.
Visitors browse title-verified listings, read how the process works, and
register interest; the team follows up offline. There is no authentication and
no payment flow, by design.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router, React Server Components) |
| Styling | Tailwind CSS v4 + shadcn/ui on Base UI |
| Database | Postgres on Supabase, accessed with Drizzle ORM |
| Forms | react-hook-form + Zod, submitted through server actions |
| Hosting | Netlify (`netlify.toml`) |

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

### Environment variables

`.env.local.example` documents all of them. The essentials:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Supabase Postgres. Use the **Transaction pooler** connection string, not the direct one — the direct connection does not survive serverless. |
| `NEXT_PUBLIC_CONTACT_PHONE` / `_EMAIL` / `_WHATSAPP` | before launch | Real contact details. Until set, those channels are hidden rather than shown as placeholders. |
| `NEXT_PUBLIC_LEGAL_NAME` / `_CIN` / `_ADDRESS` | before launch | Company identity in the footer, About page and legal pages. |
| `NEXT_PUBLIC_SITE_URL` | before launch | Canonical origin. Drives `sitemap.xml`, `robots.txt`, canonical tags and Open Graph URLs. |
| `LEAD_WEBHOOK_URL` | optional | Any endpoint accepting `{ "text": "..." }` — Slack or Discord incoming webhook, or a Telegram relay. Unset means lead notifications are skipped silently; leads still save. |
| `NEXT_PUBLIC_GA_ID` | optional | GA4 measurement ID. Unset means no analytics script is injected at all. |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a Drizzle migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:seed` | Seed residential/fractional sample listings |
| `npm run db:seed:commercial` | Seed commercial sample listings |
| `npm run admin:add` | Add or restore an admin console account (see below) |

## Layout

```
app/                    Routes. Server components unless marked "use client".
  (site)/               The public site. The route group adds nothing to
                        the URL — it exists so the navbar and footer belong
                        to the marketing pages, not to every route on the domain.
    properties/         Listing index (filters, infinite scroll) and detail pages
    insights/           File-based blog, content in lib/insights-data.ts
  admin/                Staff console. (console)/ is the signed-in area;
                        login/ and auth/ sit outside the guard.
  api/properties/       Pagination endpoint the infinite list calls
  sitemap.ts robots.ts  Generated SEO routes
proxy.ts                Session refresh + /admin redirects. Next 16 renamed
                        Middleware to Proxy; this is that file.
components/
  layout/               Navbar, footer, analytics, WhatsApp button
  home/ properties/     Page sections and listing UI
  ui/                   shadcn/ui primitives
db/
  schema/               Drizzle tables
  seed/                 Seed scripts
lib/
  queries/              All database reads
  actions/              Server actions (lead capture, admin auth)
  auth/                 requireAdmin() / requireOwner() — the authorisation
                        layer every admin mutation must call
  supabase/             Supabase Auth clients (server, proxy)
  validation/           Zod schemas shared by forms and actions
  site-config.ts        Company facts, env-driven
reports/                Content, visual and technical audits
```

## Admin console

`/admin` is the staff console: leads, listings and funding numbers. It is
entirely separate from the public site — different layout, no marketing chrome,
excluded from search.

**Access is by allowlist, not by password.** Sign-in is an emailed magic link,
and the address must already exist in the `admin_users` table — an address that
isn't there never receives a link. Two roles: `owner` (manages the team, and
the only role allowed near destructive actions) and `staff` (everything else).

Setting it up:

1. `npm run db:migrate` — creates `admin_users` and `admin_activity`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   (see `.env.local.example`). Until they are set, `/admin/login` says so
   rather than failing; the public site is unaffected either way.
3. In the Supabase dashboard, add `<origin>/admin/auth/callback` to
   Authentication → URL Configuration → Redirect URLs, for production *and*
   localhost.
4. `npm run admin:add -- you@example.com "Your Name" owner`
5. Sign in at `/admin/login`.

Re-running `admin:add` for an existing address updates the name and role and
reactivates the account — it is also how you restore access to someone who was
deactivated.

### Leads

`/admin/leads` is the queue. Every filter is in the URL, so a view can be
pasted to someone else and they see the same rows. The default view is
"new, newest first" — an absent `status` means new; `status=all` shows everything.

- `j`/`k` move, `Enter` opens, `/` jumps to search.
- Opening a lead from the table shows it in a side panel; the same URL opened
  cold renders a full page. One route, intercepted.
- New-listing alert signups are on their own tab. They have no phone number
  (the form only asks for an email), so leaving them in the queue would pad
  every call list with rows nobody can action.
- A gold badge on a name means other live enquiries share that phone number.
- Notes are append-only with an author and timestamp. The old single-field
  `leads.notes` is shown once, read-only, as "earlier note".
- Export gives the whole filtered set, not the page on screen.

### Properties

`is_published` is the difference between a row existing and the public site
showing it. New listings start as drafts; everything that existed before the
column was added was backfilled to live in the same migration.

- **Every public read filters `is_published`.** They live in
  `lib/queries/properties.ts` behind one shared `isPublic` predicate. The
  console reads through `lib/queries/admin-properties.ts` instead, which
  never filters it. Keep the two files apart.
- Publishing requires an image, a description, a slug and a price for the
  listing type. The block names the missing field.
- "Preview draft" uses Next Draft Mode, not a token in the URL — the cookie
  is set on that browser only, so a forwarded link shows nothing.
- Inline edits on the table (raised, investors, status, live, featured) skip
  the form entirely. Updating the funding bar is the most frequent edit
  anyone makes.
- Duplicate clears slug, unit number, funding progress and both flags.
- Archive = off-market + unpublished. There is no delete: deleting a
  property nulls `leads.property_id` and orphans every enquiry about it.
- Which fields a listing shows is computed in `lib/admin/property-fields.ts`
  from listing type and category. Note that fractional and sale listings do
  carry `monthly_rent` and lease terms — for a tenanted asset that rent is
  what produces the yield.

### Media

Uploads go through a Server Action holding the Supabase secret key, never
from the browser. Run `npm run storage:init` once per environment to create
the `property-images` and `property-documents` buckets.

- Photographs are resized in the browser before upload (max 2000px, JPEG).
  A 6MB phone picture has no business being served.
- `images[0]` is the cover — position is the only cover mechanism there is,
  so the first slot is labelled explicitly.
- Removing a file also deletes the object, so the bucket does not fill with
  things nothing references.
- Documents are stored as `Label|url` in the flat `text[]`. Entries without
  a pipe still work and fall back to the filename, so nothing existing broke.

### Buildings, activity, settings

- "Add unit here" pre-fills a new listing from its parent building. That
  pre-fill is the reason the buildings table exists.
- The audit log has been recording since the console shipped; `/admin/activity`
  reads it. Read-only, with no delete anywhere.
- Settings is owner-only and checks the role in the page as well as in every
  action — the nav hiding a link is not a permission.

### The rule that matters when extending it

A Server Action is a public HTTP endpoint with a guessable id. `proxy.ts` and
the console layout guard *pages*; neither protects an action. Every mutation
starts with `requireAdmin()` from `lib/auth/admin.ts`, and every destructive one
with `requireOwner()` — including the ones only reachable from a page that is
already guarded.

## Before you send traffic

The site currently renders visible `TODO(pre-launch)` markers wherever it needs
a fact only the business can supply. That is deliberate — a placeholder that
looks finished ships silently, and this project previously went out with
invented statistics and a sample phone number. Search the codebase for
`TODO(pre-launch)` and work through them.

The largest ones:

- **Contact details and company identity** — set the `NEXT_PUBLIC_*` variables.
- **Fees** — the fee table on `/how-it-works` and the fee answers in the FAQ are
  marked `TODO` rather than guessed at.
- **About page** — founding story, team and partners are empty rather than
  populated with invented people.
- **Legal pages** — `/privacy`, `/terms` and `/risk-disclosure` are drafted but
  have not been reviewed by a lawyer. `/terms` also needs a jurisdiction city.
- **Insights posts** — drafted, `noindex`, and flagged as pending review. They
  cover legal and tax matters; have a lawyer and a CA read them first.
- **Property photographs** — the seed writes empty image arrays deliberately.
  Listings show an honest "Photos coming soon" panel until real photos are
  uploaded to Supabase Storage.

## Notes

- **Supabase free tier pauses after ~7 days idle.** A keep-alive workflow hits
  `/api/health` to prevent it. If pages hang or time out, check the database
  first — `app/error.tsx` catches the failure and shows a real page rather than
  a stack trace.
- **`AGENTS.md` applies to AI coding agents** working in this repo. This
  Next.js version has breaking changes from what most models were trained on;
  read `node_modules/next/dist/docs/` before writing framework code.
