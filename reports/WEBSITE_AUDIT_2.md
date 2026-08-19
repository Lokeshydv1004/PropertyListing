
---

# 4. Conversion & lead capture

The entire business case for this site is *leads*. Several things are quietly costing you leads right now.

## C1 🟠 No lead alerting — leads sit unseen

`PROJECT_PLAN.md` descoped email notification: leads go to the `leads` table and the team reads them in the Supabase dashboard. In lead-gen, **speed of response is the single biggest determinant of conversion** — a lead contacted within 5 minutes converts many times better than one contacted the next day. A form submitted on Saturday night may not be seen until Monday.

**Fix — free options, pick one (all $0):**

**(a) Telegram/Slack/WhatsApp webhook, ~10 lines:**

```ts
// lib/notify.ts
export async function notifyTeam(text: string) {
  const url = process.env.LEAD_WEBHOOK_URL;   // Slack incoming webhook, or Telegram bot API
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (e) {
    console.error("notifyTeam failed", e);   // never block the lead insert
  }
}
```

```ts
// lib/actions/leads.ts — after a successful insert
await notifyTeam(
  `🏠 New interest — ${parsed.data.name} · ${parsed.data.phone}\n` +
  `Property: ${propertyId}\nAmount: ₹${parsed.data.amountInterested}`
);
```

**(b)** Supabase Database Webhook on `INSERT INTO leads` → your webhook. Zero app code.

**(c)** Reinstate a transactional email provider — the free tier is enough for this volume.

Whichever you choose, wrap it so a failed notification **never** fails the lead insert.

## C2 🟠 No analytics, no conversion tracking, no thank-you URL

There is no GA4, no Meta pixel, no event tracking anywhere. You cannot answer: how many people visit, which properties get viewed, where they drop off, which channel produces leads.

Compounding this: both forms show an **inline** success state, so there's no URL change to fire a conversion on.

**Fix:**

1. Add analytics in `app/layout.tsx` (GA4 via `next/script`, or a privacy-friendly alternative).
2. Redirect to a real thank-you URL after submission so ad platforms can attribute:

```tsx
// components/properties/interest-form.tsx
import { useRouter } from "next/navigation";
const router = useRouter();

if (result.success) {
  router.push(`/thank-you?type=interest&property=${encodeURIComponent(slug)}`);
}
```

3. Build `/thank-you` telling them exactly what happens next (§5.6).

## C3 🟠 Forms are wide open to spam

`submitContactLead` and `submitInterestLead` are public server actions with no honeypot, no rate limiting, and no CAPTCHA. Bots find and hammer forms like this quickly, and a `leads` table full of junk means real leads get missed.

**Fix — a honeypot costs nothing and stops most bots:**

```ts
// lib/validation/contact.ts
company: z.string().max(0).optional(),   // honeypot: humans never fill a hidden field
```

```tsx
{/* visually hidden, not display:none — some bots skip display:none */}
<input
  {...register("company")}
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
  className="absolute left-[-9999px] h-0 w-0 opacity-0"
/>
```

Add simple per-IP rate limiting on top (in-memory is fine at this scale; Upstash Redis free tier if you want it durable).

## C4 🟠 The "Invest Now" button doesn't let you invest

```tsx
// components/properties/property-card.tsx — two buttons, same destination
<Button render={<Link href={`/properties/${property.slug}`} />} variant="outline">View Details</Button>
<Button render={<Link href={`/properties/${property.slug}`} />}>Invest Now</Button>
```

Two buttons pointing at the same URL is confusing, and **"Invest Now" is a promise you can't keep** — there's no payment flow. Someone who clicks it expecting to invest and lands on a lead form feels misled, which is the same trust hit as the fake Login button.

**Fix:** one clear primary action per card, labelled honestly:

```tsx
<Button render={<Link href={`/properties/${property.slug}`} />} nativeButton={false}
        className="h-9 w-full bg-navy text-sm text-white hover:bg-navy/90">
  View details
</Button>
```

Use "Register interest" (not "Invest Now") as the CTA on the detail page too. It sets accurate expectations and gets *better* quality leads.

## C5 🟡 The success state doesn't say what happens next

Current copy: *"Thanks for your interest. A member of our team will reach out to walk you through the next steps."*

Missing: **when** (within 24 hours?), **how** (phone or WhatsApp?), **what they should do meanwhile**.

