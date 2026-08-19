# GharShare — Page Content Map

**What information belongs on which page, and in what order.**

This is a build spec, not a critique. For every page it lists the blocks that should exist, top to bottom, marked:

| Mark | Meaning |
|---|---|
| ✅ | Already on the page and working |
| ⚠️ | On the page but thin, wrong, or in the wrong place |
| ➕ | Missing — needs to be added |
| 🆕 | Page doesn't exist yet |

**Companion documents:** [WEBSITE_AUDIT.md](WEBSITE_AUDIT.md) (content & trust) · [VISUAL_AUDIT.md](VISUAL_AUDIT.md) (rendered design)

---

## The principle behind the ordering

A fractional-property investor moves through five questions in a fixed order. Content that answers a later question before an earlier one has been answered gets skipped.

1. **What is this?** → Home, How It Works
2. **Who are you?** → About, footer, testimonials
3. **What's on offer?** → Properties listing
4. **Is this specific deal good, and what does it cost me?** → Property detail
5. **What happens if I raise my hand?** → Interest form, Thank you, Contact

Each page below is built to answer its question completely, then hand off to the next.

**One rule throughout:** every number that appears in more than one place must come from one source. The site currently states three different minimum tickets (₹1 Lakh in the hero, ₹5 Lakhs in the comparison graphic, ₹1.5 L in the actual data). Put figures like this in `lib/site-config.ts` or derive them from the database — never retype them, and never bake them into an image.

---

# 1. Home `/`

**Job:** in 30 seconds, explain the model, prove you're real, show the goods, and route people onward.

| Order | Block | Status | What it must contain |
|---|---|---|---|
| 1 | **Hero** | ✅ | Headline, one-line explainer, primary CTA (Browse), secondary CTA (How It Works), 3 trust points. ⚠️ *Minimum ticket must be pulled from live data, not typed. Trust points must be claims you can defend — see WEBSITE_AUDIT T2.* |
| 2 | **Trust strip** | ⚠️ Built, commented out | Title-verified · Independent legal due diligence · Funds in escrow · Professionally managed. Registration number if you have one. |
| 3 | **How it works — 4 steps** | ➕ Deleted | Browse → Register interest → Get onboarded → Earn returns. One line each, link to the full page. **This is the biggest gap on the page** — nothing currently explains the model. |
| 4 | **Stats** | ⚠️ Fabricated | Only real numbers: properties listed, fully funded, total committed, average estimated yield. Delete "327+ Happy Investors" and "₹56.2 L Rental Income Distributed" until they're true. |
| 5 | **Featured properties** | ✅ | 3 cards with real photos, min investment, yield, funding progress. |
| 6 | **Why fractional** | ⚠️ Images | Rebuild as HTML: 3 benefit pillars + the traditional-vs-fractional comparison table. |
| 7 | **Testimonials** | ➕ | 3 investor stories — name, city, profession, amount, the worry they had, what happened. Real ones only. |
| 8 | **Partners / credibility** | ➕ | Legal partner, valuation partner, escrow bank, press mentions. |
| 9 | **FAQ teaser** | ➕ | The 4 highest-anxiety questions inline, link to `/faq`. |
| 10 | **Founder note** | ➕ | Two sentences and a face, linking to `/about`. |
| 11 | **CTA banner** | ✅ | Closing call to action. |
| 12 | **Footer + risk disclaimer** | ⚠️ | See §10. |

**Do not put on Home:** fee schedules, tax detail, legal structure, per-property specifics. They belong deeper and they slow the page down.

---

# 2. Properties listing `/properties`

**Job:** let someone find a property matching their budget, and make each card answer "is this for me?" without a click.

| Order | Block | Status | What it must contain |
|---|---|---|---|
| 1 | **Header** | ✅ | Headline + entry ticket (from live data). |
| 2 | **Trust row** | ✅ | Vetted · Secure ownership · Transparent. |
| 3 | **Search + filters** | ✅ | Location, type, min investment, funding status, valuation range, sort. ➕ *Add a yield-range filter — investors filter on yield more than on valuation.* |
| 4 | **Result count** | ➕ | "Showing 6 of 20 properties." Currently fetched and never displayed. |
| 5 | **Reassurance line** | ➕ | "Every property is title-verified and legally vetted before listing." |
| 6 | **Property cards** | ⚠️ | Photo, status badge, **full title (no truncation)**, location, **min. investment**, **est. yield**, funding progress, ₹ remaining. ⚠️ *Mobile currently hides min investment and yield — see VISUAL_AUDIT V33.* |
| 7 | **Sidebar** | ⚠️ | Why GharShare · Market snapshot **with a cited source** · Notify me. Delete the "500+ Happy Investors" tile — it contradicts the home page. |
| 8 | **End-of-list state** | ➕ | "That's all 20 properties — want to hear when new ones list?" |
| 9 | **Empty state** | ✅ | Already handled. ➕ *Add a "clear filters" button inside it.* |

