# GharShare — Website Audit & Improvement Plan

**Audited:** 18 August 2026
**Perspective:** Customer/prospective investor + senior web engineer
**Scope:** Every route, component, query, form and content block in the repo (`app/`, `components/`, `lib/`, `db/`)
**Business model reviewed against:** Lead-generation marketing site for fractional real-estate investment in India. Visitor journey = *discover → understand → trust → submit interest → get called*.

---

## How to read this report

Every finding has an ID, a severity, the **customer impact** (why a real visitor cares), and a **fix** you can act on directly — with code where code is the answer.

| Severity | Meaning |
|---|---|
| 🔴 **P0** | Blocks launch. Legal/trust risk, or the visitor leaves. Fix before you send traffic. |
| 🟠 **P1** | Costs you conversions or credibility every day. Fix in the first 2 weeks. |
| 🟡 **P2** | Quality, polish, compounding SEO. Fix in the first 1–2 months. |

---

# 0. Executive summary

You have built a **technically clean, visually competent site**. The engineering is genuinely good: real DB-backed data, server actions, URL-driven filters, infinite scroll, skeletons, mobile-first layouts. That is not the problem.

**The problem is that the site does not yet earn the right to ask someone for ₹2.5 lakh.**

A visitor to a fractional-investment site asks five questions, in this order:

1. *What is this?* — ✅ answered well
2. *Is it real / who is behind it?* — ❌ **not answered anywhere on the site**
3. *Is my money safe, and what are the rules?* — ❌ largely unanswered
4. *What exactly am I buying, and at what cost?* — ⚠️ partly answered; no fees, no documents, no rent numbers
5. *What happens after I submit?* — ⚠️ vaguely answered

The site answers #1 confidently and then goes quiet. Worse, in the places where it *tries* to build trust, it uses **invented numbers and placeholder contact details** — the fastest way to lose a cautious investor, and in India a real advertising-standards and regulatory exposure.

## The 12 things that matter most

| # | Issue | Severity | Where |
|---|---|---|---|
| 1 | Fabricated social proof — "327+ Happy Investors", "₹56.2 L+ Rental Income Distributed", "₹18,000 Cr+ AUM" | 🔴 P0 | `components/home/stats-bar.tsx`, `components/properties/sidebar.tsx` |
| 2 | Those numbers contradict each other — Home says 327+ investors, Properties says 500+ | 🔴 P0 | same two files |
| 3 | "SEBI Compliant Structure" claimed with nothing behind it | 🔴 P0 | `components/home/hero.tsx` |
| 4 | Placeholder contact details — `+91 98765 43210`, `hello@gharshare.in` (the universally-known fake Indian number) | 🔴 P0 | `app/contact/page.tsx` |
| 5 | **No About/Team page** — nobody can find out who runs this company | 🔴 P0 | missing route |
| 6 | **No Privacy Policy / Terms / Risk Disclosure** while collecting name, phone, email, investment intent (DPDP Act 2023) | 🔴 P0 | missing routes |
| 7 | Random stock photos (`picsum.photos`) presented as the actual properties | 🔴 P0 | `db/seed/seed.ts` |
| 8 | Navbar "Login" button silently goes to the contact form — there is no login | 🔴 P0 | `components/layout/navbar.tsx` |
| 9 | Property detail page has **no fees, no documents, no rent breakdown, no map, no property-specific risks** | 🟠 P1 | `app/properties/[slug]/page.tsx` |
| 10 | Home page has **no "how it works"** (component deleted) and **no trust strip** (commented out) | 🟠 P1 | `app/page.tsx` |
| 11 | "Invest from ₹1 Lakh" promised everywhere; the cheapest live property is ₹2 L | 🟠 P1 | hero / listing header vs. seed data |
| 12 | No lead alerting and no analytics — a 2 a.m. lead sits unseen until someone opens Supabase | 🟠 P1 | descoped in `PROJECT_PLAN.md` |

Fix items 1–8 and the site moves from *"looks like something I should Google first"* to *credible*. Everything after that is upside.

---

# 1. Page inventory — what you have vs. what this business needs