```tsx
<h3 className="text-lg font-semibold text-navy">Interest submitted</h3>
<p className="text-sm text-muted-foreground">
  We&apos;ve got your details. An investment advisor will call you on the number you
  provided <strong>within 1 business day</strong> to share the full documentation and
  answer your questions. There is no obligation at this stage.
</p>
<div className="mt-4 flex flex-col gap-2">
  <a href={`https://wa.me/${SITE.whatsapp}`} className="text-sm font-medium text-brand-green underline">
    Prefer WhatsApp? Message us now →
  </a>
  <Link href="/how-it-works" className="text-sm text-muted-foreground underline">
    Meanwhile: read how onboarding works
  </Link>
</div>
```

## C6 🟡 No floating WhatsApp button

For Indian property lead-gen this is close to standard, and it typically lifts contact rate materially — many people will WhatsApp who would never fill a form. One small component, sitewide.

## C7 🟡 Form fields fight mobile users

Neither form sets `autoComplete`, and both phone fields use `type="text"`:

```tsx
<Input id="interest-phone" placeholder="+91 98765 43210" {...register("phone")} />
```

`type="text"` gives a mobile user the full QWERTY keyboard for a phone number, and no `autoComplete` means no browser autofill on any field. Both add friction at exactly the wrong moment.

```tsx
<Input id="interest-name"  autoComplete="name"  {...register("name")} />
<Input id="interest-phone" type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} />
<Input id="interest-email" type="email" autoComplete="email" {...register("email")} />
```

Also: the phone regex accepts a 7-character string of brackets and dashes. Tighten it for Indian numbers while still allowing international:

```ts
phone: z.string().trim()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .refine((v) => /^(\+?\d{1,3})?\d{10}$/.test(v), "Enter a valid 10-digit mobile number"),
```

## C8 🟡 The amount field asks for a raw number

`Amount interested (₹)` with placeholder `e.g. 250000`. People mistype zeroes and there's no feedback on what they typed. Show a formatted hint as they type ("₹2.5 L"), and offer quick-pick chips (1×, 2×, 5× the minimum). Chips typically raise both completion and average declared ticket.

---

# 5. Missing pages — build specs

## 5.1 `/about` — 🔴 highest-priority new page

**Purpose:** answer *"who are these people and why should I trust them with ₹2.5 lakh?"*

**Sections:**
1. **Founding story** — why you built this, in plain language, 2–3 paragraphs.
2. **The team** — real photos, real names, real roles, LinkedIn links. Prior experience matters more than anything else on this page.
3. **How we choose properties** — your due-diligence checklist, made concrete: title search, encumbrance certificate, independent valuation, RERA verification, rent-roll audit. *This is the section that converts.*
4. **Our partners** — legal firm, valuation agency, escrow bank, property managers. Named.
5. **Company details** — legal entity, CIN, registered address, GST.
6. **CTA** — Browse properties / Talk to us.

## 5.2 `/list-your-property` — 🟠 your missing supply side

The spec says agents and owners list properties, but there is **no page for them at all**. Every listing currently has to come from an offline conversation.

**Sections:** who this is for · what you look for (asset type, ticket size, city, occupancy) · what the owner gets (speed, price discovery, your fee) · the process (submit → valuation → legal → listing → funding) · a submission form (name, phone, city, property type, valuation, current rental, occupancy status) writing to `leads` with `enquiryType: 'list_property'`.

## 5.3 `/privacy`, `/terms`, `/risk-disclosure` — 🔴 legally required

Not optional once you collect personal data and publish yield estimates.

- **Privacy Policy** — what you collect, why, lawful basis, retention period, who it's shared with, user rights under the DPDP Act 2023, grievance-officer contact (required).
- **Terms of Use** — site usage, that listings are information and not an offer, accuracy disclaimers, IP, governing law and jurisdiction.
- **Risk Disclosure** — market risk, liquidity risk, tenant/vacancy risk, regulatory risk, no guaranteed returns, "not investment advice."

Have a lawyer review these. Link all three in the footer and from both forms.

## 5.4 `/testimonials` (or a home section) — 🟠

Three to six investor stories: name, city, profession, amount, what they were worried about beforehand, what actually happened. Photo and video if possible. **Never invent these** — the whole point is that they're real. If you have no investors yet, use advisor or partner endorsements instead and label them accurately.

## 5.5 `/insights` (blog) — 🟡 your organic-search engine

Your buyers search before they buy. Content that ranks:
*"Is fractional real estate investment legal in India?"* · *"SM REIT vs REIT vs fractional ownership"* · *"How rental income from fractional property is taxed"* · *"Bangalore vs Mumbai commercial yields 2026"* · *"How to evaluate a Grade-A office investment"*

One well-researched post a fortnight beats sporadic bursts. Each post ends with a soft CTA into `/properties`.

## 5.6 `/thank-you` — 🟠 needed for ad tracking

A real URL to fire conversion events on, that also does useful work: restates the timeline, offers WhatsApp, links to How It Works and FAQ, and suggests two other properties.

---

# 6. SEO & technical

## S1 🟠 No `sitemap.xml` and no `robots.txt`

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { db } from "@/db/client";
import { properties } from "@/db/schema";
import { SITE } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await db.select({ slug: properties.slug, createdAt: properties.createdAt }).from(properties);

  const staticPages = ["", "/properties", "/how-it-works", "/faq", "/contact", "/about", "/privacy", "/terms", "/risk-disclosure"]
    .map((path) => ({
      url: `${SITE.url}${path}`,
      lastModified: new Date(),
      priority: path === "" ? 1 : 0.7,
    }));

  const propertyPages = rows.map((r) => ({
    url: `${SITE.url}/properties/${r.slug}`,
    lastModified: r.createdAt,
    priority: 0.9,
  }));

  return [...staticPages, ...propertyPages];
}
```