**Card rule:** replace the derived "48 / 190 Investors" with **"₹1.85 Cr remaining"**. It's true, and it creates more urgency than a fabricated headcount.

---

# 3. Property detail `/properties/[slug]`

**Job:** give someone enough to decide. This is the weakest page relative to its importance — it currently answers roughly a third of what an investor needs.

| Order | Block | Status | What it must contain |
|---|---|---|---|
| 1 | **Breadcrumb** | ✅ | |
| 2 | **Gallery** | ⚠️ | Real photos of *this* property. All images reachable (the "+N more" thumbnail currently opens nothing). Caption: photo date, or "architectural render". |
| 3 | **Title block** | ⚠️ | Status badge, name, full address, **short summary**. *Currently duplicates the full description verbatim — VISUAL_AUDIT V19.* |
| 4 | **Quick facts** | ✅ | Type, area, bedrooms, possession. ➕ *Add year built, floor, facing.* |
| 5 | **Investment overview** | ✅ | Property value, min investment, est. yield, projected appreciation, progress, ₹ remaining, hold period, closing date. |
| 6 | **💰 Fee disclosure** | ➕ | **The most important missing block on the site.** Platform fee, annual management fee, exit/performance fee, and what's *not* charged. Silence here reads as hidden fees. |
| 7 | **📊 Rent & return breakdown** | ➕ | Monthly rent, annual rent, minus expenses, net distributable, gross vs net yield, occupancy, escalation clause. **Shows the working behind "9% p.a."** — without it the yield is an assertion. |
| 8 | **🏢 Tenant & lease** (commercial) | ➕ | Tenant, lease term, lock-in, escalation %, expiry. For a leased asset this *is* the investment. |
| 9 | **📍 Location** | ➕ | Map, distance to metro/airport/business district, neighbourhood note, comparable rents. "Bandra West" means nothing to a Bangalore buyer. |
| 10 | **📄 Documents** | ➕ | Title report, valuation report, legal due-diligence summary, sample investment agreement, RERA certificate. **Strongest trust signal available to you.** Gate behind a lead form if you want — that turns them into a conversion tool. |
| 11 | **About this property** | ⚠️ | Real description — 3–4 paragraphs, not 2 sentences for a ₹6.2 Cr asset. |
| 12 | **Amenities** | ✅ | Render as chips, not full-width pills. |
| 13 | **Highlights** | ⚠️ | Per-property facts, not the same four generic lines on every listing. |
| 14 | **⚠️ Property-specific risks** | ➕ | This asset's risks — lease expiry, single-tenant concentration, micro-market supply — plus a link to the full risk disclosure. |
| 15 | **🚪 Exit for this property** | ➕ | How and when it's sold, who decides, what happens if it doesn't sell on schedule. |
| 16 | **❓ Property FAQ** | ➕ | 4 questions: what if it doesn't fully fund · when is my first payout · what fees apply · can I exit early. |
| 17 | **Similar properties** | ⚠️ Never renders | Fix the query — currently returns zero every time, so the page dead-ends. |
| 18 | **Interest form** | ✅ | Sticky sidebar on desktop; **sticky bottom bar on mobile** (currently at 88% page depth). Status-aware: waitlist copy for funded/closed. Consent line + privacy link. |

---

# 4. How It Works `/how-it-works`

**Job:** convert a curious reader into a confident one by removing every procedural unknown.