| Page | Status | Verdict |
|---|---|---|
| Home `/` | ✅ Built | Content **too thin** — §3.1 |
| Properties `/properties` | ✅ Built | Content **about right**; missing result count and context — §3.2 |
| Property detail `/properties/[slug]` | ✅ Built | Content **seriously insufficient** for an investment decision — §3.3 |
| How It Works `/how-it-works` | ✅ Built | **Thin** — no fees, tax, KYC, timeline — §3.4 |
| FAQ `/faq` | ✅ Built | **Too thin** — only 5 questions — §3.5 |
| Contact `/contact` | ✅ Built | Missing address, hours, enquiry type, consent — §3.6 |
| 404 | ✅ Built | Fine, minor improvements |
| **About Us / Team** | ❌ **Missing** | 🔴 Non-negotiable for an investment platform |
| **Privacy Policy** | ❌ **Missing** | 🔴 Legally required — you collect personal data |
| **Terms of Use** | ❌ **Missing** | 🔴 Required |
| **Risk Disclosure** | ❌ **Missing** | 🔴 Required for investment content |
| **List Your Property** (owner/developer side) | ❌ **Missing** | 🟠 Half your marketplace has no front door |
| **Testimonials / Investor Stories** | ❌ **Missing** | 🟠 Highest-leverage trust asset you can add |
| **Blog / Insights** | ❌ **Missing** | 🟡 Your entire organic-search engine |
| **Resources** (tax guide, glossary, sample docs) | ❌ **Missing** | 🟡 Converts researchers into leads |
| **Thank-you page** (post-submission URL) | ❌ **Missing** | 🟠 You cannot fire an ad conversion without one |
| `sitemap.xml`, `robots.txt` | ❌ **Missing** | 🟠 Google indexing |
| `error.tsx` boundary | ❌ **Missing** | 🟠 A paused Supabase = raw Next.js error screen |

---

# 2. Trust & credibility — the highest-risk area

This section decides whether the business works. Every item here is 🔴 or 🟠.

## T1 🔴 Invented statistics presented as fact

**`components/home/stats-bar.tsx`**

```tsx
const stats = [
  { icon: Users, value: "327+", label: "Happy Investors" },                    // ← invented
  { icon: Building2, value: `${propertyCount}+`, label: "Properties Funded" }, // ← mislabelled
  { icon: IndianRupee, value: `${formatCompactINR(totalRaised)}+`, label: "Total Invested" },
  { icon: TrendingUp, value: "₹56.2 L+", label: "Rental Income Distributed" }, // ← invented
];
```

**`components/properties/sidebar.tsx`**

```tsx
const MARKET_SNAPSHOT = [
  { value: "6.8%",        label: "Avg. Rental Yield" },                    // ← unsourced
  { value: "8.5%",        label: "Avg. Property Appreciation (p.a.)" },    // ← unsourced
  { value: "₹18,000 Cr+", label: "Real Estate Asset under Management" },   // ← invented
  { value: "500+",        label: "Happy Investors" },                      // ← contradicts Home's 327+
];
```

**Why this is the worst problem on the site:**

- **Two different "Happy Investors" numbers on two pages.** A careful investor who spots this concludes *every* number on the site is made up — including the yields. That's the whole product's credibility gone in one glance.
- **"₹18,000 Cr+ AUM"** would make you one of India's largest platforms. Nobody believes it from a site with 7 listings, and it invites exactly the scrutiny you don't want.
- **Claiming rental income you haven't distributed** is a misleading advertisement under ASCI's code, and for an investment product potentially far more serious.
- **"Properties Funded" is actually `propertyCount`** — total listings including `fundraising` and `closed`. It currently reads "7+ Properties Funded" when only one or two are funded. That's a factual error by your own database.

**Fix — Option A (recommended): make every number real, or remove it.**

```tsx
// components/home/stats-bar.tsx
import { Building2, IndianRupee, TrendingUp, CheckCircle2 } from "lucide-react";
import { formatCompactINR } from "@/lib/format";

export function StatsBar({
  propertyCount, fundedCount, totalRaised, avgYield,
}: {
  propertyCount: number; fundedCount: number; totalRaised: number; avgYield: number;
}) {
  const stats = [
    { icon: Building2,    value: String(propertyCount),           label: "Properties Listed" },
    { icon: CheckCircle2, value: String(fundedCount),             label: "Fully Funded" },
    { icon: IndianRupee,  value: formatCompactINR(totalRaised),   label: "Committed by Investors" },
    { icon: TrendingUp,   value: `${avgYield.toFixed(1)}%`,       label: "Avg. Est. Rental Yield" },
  ];
  /* ...rendering unchanged... */
}
```

Add `fundedCount` to the query:

```ts
// lib/queries/properties.ts — inside getPlatformStats()
const [row] = await db
  .select({
    propertyCount: sql<number>`count(*)::int`,
    fundedCount:   sql<number>`count(*) filter (where ${properties.status} = 'fully_funded')::int`,
    totalRaised:   sql<string>`coalesce(sum(${properties.amountRaised}), 0)`,
    avgYield:      sql<string>`coalesce(avg(${properties.estAnnualYield}), 0)`,
  })
  .from(properties);
```

**Fix — Option B (pre-launch, no numbers yet): swap the *proof* bar for a *promise* bar.** Honest, and it still converts:

> **₹1 L** minimum ticket · **100%** legal due diligence on every listing · **0** hidden fees · **48 hrs** typical response time