```ts
// app/robots.ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
```

## S2 🟠 No Open Graph or Twitter images — links share as grey boxes

There is no `openGraph` or `twitter` metadata anywhere, and no `metadataBase`. **In India, WhatsApp is the primary sharing channel for property research.** Right now, every link someone shares appears as a bare URL with no image, no title card, no description. That is a large, silent loss of referral traffic.

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "GharShare — Fractional Real Estate Investment in India",
    template: "%s | GharShare",
  },
  description:
    "Own a share of premium, income-generating Indian real estate from ₹1 lakh. Title-verified properties, professional management, transparent fees.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "GharShare",
    url: SITE.url,
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};
```

Per-property dynamic OG images (a real differentiator — the shared card shows the property photo, price and yield):

```tsx
// app/properties/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getPropertyBySlug } from "@/lib/queries/properties";
import { formatCompactINR } from "@/lib/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const p = await getPropertyBySlug(params.slug);
  if (!p) return new ImageResponse(<div style={{ background: "#063d2f", width: "100%", height: "100%" }} />, size);

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end",
                    width: "100%", height: "100%", background: "#032E24", color: "white", padding: 64 }}>
        <div style={{ fontSize: 28, color: "#D9A441" }}>{p.shortLocation}</div>
        <div style={{ fontSize: 60, fontWeight: 700, marginTop: 12 }}>{p.title}</div>
        <div style={{ fontSize: 32, marginTop: 24, color: "#D5DDD9" }}>
          From {formatCompactINR(Number(p.minInvestment))} · {p.estAnnualYield}% p.a. est. yield
        </div>
      </div>
    ),
    size
  );
}
```

## S3 🟠 No structured data (JSON-LD)

Add `Organization` sitewide, `FAQPage` on `/faq`, `BreadcrumbList` + `Product`/`RealEstateListing` on property pages. This is what earns rich results — star-style enhancements, breadcrumb trails and expandable FAQs in Google.

```tsx
// components/seo/json-ld.tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

```tsx
// app/faq/page.tsx
<JsonLd data={{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_SECTIONS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
}} />
```

## S4 🟠 Filtered listing URLs will be crawled as duplicate pages

`/properties?location=X&sort=most_funded&minValuation=…` generates a combinatorial explosion of URLs, all serving near-identical content. Google will crawl them and dilute the page's ranking.

```tsx
// app/properties/page.tsx
export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const params = await searchParams;
  const isFiltered = Object.keys(params).some((k) => k !== "page");
  return {
    title: "Investment Opportunities",
    description: "Browse verified properties open for fractional real estate investment.",
    alternates: { canonical: "/properties" },
    robots: isFiltered ? { index: false, follow: true } : undefined,
  };
}
```

## S5 🟡 Property meta descriptions are unbounded

```tsx
description: property.description,   // full description — often > 300 chars
```

Google truncates around 155–160 characters. You already have `truncateText` — use it:

```tsx
description: truncateText(property.description, 155),
```

## S6 🟡 Still shipping the default Next.js favicon