| Order | Block | Status | What it must contain |
|---|---|---|---|
| 1 | **Intro** | ✅ | |
| 2 | **The 4 steps** | ✅ | Well written. ➕ *Add the unused `steps.png` artwork — the page is currently an unbroken wall of text.* |
| 3 | **⏱️ Timeline** | ➕ | "Interest → call within 1 business day → documents in 2 days → KYC in 3 days → funds in escrow → onboarded in ~7 days." Concrete beats vague. |
| 4 | **💰 Fees** | ➕ | Every fee, in a table, with an illustrated ₹5 L example showing money in → money out. |
| 5 | **🏦 Where your money sits** | ➕ | Escrow before funding closes, who holds it, what happens if the raise fails. Removes the biggest single fear. |
| 6 | **📋 What you need (KYC)** | ➕ | PAN, Aadhaar, bank proof, cancelled cheque. Sets expectations and cuts drop-off at onboarding. |
| 7 | **🧾 Taxation** | ➕ | Rental income as income · capital gains at exit · TDS · what you receive for filing. **Top-3 search question in this category.** |
| 8 | **🌏 NRI eligibility** | ➕ | Can they invest, FEMA position, repatriation, NRE/NRO. A large slice of this market, currently unaddressed. |
| 9 | **📑 What you receive** | ➕ | Investment agreement, ownership certificate, quarterly reports, annual statement. |
| 10 | **🏛️ Legal structure** | ⚠️ In accordion | SPV / SM REIT explained plainly, with a diagram. Promote out of the accordion. |
| 11 | **❌ If funding fails** | ⚠️ In accordion | Promote — it's a top anxiety, not a footnote. |
| 12 | **Mechanics FAQ** | ✅ | |
| 13 | **Dual CTA** | ⚠️ | Browse properties **and** talk to a person. Readers who finish this page often want a human. |

---

# 5. FAQ `/faq`

**Job:** remove every remaining objection, and rank for long-tail search. Currently 5 questions; it should be 20–25, grouped.

| Group | Questions to cover |
|---|---|
| **Getting started** ✅⚠️ | What is fractional investment? · Who can invest? · Minimum ticket? · Documents needed? · How long does onboarding take? · Can NRIs invest? |
| **Money & returns** ⚠️ | How do returns work? · **What fees do you charge?** · How is yield calculated? · How often are payouts made? · **How are returns taxed?** · Is TDS deducted? · What if the property is vacant? |
| **Ownership & legal** ➕ | Who legally owns the property? · What do I actually hold? · **What happens if GharShare shuts down?** · Is the property insured? · How is valuation determined? · Who manages it day to day? |
| **Exit & liquidity** ⚠️ | How do exits work? · Can I exit early? · Can I sell my share to someone else? · Who decides when to sell? · What if it doesn't sell on schedule? |
| **Risk** ⚠️ | What are the risks? · What if a raise fails? · Has any property underperformed? · Are returns guaranteed? |

**Also add:** category navigation · a search box · a "still have questions?" CTA with phone and WhatsApp · `FAQPage` structured data.

---

# 6. Contact `/contact`

**Job:** make it effortless to reach a human, through whichever channel they prefer.

| Order | Block | Status | Notes |
|---|---|---|---|
| 1 | **Intro + response promise** | ✅ | ➕ *State the actual business hours, not just "one business day".* |
| 2 | **Direct contact** | ⚠️ | Phone, email, WhatsApp — **real details**. ⚠️ *Move above the form on mobile — VISUAL_AUDIT V39.* |
| 3 | **Enquiry type** | ➕ | Investor · List a property · Partnership · Support. Routes leads and tells you where demand comes from. |
| 4 | **Form** | ✅ | ➕ *Consent line + privacy link.* Make "Send message" full-size. |
| 5 | **Office + hours** | ➕ | Address, map, opening hours. |
| 6 | **Company details** | ➕ | Legal name, CIN, GST, registered address. |

---

# 7. 🆕 About `/about`

**Job:** answer *"who are these people?"* — currently unanswerable anywhere on the site, and the biggest single objection for a ₹1 L+ decision.

| Order | Block | What it must contain |
|---|---|---|
| 1 | **Mission** | Why you built this, in plain language. 2–3 paragraphs. |
| 2 | **The team** | Real photos, real names, real roles, LinkedIn. Prior experience matters more than anything else on this page. |
| 3 | **How we select properties** | Your due-diligence checklist made concrete: title search, encumbrance certificate, independent valuation, RERA verification, rent-roll audit, structural survey. **The section that actually converts.** |
| 4 | **How we make money** | State it plainly. Volunteering it buys more trust than it costs. |
| 5 | **Partners** | Legal firm, valuation agency, escrow bank, property managers — named. |
| 6 | **Company details** | Entity, CIN, registered address, incorporation date, GST. |
| 7 | **CTA** | Browse properties / talk to us. |

---

# 8. 🆕 List Your Property `/list-your-property`

**Job:** open the supply side. The spec says owners and agents list properties, but there is currently **no page for them at all** — every listing has to originate from an offline conversation.