**For the Market Snapshot sidebar:** keep it only if you cite the source, and label it as market data, not your data.

```tsx
<p className="text-xs text-muted-foreground">
  India Real Estate Overview · Source: Knight Frank India Residential Report, H1 2026
</p>
```

…and **delete the "500+ Happy Investors" tile** — it isn't market data, it's a self-claim, and it contradicts the home page.

---

## T2 🔴 "SEBI Compliant Structure" with nothing behind it

`components/home/hero.tsx` shows three badges: *SEBI Compliant Structure*, *Legally Secured*, *Transparent & Trusted*.

"SEBI Compliant" is not a badge anyone can self-award. Fractional real-estate platforms in India fall under SEBI's **SM REIT (Small and Medium REIT)** framework. If you're registered, say so with the number — that is enormously persuasive. If you're not, this line is a liability.

**If registered:**

```tsx
<div className="flex items-center gap-1.5 text-[13px] text-white">
  <ShieldCheck className="size-3.5 text-gold" />
  SEBI-registered SM REIT · Reg. No. IN/SMREIT/XX/XXXX
</div>
```

**If not registered — use descriptive, defensible language:**

```tsx
const TRUST_POINTS = [
  { icon: ShieldCheck,  label: "Title-verified properties" },
  { icon: Lock,         label: "Funds held in escrow" },
  { icon: CheckCircle2, label: "Independent legal due diligence" },
];
```

Each of those is a statement about your *process*, which you control — not about your *regulatory status*, which you don't.

Same rule applies to `components/home/trust-strip.tsx`, which claims *SEBI Compliant*, *RERA Compliant*, *Escrow Account*, *Bank Grade Security*. RERA compliance belongs to the **project**, not to you — move it onto individual property cards where it's actually true, with the RERA registration number shown.

---

## T3 🔴 Placeholder contact details are live

```tsx
// app/contact/page.tsx
{ value: "+91 98765 43210", href: "tel:+919876543210" },
{ value: "hello@gharshare.in", href: "mailto:hello@gharshare.in" },
{ value: "+91 98765 43210", href: "https://wa.me/919876543210" },
```

`98765 43210` is *the* sample phone number in India — it appears in every form tutorial in the country. A prospective investor recognises it instantly. Combined with the invented stats, the site reads as a template someone forgot to fill in.

**Fix:** real details, held in one config file so they're changeable without hunting through components:

```ts
// lib/site-config.ts  (new file)
export const SITE = {
  name: "GharShare",
  legalName: "GharShare Technologies Pvt. Ltd.",   // ← your real entity
  cin: "U70200KA2026PTC000000",                    // ← real CIN
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+91 00000 00000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@gharshare.in",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "910000000000",
  address: "Floor X, Building, Street, City 560001",
  hours: "Mon–Sat, 10:00 – 19:00 IST",
  url: "https://gharshare.in",
} as const;
```

Then import `SITE` in the contact page, the footer, and the WhatsApp button.

---

## T4 🔴 Nobody can find out who you are

There is no About page, no team, no registered address, no company name, no CIN, no founding story, no advisors. The footer says only `© 2026 GharShare. All rights reserved.`

For a ₹1 lakh+ decision this is the single biggest unanswered objection. Every competitor in this space leads with founders' faces and credentials, because that's what converts.

**Fix:** build `/about` (spec in §5.1) **and** expand the footer:

```tsx
// components/layout/footer.tsx — under the logo blurb
<div className="mt-4 space-y-1 text-xs text-white/60">
  <p>{SITE.legalName}</p>
  <p>{SITE.address}</p>
  <p>CIN: {SITE.cin}</p>
</div>
```

The footer also needs a **Legal** column (Privacy, Terms, Risk Disclosure), social links, and the persistent risk disclaimer from **T9**.

---

## T5 🔴 Stock photos standing in for real assets

`db/seed/seed.ts` generates `https://picsum.photos/seed/<slug>-<n>/1200/800` — random photographs. On the live site these render as "Skyline Residency, Bandra West" over a picture of, say, a forest road.

The photo is the first thing anyone looks at. A mismatched photo on an investment site isn't cosmetic — it's a representation about the asset.

**Fix (before launch, no exceptions):**

1. Upload real photos to Supabase Storage (already allow-listed in `next.config.ts`).
2. Until a listing has real photos, **don't show a random one** — show an honest placeholder:

```tsx
// components/properties/property-card.tsx (also list-card and gallery)
{property.images[0] ? (
  <Image src={property.images[0]} alt={`${property.title}, ${property.shortLocation}`} fill ... />
) : (
  <div className="flex h-full items-center justify-center bg-navy-light">
    <span className="text-xs font-medium text-muted-foreground">Photos coming soon</span>
  </div>
)}
```