`app/favicon.ico` is 25,931 bytes — byte-for-byte the `create-next-app` default. Every open tab of your investment platform currently displays the Next.js logo. Replace it, and add `icon.png` / `apple-icon.png` for mobile bookmarks.

## S7 🟡 Repo hygiene visible to anyone who looks

- `README.md` is still the untouched `create-next-app` boilerplate ("Deploy on Vercel" — you're deploying to Netlify).
- A stray temp file sits committed at the repo root: `C:UsersLokesAppDataLocalTemp…migrate_out.txt`.
- `public/` still contains `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg` — all publicly served and unused.

```bash
rm public/next.svg public/vercel.svg public/file.svg public/globe.svg public/window.svg
rm "C:UsersLokesAppDataLocalTempclaudeC--Users-Lokes-Desktop-PropertyListingce1f3f5b-e3a4-4794-b5bc-bdba14078af3scratchpadmigrate_out.txt"
```

## S8 🟡 Filter options hit the database on every single request

`/properties` runs three queries per request, one of which (`getPropertyFilterOptions`) returns data that changes only when a property is added.

```ts
import { unstable_cache } from "next/cache";

export const getPropertyFilterOptions = unstable_cache(
  async () => { /* existing body */ },
  ["property-filter-options"],
  { revalidate: 300, tags: ["properties"] }
);
```

Also cap `pageSize` in `app/api/properties/route.ts` — it's currently a fixed constant, which is fine, but validate any future client-supplied value so nobody can request 10,000 rows.

---

# 7. Accessibility

Legally relevant, and it overlaps almost perfectly with SEO and mobile usability.

## A1 🔴 Text-in-images (see H3)

`WhyFractional` delivers its entire message as three PNGs. Screen-reader users get four words. WCAG 2.2 SC 1.1.1 and 1.4.5 failure. Fixed by the HTML rewrite in §3.1.

## A2 🟠 Gold text on white/light backgrounds fails contrast

Your gold `#D9A441` on white is roughly **2.25:1** — WCAG AA requires 4.5:1 for body text. Affected:

- `components/home/featured-properties.tsx` — the "View All Properties" link (`text-gold` on white), both desktop and mobile.
- `app/properties/[slug]/page.tsx` — the "Fully Funded" badge: `bg-gold-light text-gold` is about **1.95:1**, essentially invisible.
- Any `text-gold` on a white card.

Gold on your dark green (`#063d2f`) measures ~5.4:1 and is fine — the problem is only gold on light surfaces.

**Fix:** add a darker gold for use on light backgrounds:

```css
/* app/globals.css */
:root {
  --gold: #d9a441;        /* decorative / on dark backgrounds only */
  --gold-700: #8a5f10;    /* text on light backgrounds — ~6.3:1 on white */
}
```

```tsx
/* @theme inline */
--color-gold-700: var(--gold-700);
```

Then swap `text-gold` → `text-gold-700` everywhere it sits on white or `gold-light`.

## A3 🟠 9px text on mobile

```tsx
// components/home/stats-bar.tsx
<p className="text-[9px] leading-tight text-[#555555] sm:text-[12px]">{stat.label}</p>
```

9px is below any reasonable legibility floor, and it's your *trust* content. Use `text-[11px]` minimum, or stack two stats per row on mobile instead of four across.

## A4 🟠 Progress bars have no accessible name

Every `<Progress value={percentFunded} />` renders without a label, so a screen-reader user hears a bare percentage with no idea what it measures.

```tsx
<Progress
  value={percentFunded}
  aria-label={`${formatPercent(percentFunded)} of funding target raised`}
/>
```

## A5 🟡 Truncated titles have no full-text fallback

`property-card.tsx` and `property-list-card.tsx` use `truncate` on titles. A long name is silently cut with no way to see it.

```tsx
<h3 title={property.title} className="truncate ...">{property.title}</h3>
```

## A6 🟡 No skip-to-content link

Keyboard users must tab through the whole nav on every page.

```tsx
// app/layout.tsx — first child of <body>
<a href="#main"
   className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-navy focus:px-4 focus:py-2 focus:text-white">
  Skip to content
</a>
<main id="main" className="flex-1 pt-16 bg-white">{children}</main>
```

## A7 🟡 Gallery has no keyboard/lightbox affordance and thumbnails hide images

`PropertyGallery` shows only the first 4 thumbnails and overlays "+N More" on the fourth — but clicking it just selects image 4; the remaining photos are **unreachable**. On a property page, hiding photos is a direct conversion cost.

**Fix:** make the "+N More" thumbnail open a lightbox with all images, and add arrow-key navigation on the main image.

## A8 🟡 Decorative icons aren't hidden from assistive tech

Lucide icons inside labelled elements should carry `aria-hidden="true"` so screen readers don't announce them.

---

# 8. Code-level bugs & cleanups

| ID | Severity | Issue | Fix |
|---|---|---|---|
| B1 | 🟠 | **Unhandled fetch rejection** in `property-infinite-list.tsx` — a failed request leaves `loadingRef` stuck `true`, permanently freezing infinite scroll | try/catch/finally — see §L2 |
| B2 | 🟠 | **`bg-[#D9A441]` on a `variant="outline"` button** in `property-card.tsx` — the variant's `hover:bg-muted` overrides the gold on hover, so the button turns beige mid-interaction | Drop the override; use a proper variant |
| B3 | 🟠 | **Two buttons, one destination** on property cards ("View Details" and "Invest Now" both link to the same page) | One primary CTA — see §C4 |
| B4 | 🟠 | **`similar` query never matches** — exact `eq()` on hyper-specific `location` | Match on city — see §D4 |
| B5 | 🟡 | **Unused import** `Heart` in `property-card.tsx` — leftover from a shortlist feature that was never built | Remove, or build the shortlist |
| B6 | 🟡 | **`max-h-[400px]` on `PropertyCard`** clips content at some breakpoints when titles wrap | Remove the cap; let the grid equalise heights |
| B7 | 🟡 | **`getPlatformStats().avgYield` is computed and never used** | Use it in the stats bar (§T1) or drop it |
| B8 | 🟡 | **Root `app/loading.tsx` spinner flashes on every route** (documented in your own comment) | Consider per-route `loading.tsx` only, so cold loads show a shaped skeleton instead of a bare spinner |
| B9 | 🟡 | **Deleted `property-card-skeleton.tsx`** still referenced in `PROJECT_PLAN.md` | Update the plan doc |
| B10 | 🟡 | **No `revalidate` on `/properties`** — every visit runs 3 uncached queries | Cache filter options (§S8) |
| B11 | 🟡 | **`formatCompactINR` rounds to 1 decimal** — ₹2,49,999 renders as "₹2.5 L", which reads as a rounded-up minimum ticket | Round *down* for minimums, or show exact values on the detail page |
| B12 | 🟡 | **No `metadata` on the 404 page** | Add `export const metadata = { title: "Page not found" }` |

---

# 9. Data model — fields you'll need

To support everything above, `properties` needs:

```ts
// db/schema/properties.ts — additions
summary:             text("summary"),                                    // short card/hero blurb (fixes D1)
highlights:          text("highlights").array().notNull().default([]),   // per-property, real (fixes T8)
monthlyRent:         numeric("monthly_rent"),                            // shows the yield working
occupancyRate:       numeric("occupancy_rate"),
platformFeePct:      numeric("platform_fee_pct"),                        // fee transparency
managementFeePct:    numeric("management_fee_pct"),
exitFeePct:          numeric("exit_fee_pct"),
reraNumber:          text("rera_number"),                                // verifiable credibility
tenantName:          text("tenant_name"),                                // commercial assets
leaseEndDate:        date("lease_end_date"),
rentEscalationPct:   numeric("rent_escalation_pct"),
latitude:            numeric("latitude"),                                // map
longitude:           numeric("longitude"),
documents:           text("documents").array().notNull().default([]),    // Supabase Storage URLs
propertyRisks:       text("property_risks").array().notNull().default([]),
investorCount:       integer("investor_count").notNull().default(0),     // real, not derived (fixes T7)
isFeatured:          boolean("is_featured").notNull().default(false),
yearBuilt:           integer("year_built"),
managedBy:           text("managed_by"),
```

And `leads`:

```ts
enquiryType: text("enquiry_type").notNull().default("investor"),
source:      text("source"),          // 'contact' | 'interest' | 'notify' | 'list_property'
utmSource:   text("utm_source"),
utmMedium:   text("utm_medium"),
utmCampaign: text("utm_campaign"),
pageUrl:     text("page_url"),        // which page produced the lead
contactedAt: timestamp("contacted_at", { withTimezone: true }),
notes:       text("notes"),           // your team's follow-up notes
```

**One more thing on featuring:** `getFeaturedProperties()` currently picks the *most-funded* fundraising properties. That means the home page promotes the ones closest to closing — the ones that need promotion least. With an `isFeatured` flag you can promote deliberately; a sensible default is *least*-funded-but-credible, so home-page traffic pushes the properties that actually need capital.

---

# 10. Prioritised roadmap

## 🔴 P0 — before you send any traffic (est. 3–5 days)

| # | Task | Where |
|---|---|---|
| 1 | Remove or make real every fabricated statistic | `stats-bar.tsx`, `sidebar.tsx` |
| 2 | Fix or substantiate "SEBI Compliant" and the trust-strip claims | `hero.tsx`, `trust-strip.tsx` |
| 3 | Real phone, email, WhatsApp, address via `lib/site-config.ts` | `contact/page.tsx`, footer |
| 4 | Real property photos (or honest "photos coming soon" placeholders) | Supabase Storage, seed |
| 5 | Build `/about` with real people and real due-diligence process | new route |
| 6 | Publish Privacy, Terms, Risk Disclosure + footer disclaimer + form consent | new routes, footer, forms |
| 7 | Remove the fake "Login" button | `navbar.tsx` |
| 8 | Rebuild "Why Fractional" as real HTML text | `why-fractional.tsx` |
| 9 | Add `error.tsx` boundary | `app/error.tsx` |
| 10 | Replace the default Next.js favicon | `app/favicon.ico` |

## 🟠 P1 — first two weeks (est. 5–8 days)

| # | Task |
|---|---|
| 11 | Property detail: fees, rent breakdown, documents, map, property-specific risks |
| 12 | Sticky mobile CTA + status-aware sidebar (waitlist for funded/closed) |
| 13 | Reinstate How-It-Works summary + trust strip on the home page |
| 14 | Lead notification webhook — stop leads sitting unseen |
| 15 | Analytics + `/thank-you` page + conversion events |
| 16 | Honeypot + rate limiting on both forms |
| 17 | OG images (default + per-property), `sitemap.ts`, `robots.ts` |
| 18 | Result count, end-of-list state, fetch error handling on `/properties` |
| 19 | Fix the similar-properties query |
| 20 | Fix "Invest Now" → "View details" / "Register interest" |
| 21 | Fix gold-on-white contrast; raise 9px text |
| 22 | `autoComplete` + `type="tel"` on all form fields |
| 23 | Expand FAQ to 18–25 questions; add fees/tax/KYC/NRI to How It Works |
| 24 | Make "Invest from ₹1 Lakh" dynamic (or list a ₹1 L property) |

## 🟡 P2 — first two months

| # | Task |
|---|---|
| 25 | Testimonials / investor stories |
| 26 | `/list-your-property` — open the supply side |
| 27 | JSON-LD (Organization, FAQPage, BreadcrumbList, RealEstateListing) |
| 28 | Blog / Insights + first 5 posts |
| 29 | Gallery lightbox so all photos are reachable |
| 30 | Inline email capture for "Notify Me" |
| 31 | Property comparison feature (compare 2–3 side by side) |
| 32 | Shortlist / save (the `Heart` icon is already imported and unused) |
| 33 | Canonical + `noindex` on filtered listing URLs |
| 34 | Repo hygiene: README, stray temp file, unused `public/` SVGs |
| 35 | Skip link, progress-bar labels, `aria-hidden` on decorative icons |

---

# 11. What is already good

Worth stating plainly, because the fixes above are mostly *content and trust* problems, not engineering ones:

- **Genuinely solid architecture** — server components, server actions, Drizzle queries cleanly separated in `lib/queries/`, sensible schema design.
- **URL-driven filters** — shareable, bookmarkable, back/forward-safe. Many production sites get this wrong.
- **Mobile-first throughout** — the dual card layouts in `property-list-card.tsx` (compact 2-up on mobile, horizontal on desktop) are a thoughtful touch, not a default.
- **Route-specific skeletons** that match the real layout — better than most sites ship.
- **Indian currency formatting** (`₹5 Cr`, `₹2.5 L`) — correct for the audience, and easy to get wrong.
- **Good code comments** explaining *why*, not *what* — the hero gradient and root-loading notes are exactly right.
- **Real data throughout** — no hardcoded property arrays. Everything comes from the database.

The engineering is ahead of the content. Closing that gap is what the P0 list is.

---

*End of report.*