| Order | Block | What it must contain |
|---|---|---|
| 1 | **Who this is for** | Owners, developers, channel partners. |
| 2 | **What we look for** | Asset type, ticket size, cities, occupancy, title status. Qualifies out bad leads before they cost you time. |
| 3 | **What you get** | Speed to liquidity, price discovery, your fee stated openly, marketing reach. |
| 4 | **Process** | Submit → valuation → legal → listing → funding → transfer. With timelines. |
| 5 | **Submission form** | Name, phone, city, property type, valuation, current rental, occupancy, RERA number → `leads` with `enquiryType: 'list_property'`. |
| 6 | **FAQ** | Fees, exclusivity, timelines, what if it doesn't fund. |

---

# 9. 🆕 Legal pages

Required, not optional, once you collect personal data and publish yield estimates. Have a lawyer review all three.

| Page | Must contain |
|---|---|
| **`/privacy`** | What you collect, why, lawful basis, retention, who it's shared with, user rights under the DPDP Act 2023, **grievance officer contact (required)**, cookies. |
| **`/terms`** | Site usage, that listings are information and **not an offer**, accuracy disclaimers, IP, limitation of liability, governing law and jurisdiction. |
| **`/risk-disclosure`** | Market risk, liquidity risk, tenant/vacancy risk, regulatory risk, concentration risk, no guaranteed returns, forward-looking-statement caveat, "not investment advice". |

---

# 10. Footer — every page

Currently: a logo, a blurb, four links, a copyright line, and an empty third column.

| Block | Status | What it must contain |
|---|---|---|
| **Brand** | ⚠️ | One logo, consistent with the navbar (currently two different marks). Blurb. |
| **Explore** | ✅ | Properties · How It Works · FAQ |
| **Company** | ⚠️ 1 link | About · Contact · List Your Property · Insights |
| **Legal** | ➕ | Privacy · Terms · Risk Disclosure |
| **Contact** | ➕ | Phone, email, WhatsApp, registered address |
| **Company details** | ➕ | Legal entity name, CIN, GST |
| **Social** | ➕ | LinkedIn, Instagram, YouTube |
| **Risk disclaimer** | ➕ | Persistent 3–4 line disclosure — full text in [WEBSITE_AUDIT.md](WEBSITE_AUDIT.md) §T9 |
| **Copyright** | ✅ | |

---

# 11. 🆕 Supporting pages

| Page | Job | Core content |
|---|---|---|
| **`/thank-you`** | Fire ad conversions on a real URL; keep momentum | What happens next and when · WhatsApp link · How It Works · 2 suggested properties |
| **`/testimonials`** | Social proof | 3–6 real investor stories: name, city, profession, amount, prior worry, outcome. Video if possible. |
| **`/insights`** | Organic search | "Is fractional real estate legal in India?" · "SM REIT vs REIT vs fractional" · "How rental income is taxed" · "Bangalore vs Mumbai commercial yields 2026" |
| **`/resources`** | Convert researchers | Tax guide, glossary, sample agreement, due-diligence checklist, yield calculator |

---

# Where each fact should live — one source, no contradictions

| Information | Home | Properties | Detail | How It Works | FAQ | About |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| What fractional ownership is | Summary | — | — | **Full** | Summary | — |
| Minimum ticket | From data | From data | Actual value | Explained | Explained | — |
| **Fees** | — | — | **This property** | **Full schedule** | Summary | How we earn |
| **Taxation** | — | — | — | **Full** | Summary | — |
| **KYC / documents needed** | — | — | — | **Full** | Summary | — |
| **Where money is held** | Trust badge | Trust badge | Trust panel | **Full** | Summary | — |
| Returns & payouts | Headline | Per card | **This property** | **Full** | Summary | — |
| **Risk** | Footer | Footer | **This property + link** | Summary | **Full** | — |
| Exit mechanics | — | — | **This property** | **Full** | Summary | — |
| Legal structure | — | — | This property's SPV | **Full + diagram** | Summary | — |
| Who runs the company | Founder note | — | — | — | — | **Full** |
| Due-diligence process | Trust strip | Reassurance line | Trust panel | Step 1 | — | **Full** |
| **NRI eligibility** | — | — | — | **Full** | Summary | — |
| Contact details | Footer | Sidebar | Form | CTA | CTA | Full |

**Reading the table:** **Full** = the canonical, authoritative version — exactly one per row. Everything else is a summary that links to it. Where a row has no **Full** cell today, that information doesn't exist anywhere on the site.

Six rows currently have no home at all: **fees, taxation, KYC, escrow, NRI eligibility, and who runs the company.** Those six are the gap between a site that looks like an investment platform and one that behaves like one.

---

*Companion to [WEBSITE_AUDIT.md](WEBSITE_AUDIT.md) and [VISUAL_AUDIT.md](VISUAL_AUDIT.md) · 19 August 2026*