3. Caption the gallery: *"Photographs taken on <date> at the property"* — or, if renders, *"Architectural render — actual property may differ"*. One line turns a liability into a credibility signal.

---

## T6 🔴 A "Login" button that isn't a login

```tsx
// components/layout/navbar.tsx  (and again in the mobile sheet)
<Button render={<Link href="/contact" />} ...>Login</Button>
```

The visitor clicks Login expecting an account and lands on a contact form. It reads as bait-and-switch, it makes people think their session broke, and it implies you have accounts — raising "where's my dashboard?" questions you can't answer (there's no auth in this project, by design).

**Fix:** remove it, or make it honest. The highest-converting replacement is a direct line to a human:

```tsx
<Button
  render={<Link href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" />}
  nativeButton={false}
  variant="outline"
  className="h-10 rounded-[12px] px-4 text-sm"
>
  Talk to an advisor
</Button>
```

Apply the same change in the mobile sheet, which duplicates the "Login" button.

---

## T7 🟠 Fabricated investor counts on listings

```tsx
// app/properties/[slug]/page.tsx and components/properties/property-list-card.tsx
const targetInvestors  = Math.round(fundingTarget / minInvestment);
const currentInvestors = Math.round(amountRaised / minInvestment);
// rendered as "12 / 200 investors"
```

That's arithmetic, not a fact — it assumes every investor puts in exactly the minimum. Rendered as "12 / 200 investors", the visitor reads it as a count of real people.

**Fix — either** store the real number:

```ts
// db/schema/properties.ts
investorCount: integer("investor_count").notNull().default(0),
```

**or** replace it with something true *and* more persuasive:

```tsx
<span className="text-muted-foreground">
  {formatCompactINR(amountRaised)} raised of {formatCompactINR(fundingTarget)}
  {` · ${formatCompactINR(fundingTarget - amountRaised)} remaining`}
</span>
```

"₹1.85 Cr remaining" creates real urgency without inventing anything.

---

## T8 🟠 Generic "highlights" identical on every property

`components/properties/property-highlights.tsx` hardcodes *Prime Location*, *High Rental Demand*, *Quality Construction — Premium specifications*, *Appreciation Potential* for **every** listing.

A visitor who opens two properties sees identical highlights and correctly concludes it's decoration. Filler reduces trust; it doesn't add any.

**Fix:** make highlights per-property data.

```ts
// db/schema/properties.ts
highlights: text("highlights").array().notNull().default([]),
// e.g. ['Leased to a Fortune-500 IT tenant until 2031',
//       '400 m from Whitefield metro (opening 2027)',
//       '7% annual rent escalation clause']
```

Render only what exists; hide the section when the array is empty. Three specific, verifiable facts beat four generic ones every time.

---

## T9 🟠 No risk disclaimer where visitors will actually see it

Risk appears in exactly one place: FAQ question #4. It's absent from the home page, the listing page, and the property detail page — i.e. from every page where someone forms an investment intention.

**Fix — persistent footer disclaimer:**

```tsx
// components/layout/footer.tsx — above the copyright line
<div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4 text-[11px] leading-relaxed text-white/60">
  <strong className="text-white/80">Risk disclosure:</strong> Real estate investments are
  subject to market risk. Estimated yields and projected appreciation shown on this site are
  forward-looking estimates based on current market data — they are not guaranteed returns.
  Past performance does not indicate future results. Property values can fall as well as rise,
  rental income may be delayed or interrupted, and exit timelines may extend beyond the stated
  horizon. Nothing on this website constitutes investment, legal, or tax advice. Please read
  all property-specific documentation and consult an independent financial adviser before investing.
</div>
```

**And on the detail page**, directly under the Investment Overview block:

```tsx
<p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
  Estimated yield and projected appreciation are estimates, not guarantees.
  Read the full <Link href="/risk-disclosure" className="underline">risk disclosure</Link>.
</p>
```

---

## T10 🟠 Forms collect personal data with no privacy notice or consent

`ContactForm` and `InterestForm` collect name, phone, email and intended investment amount. There is no privacy policy link, no consent checkbox, no statement of use. Under India's **DPDP Act 2023**, notice and consent at the point of collection are required.

The interest form's current reassurance — *"Your data is safe with us"* — is a claim with nothing behind it, and it's weaker than a link to an actual policy.

**Fix:**

```tsx
// components/properties/interest-form.tsx — replace the "Your data is safe with us" line
<p className="text-center text-xs leading-relaxed text-muted-foreground">
  By submitting, you agree to be contacted by GharShare about this property and consent to
  your details being processed as described in our{" "}
  <Link href="/privacy" className="underline hover:text-navy">Privacy Policy</Link>.
  We never sell your data.
</p>
```

For a stricter posture, make it an explicit checkbox wired into Zod:

```ts
// lib/validation/interest.ts
consent: z.literal(true, { message: "Please accept the privacy policy to continue" }),
```

---

# 3. Page-by-page content audit

## 3.1 Home `/` — **content is too thin**

Current sections: Hero → Stats → Featured Properties → Why Fractional (3 images) → CTA banner.

### H1 🟠 The "how it works" section was deleted and never replaced

`components/home/how-it-works-summary.tsx` is deleted (visible in git status) and `app/page.tsx` no longer renders it. The page now jumps from "here are numbers" straight to "here are ₹5 Cr properties" — a first-time visitor who doesn't know what fractional ownership *is* has no on-ramp.

**Fix:** reinstate a four-step strip between Featured Properties and the CTA. You already have unused artwork at `public/assets/images/steps.png` and `property_steps.png`.

```tsx
// components/home/how-it-works-summary.tsx
import Link from "next/link";
import { Search, HandCoins, ClipboardCheck, TrendingUp } from "lucide-react";

const STEPS = [
  { icon: Search,         title: "Browse",          text: "Explore title-verified, income-generating properties." },
  { icon: HandCoins,      title: "Submit interest", text: "Tell us your amount. No payment at this stage." },
  { icon: ClipboardCheck, title: "Get onboarded",   text: "We share full documentation and complete KYC with you." },
  { icon: TrendingUp,     title: "Earn returns",    text: "Receive your share of rental income and appreciation." },
];

export function HowItWorksSummary() {
  return (
    <section className="bg-cream py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">How it works</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          From browsing a property to your first rental payout — four steps, no jargon.
        </p>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-border bg-card p-5">
              <span className="flex size-10 items-center justify-center rounded-full bg-navy text-white">
                <step.icon className="size-5" />
              </span>
              <p className="mt-4 text-xs font-medium text-brand-green">Step {i + 1}</p>
              <h3 className="mt-1 font-semibold text-navy">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
        <Link href="/how-it-works" className="mt-8 inline-flex text-sm font-medium text-navy underline underline-offset-4">
          See the full process, fees and timelines →
        </Link>
      </div>
    </section>
  );
}
```

### H2 🟠 The trust strip is built but commented out

```tsx
// app/page.tsx
{/* <TrustStrip /> */}
```

You built the trust section and then disabled it. Re-enable it — after correcting the claims per **T2** — and place it immediately after the hero, where objections are strongest.

### H3 🔴 "Why Fractional" is three flat PNGs with all the content baked in

```tsx
// components/home/why-fractional.tsx — this is the whole section
<Image src="/assets/images/why_fractional.png" alt="Why Fractional Real Estate?" ... />
<Image src="/assets/images/traditional_vs_fractional.png" alt="Traditional vs Fractional" ... />
<Image src="/assets/images/transparent_money.png" alt="Your money. Fully transparent." ... />
```

This is your most persuasive content, and it is invisible to:

- **Google** — zero indexable text. This section could rank for "fractional real estate investment India"; instead it contributes nothing.
- **Screen readers** — a blind visitor gets four words in total. (WCAG 1.1.1 failure — images of text.)
- **Mobile users** — text baked into a fixed-ratio image can't reflow. At 375 px these stack in a column; whatever body copy is inside them is unreadable.
- **Anyone who zooms** — image text pixelates; real text doesn't.

**Fix:** rebuild as HTML. Keep illustration as a decorative accent, never as the content carrier.

```tsx
// components/home/why-fractional.tsx
import { Coins, ShieldCheck, LineChart } from "lucide-react";

const PILLARS = [
  {
    icon: Coins,
    title: "Own premium property from ₹1 Lakh",
    body: "A ₹5 crore Grade-A office is out of reach for most people. Fractional ownership splits it into shares, so you can hold a stake in the same asset institutions buy — without a home loan, and without locking your savings into one property.",
  },
  {
    icon: LineChart,
    title: "Two ways to earn",
    body: "You receive your proportional share of the rent the property generates, distributed periodically, plus your share of any capital appreciation when the property is sold at the end of the stated horizon.",
  },
  {
    icon: ShieldCheck,
    title: "Fully managed, fully transparent",
    body: "Tenanting, maintenance and compliance are handled by a professional manager. You get periodic reports showing rent collected, expenses incurred and what was distributed to you — with fees stated upfront on every listing.",
  },
];

export function WhyFractional() {
  return (
    <section id="why-fractional" className="scroll-mt-20 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          Why fractional real estate?
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex size-11 items-center justify-center rounded-full bg-gold-light text-navy">
                <p.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-navy">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Traditional vs fractional — a real table, not an image */}
        <div className="mt-10 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-navy-light text-navy">
              <tr>
                <th className="px-5 py-3 text-left font-semibold"></th>
                <th className="px-5 py-3 text-left font-semibold">Buying outright</th>
                <th className="px-5 py-3 text-left font-semibold">Fractional with GharShare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Capital needed",  "₹50 lakh – ₹5 crore",             "From ₹1 lakh"],
                ["Diversification", "One property, one city",          "Several properties, several cities"],
                ["Management",      "You handle tenants and repairs",  "Professionally managed"],
                ["Paperwork",       "Registration, loan, compliance",  "Handled during onboarding"],
                ["Exit",            "Find a buyer yourself",           "Planned exit at end of horizon"],
              ].map(([label, a, b]) => (
                <tr key={label}>
                  <td className="px-5 py-3 font-medium text-navy">{label}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a}</td>
                  <td className="px-5 py-3 font-medium text-brand-green">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
```

### H4 🟠 The "Why GharShare" nav link is broken

```tsx
// components/layout/navbar.tsx
{ href: "/#why-fractional", label: "Why GharShare" },
```

No element in the codebase has `id="why-fractional"`. The link lands on the home page and scrolls nowhere. **Fixed by the `id` + `scroll-mt-20` in the H3 snippet above.**

### H5 🟠 Home is missing the sections that actually close visitors

Add these, in this order, after "Why Fractional":

1. **Testimonials / investor stories** — even three short quotes with a real name, city and photo. Highest-ROI content you can add to this site.
2. **"As featured in" / partner logos** — legal partner, valuation partner, escrow bank. Borrowed credibility works.
3. **FAQ teaser** — the top four questions inline, linking to `/faq`. Answering objections in place beats making people navigate away.
4. **Founder note** — two sentences and a face, linking to `/about`.

### H6 🟡 Hero copy contradicts the actual inventory

Hero: *"with as little as ₹1 Lakh"*. Listing header: *"Invest from ₹1 Lakh"*. But the cheapest `minInvestment` in your data is **₹2,00,000**, and most are ₹2.5–5 L.

A visitor who clicks that promise and finds ₹2.5 L minimums feels baited. Either list something at ₹1 L, or make the copy dynamic:

```ts
// lib/queries/properties.ts
export async function getMinTicket(): Promise<number> {
  const [row] = await db
    .select({ min: sql<string>`min(${properties.minInvestment})` })
    .from(properties)
    .where(eq(properties.status, "fundraising"));
  return Number(row?.min ?? 0);
}
```

Render `Invest from {formatCompactINR(minTicket)}` in both places — true forever, zero maintenance.

---

## 3.2 Properties `/properties` — **close to right, a few gaps**

### L1 🟠 No result count is shown

`totalCount` is fetched and passed into `PropertyInfiniteList`, but only used for `hasMore` — it's never rendered. The user can't tell whether their filter returned 3 results or 300. (`PROJECT_PLAN.md` claims a "Showing X properties" line exists; it doesn't.)

```tsx
// app/properties/page.tsx — above the grid
<p className="text-sm text-muted-foreground">
  Showing <span className="font-medium text-navy">{results.length}</span> of{" "}
  <span className="font-medium text-navy">{totalCount}</span>{" "}
  {totalCount === 1 ? "property" : "properties"}
</p>
```

### L2 🟠 Infinite scroll has no end-state and no error handling

`PropertyInfiniteList` observes a sentinel and appends. When the list is exhausted nothing is said — the page just stops. A failed `fetch` is unhandled: `res.json()` on a 500 throws an uncaught rejection, `loadingRef` never resets, and the list silently freezes forever.

```tsx
const loadMore = useCallback(async () => {
  if (loadingRef.current) return;
  loadingRef.current = true;
  setLoading(true);
  try {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageRef.current + 1));
    const res = await fetch(`/api/properties?${params}`);
    if (!res.ok) throw new Error("Failed to load");
    const data: { properties: Property[] } = await res.json();
    pageRef.current += 1;
    setProperties((prev) => [...prev, ...data.properties]);
    setError(null);
  } catch {
    setError("Couldn't load more properties.");
  } finally {
    loadingRef.current = false;
    setLoading(false);
  }
}, [searchParams]);
```

```tsx
{error && (
  <div className="mt-6 text-center">
    <p className="text-sm text-muted-foreground">{error}</p>
    <Button variant="outline" onClick={loadMore} className="mt-2">Try again</Button>
  </div>
)}
{!hasMore && properties.length > 6 && (
  <p className="mt-8 text-center text-sm text-muted-foreground">
    That&apos;s all {totalCount} properties. Want to hear when new ones list?{" "}
    <Link href="/contact" className="font-medium text-navy underline">Get notified</Link>
  </p>
)}
```

### L3 🟡 "Notify Me" leads to a five-field form

Both `PropertiesSidebar` and `NotifyBarMobile` route "Notify Me" to `/contact`. For an email alert that's far too much friction — expect very low completion.

**Fix:** a one-field inline email capture writing to `leads` with `source: 'notify'`, with an inline success state. One input, one button.

### L4 🟡 No reassurance or context around the filters

Filters work but are unexplained. Add a line under the header — *"Every property is title-verified and legally vetted before it's listed"* — and consider a **yield range** filter, which is what investors actually filter on.

---

## 3.3 Property detail `/properties/[slug]` — **the biggest content gap on the site**

This is where the money decision happens. It currently shows: gallery, title, location, truncated description, quick facts, tags, investment overview (4 stats + progress), trust panel, full description, amenities, generic highlights, interest form, similar properties.

**What a serious investor needs and cannot find anywhere:**

| Missing | Why it matters |
|---|---|
| **Fee disclosure** — platform fee, management fee, exit/performance fee | The #1 unasked question. Silence reads as "hidden fees". |
| **Rent breakdown** — monthly rent, gross vs. net yield, occupancy, escalation | "9.5% yield" with no working is an assertion, not evidence. |
| **Documents** — title report, valuation report, legal due-diligence summary, sample agreement | Downloadable documents are the strongest trust signal available to you. |
| **Location map + neighbourhood context** | "Bandra West" means nothing to a Bangalore investor. |
| **Tenant details** (commercial) — tenant, lease term, lock-in, escalation | For a leased asset, this *is* the investment. |
| **Property-specific risks** | Generic FAQ risk text ≠ "this lease expires in 2029". |
| **Exit mechanics for this property** | Horizon is shown; the exit route isn't. |
| **RERA number / legal identifiers** | Verifiable equals credible. |
| **Who manages it** | A named manager beats "a property manager". |

### D1 🟠 The description is printed twice

```tsx
<p className="mt-3 text-muted-foreground">{truncateText(property.description, 180)}</p>
...
<h2>About this property</h2>
<p className="mt-3 whitespace-pre-line text-muted-foreground">{property.description}</p>
```

The visitor reads the first 180 characters, scrolls, and reads them again. **Fix:** add a short `summary` column for the top slot, or drop the truncated copy.

### D2 🟠 No sticky mobile CTA

On desktop the form is a sticky sidebar. On mobile it renders after gallery + facts + overview + trust panel + description + amenities + highlights — several screens down. Most mobile visitors never reach it, and mobile is the majority of your traffic.

```tsx
// components/properties/mobile-cta-bar.tsx
"use client";
import { formatCompactINR } from "@/lib/format";

export function MobileCtaBar({ minInvestment, status }: { minInvestment: string; status: string }) {
  if (status !== "fundraising") return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden">
      <div className="leading-tight">
        <p className="text-[11px] text-muted-foreground">Starting from</p>
        <p className="font-semibold text-navy">{formatCompactINR(Number(minInvestment))}</p>
      </div>
      <a href="#interest-form"
         className="flex h-11 flex-1 items-center justify-center rounded-lg bg-brand-green px-5 text-sm font-medium text-white">
        Register interest
      </a>
    </div>
  );
}
```

Add `id="interest-form" className="scroll-mt-24"` to the form wrapper, and `pb-24 lg:pb-0` on the page container so the bar never covers the footer.

### D3 🟠 Closed and fully-funded properties still show a live investment CTA

The sidebar always renders *"Starting from ₹X · Interested in this property?"* — even when `status === 'closed'`. Confusing at best, misleading at worst.

```tsx
{property.status === "fundraising" ? (
  <InterestForm propertyId={property.id} minInvestment={property.minInvestment} />
) : (
  <div className="rounded-xl bg-navy-light p-5 text-center">
    <p className="font-medium text-navy">
      {property.status === "fully_funded"
        ? "This property is fully funded"
        : "This opportunity has closed"}
    </p>
    <p className="mt-1 text-sm text-muted-foreground">
      Join the waitlist and we&apos;ll tell you first when a similar property lists.
    </p>
    <Button render={<Link href="/contact" />} nativeButton={false}
            className="mt-4 w-full bg-navy text-white">
      Join the waitlist
    </Button>
  </div>
)}
```

### D4 🟠 "Similar Properties" will almost always render empty

```ts
const similarProperties = await getProperties({ location: property.location }, { pageSize: 4 });
```

`location` is hyper-specific (`"Bandra West, Mumbai"`) and `buildConditions` uses exact `eq()`. With 7 listings in 7 different micro-markets this returns zero every time, so your entire cross-sell section silently never appears.

```ts
const city = property.location.split(",").pop()?.trim() ?? "";
let similar = (await getProperties({ search: city, status: "fundraising" }, { pageSize: 4 }))
  .filter((c) => c.id !== property.id);

if (similar.length === 0) {
  similar = (await getProperties({ status: "fundraising" }, { pageSize: 4 }))
    .filter((c) => c.id !== property.id);
}
const similarProperties = similar.slice(0, 3);
```

### D5 🟡 No share affordance

WhatsApp is how property research spreads in India. Add a share button — and fix OG images (§6.2), without which a shared link renders as a bare grey box.

### D6 🟡 Add a property-level FAQ block

Three or four questions inline (*"What happens if this doesn't fully fund?"*, *"When would I receive my first payout?"*, *"What fees apply?"*) remove the last objections at the point of decision, and earn FAQ rich results in Google.

---

## 3.4 How It Works — **good structure, missing the hard questions**

The copy is well written but stops at the comfortable parts. Add sections on:

| Topic | Why |
|---|---|
| **Fees, in full** | The most-searched question about every fractional platform. Its absence is conspicuous. |
| **Taxation** | Rental income as income, capital gains on exit, TDS. A clear table here converts researchers into leads. |
| **KYC & documents required** | PAN, Aadhaar, bank proof, cancelled cheque. Sets expectations, reduces drop-off at onboarding. |
| **NRI eligibility** | A large slice of this market, currently unaddressed. |
| **Timeline** | "Interest → call within 24 h → documents in 2 days → onboarded in 7 days." Concrete beats vague. |
| **Where the money sits before funding closes** | Escrow explanation removes the biggest single fear. |
| **What you receive** | Agreement, ownership certificate, quarterly reports. |
| **What happens if funding fails** | Currently buried in the accordion — promote it; it's a top-3 anxiety. |

Also: `public/assets/images/steps.png` and `property_steps.png` are unused — either use them on this page or delete them.

Add a `/contact` CTA alongside the `/properties` one. People who read this page fully often want to talk to a person, not browse more.

---

## 3.5 FAQ — **too thin at 5 questions**

Five questions is a placeholder, not an FAQ. For this category 18–25 questions across categories is the norm, and it's the best long-tail SEO asset you have available.

**Questions to add:**

*Getting started* — Who can invest? Any eligibility requirements? Can NRIs invest? What documents do I need? How long does onboarding take?

*Money & returns* — What fees does GharShare charge? How is the yield calculated? How often are payouts made? How are returns taxed? Is TDS deducted? What happens if the property is vacant?

*Ownership & legal* — Who legally owns the property? What do I actually hold? What happens if GharShare shuts down? Is the property insured? How is valuation determined? What is the SPV / SM REIT structure?

*Exit & liquidity* — Can I exit before the horizon ends? Can I sell my share to someone else? What happens at the end of the horizon? Who decides when to sell?

*Risk* — What are the risks? What if funding fails? Has any property underperformed?

**Also add:** category grouping with in-page nav, a client-side search box, a "Still have questions?" CTA (contact + WhatsApp), and `FAQPage` JSON-LD (§6.3) — that's how you earn expandable FAQ results in Google.

---

## 3.6 Contact — **functional, under-informative**

Missing: office address, business hours, a map, an enquiry-type selector, and consent.

The page promises *"we usually respond within one business day"* without stating what your business days are.

**Add an enquiry type** so leads route correctly and you learn where demand comes from:

```ts
// lib/validation/contact.ts
enquiryType: z.enum([
  "investor",       // I want to invest
  "list_property",  // I want to list a property
  "partnership",
  "support",
  "other",
]).default("investor"),
```

```ts
// db/schema/leads.ts
enquiryType: text("enquiry_type").notNull().default("investor"),
source:      text("source"),      // 'contact' | 'interest' | 'notify'
utmSource:   text("utm_source"),
utmCampaign: text("utm_campaign"),
```

UTM capture matters the moment you spend a rupee on ads — without it you cannot tell which campaign produced a lead.

Also render the address and hours from `SITE` (§T3), and embed a map if you have an office.

---

## 3.7 Errors & edge cases

### E1 🟠 There is no `error.tsx`

Your own `PROJECT_PLAN.md` notes that Supabase's free tier pauses after 7 days idle — which is exactly why the keep-alive workflow exists. If it ever pauses (or the pooler hiccups), every DB-driven page throws and the visitor sees Next.js's default *"Application error"* screen. That's the worst possible impression on a finance site.

```tsx
// app/error.tsx
"use client";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site-config";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-navy">Something went wrong</h1>
      <p className="mt-3 text-muted-foreground">
        We couldn&apos;t load this page just now. Please try again — if it keeps happening,
        call us on {SITE.phone} and we&apos;ll help you directly.
      </p>
      <Button onClick={reset} className="mt-8 bg-brand-green text-white">Try again</Button>
    </div>
  );
}
```

### E2 🟡 The 404 page is a dead end

It offers one link. Add Home, Properties and Contact, plus a `metadata` title.

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
