# GharShare — Visual Audit (Desktop + Mobile)

**Method:** The site was run locally against the live Supabase data and captured with Playwright in real Chrome at two viewports — **desktop 1440×900** and **mobile 390×844 (iPhone 14 class, touch enabled)**. 42 screenshots across Home, Properties, Property Detail, How It Works, FAQ, Contact and 404, plus the mobile nav drawer, the mobile filter sheet, the scrolled navbar state and the form error state. Every finding below is something I *saw rendered*, not inferred from code.

**Companion documents:** [WEBSITE_AUDIT.md](WEBSITE_AUDIT.md) (content, trust and code audit) · [PAGE_CONTENT_MAP.md](PAGE_CONTENT_MAP.md) (what information belongs on which page)

| Severity | Meaning |
|---|---|
| 🔴 **P0** | Breaks trust or function on sight. Fix before traffic. |
| 🟠 **P1** | Visibly unpolished or costs conversions. |
| 🟡 **P2** | Refinement. |

---

## First impressions, honestly

**Desktop:** The hero is genuinely good — the dark green wash, the Playfair headline with the gold accent, the photograph anchored right. It looks like a real fintech product. Then you scroll, and the quality drops off a cliff: the featured properties are photographs of a lake, a sunset ridge and a forest track.

**Mobile:** Tighter and more consistent than most sites at this stage — nothing overflows, nothing overlaps, every breakpoint holds. But the hero photograph is invisible under its own scrim, the stats bar is unreadable, and **not a single property name on the listing page is fully visible.**

**The one thing to take away:** there is no *layout* catastrophe on this site. There is a **content and consistency** catastrophe. The grid holds up; what sits inside it doesn't.

---

## Verified clean

Worth stating, because it's rare:

- **Zero horizontal overflow** at either viewport, on every page. Measured: `document.scrollWidth` equals the viewport width on all 7 routes at 1440 and at 390.
- **Zero console errors** on every page except the duplicate-key warning on `/properties` (see V15).
- **No overlapping elements, no clipped text, no broken breakpoints.** The mobile-first build genuinely worked.
- **Form validation looks excellent** — red borders plus inline messages, fired correctly on empty submit.

---

# PART 1 — Cross-site issues (visible on every page)

## V1 🔴 Two different logos, both visible on the same screen

The navbar logo is a **gold outlined house icon + "GharShare"**. The footer logo is a **green rounded square containing the letter "G" + "GharShare"**.

On the home page and every short page, both are visible in one screenshot. Different mark, different colour, different shape. A visitor's read: *nobody owns the brand here.*

**Fix:** pick one mark and use it everywhere. Given the navbar version appears above the fold on every page, standardise on the gold house.

```tsx
// components/layout/footer.tsx — replace the "G" square
<Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white">
  <Home className="size-6 text-gold" strokeWidth={2.25} />
  GharShare
</Link>
```

## V2 🟠 Three different primary button colours

Counted across the captures:

| Colour | Where |
|---|---|
| **Gold** | Nav CTA, hero primary, CTA banner, property-card "View Details" (home), "Notify Me" |
| **Navy** | Listing-card "View Details" (properties page) |
| **Green** | "Submit Interest", "Send message", 404 "Browse Properties" |

The same action — "View Details" — is **gold on the home page and navy on the listing page**. There is no way for a visitor to learn what a colour means.

**Fix:** one primary, one secondary, applied by role not by page.

```
Primary   (gold)   → the one action you most want on this screen
Secondary (navy)   → supporting navigation
Success   (green)  → form submit only
```

## V3 🟠 Headings switch fonts between pages

Home and Property Detail render `h1`/`h2` in **Playfair Display (serif)**. How It Works, FAQ, Contact and 404 render them in **Inter (sans)**.

Side by side, "Powai Lakeview Towers" and "How GharShare works" look like they belong to two different companies.

**Fix:** decide the rule and apply it — serif for marketing/emotional surfaces (home, property detail), sans for utility pages, *or* serif everywhere. Either works; the current split is accidental, not designed.

## V4 🟠 Four different container widths — left edges don't line up

Measured left content edges at 1440px:

| Section | Left edge |
|---|---|
| Home featured cards, footer (`max-w-7xl`) | **x = 112–118** |
| Home CTA banner (`mx-4`) | **x = 40** |
| How It Works, Contact (`max-w-5xl`) | **x = 240** |
| FAQ (`max-w-3xl`) | **x = 368** |

On the home page alone the eye tracks down and the left margin jumps 78px inward at the CTA banner. It reads as misalignment, because it is.

**Fix:** one page container (`max-w-7xl` + `px-4 sm:px-6 lg:px-8`) for every route. Constrain *reading width* with an inner `max-w-2xl/3xl` on the text itself, not by shrinking the whole page.

## V5 🟠 Gold text on white/light backgrounds is visibly washed out

Seen clearly on:
- `/properties` H1 second line — **"Invest from ₹1 Lakh."** sits next to navy "Discover premium properties." and reads noticeably fainter.
- Home — **"View All Properties →"** link.
- Property detail — the **"FULLY FUNDED"** badge (gold background, white text) is the palest element in the card.

Measured: gold `#D9A441` on white ≈ **2.25:1**; the `gold-light`/`gold` badge combination ≈ **1.95:1**. WCAG AA wants 4.5:1. Gold on your dark green measures ≈5.4:1 and is fine — the problem is only gold on light.

**Fix:** add a dark gold for light backgrounds and swap `text-gold` → `text-gold-700` wherever it sits on white or cream. For the FULLY FUNDED badge, use navy text on gold, not white.

## V6 🟠 Playfair renders the rupee symbol badly — on your most important number

The property detail sidebar's **"Starting from ₹3 L"** is set in Playfair Display at 30px. The rupee glyph renders with heavy serifs and reads closer to **"R3 L"** than "₹3 L". This is the single number that decides whether someone engages with the page.

**Fix:** set currency figures in Inter (or a tabular-numeral face) even inside serif blocks.

```tsx
<p className="mt-1 font-sans text-3xl font-semibold tracking-tight text-navy">
  {formatCompactINR(minInvestment)}
</p>
```

## V7 🟡 No active-page indicator in the nav

On `/properties`, the "Properties" link renders identically to "FAQ" and "Contact". Same on every route, desktop and mobile drawer. The visitor has no orientation cue.

```tsx
const active = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
className={cn("text-[15px] font-medium transition-colors",
  active && !transparent && "text-navy font-semibold underline underline-offset-8 decoration-gold decoration-2")}
```

## V8 🟡 The "Login" button nearly disappears on the solid navbar

Once scrolled, the navbar is cream and the outline "Login" button is white-on-cream with a hairline border — the weakest element in the header, despite sitting in the highest-value slot. (Separately, it shouldn't say "Login" at all — see WEBSITE_AUDIT T6.)

---

# PART 2 — Desktop (1440×900)

## Home

### V9 🔴 The featured properties are photographs of landscapes

Under the heading **"Featured Investment Opportunities"**, the three cards show: **a lake at dusk**, **a sunset over a ridge**, and **a forest track**.

Not buildings. Not interiors. Landscapes with no structure in frame at all. This is the most damaging thing on the site visually — it is the section designed to showcase your product, and it showcases stock scenery.

### V10 🟠 Card titles truncate mid-word

"Electronic City Innovation …" — the property name, the primary identifier, is cut.

**Fix:** allow two lines rather than truncating.

```tsx
<h3 className="line-clamp-2 text-sm font-semibold text-navy sm:text-base" title={property.title}>
  {property.title}
</h3>
```

### V11 🟠 The "Why Fractional" panels don't look like a set

Three side-by-side image panels with:
- **Three different background colours** — off-white, cream, dark green — so the row reads as three unrelated things rather than one section.
- **Three different internal text scales** — panel 1's bullets are ~13px equivalent, panel 2's table labels ~8px, panel 3's bullets ~12px.
- **Three different content alignments** — panel 1 top-aligned, panel 3 centred, leaving uneven whitespace.
- **Visible seams** where each image's own background doesn't match its card background (most obvious on panel 2).
- **No section heading in the page.** The heading "Why Fractional Real Estate?" is *inside* panel 1, so the section has no title and panels 2 and 3 have no context.

### V12 🟠 The home page never explains what the product is

Confirmed on screen: hero → stats → featured properties → three infographic panels → CTA. There is **no how-it-works section**. A first-time visitor is shown ₹5 Cr properties before being told what fractional ownership means. (The component exists in git history and was deleted; `<TrustStrip />` is also present but commented out in `app/page.tsx`.)

### V13 🟠 The footer looks unfinished

Three columns, and the third — "Company" — contains **one link** ("Contact"). The right third of the footer is empty. No legal links, no social icons, no address, no phone, no disclaimer. At 1440px this is roughly 400×150px of blank dark green.

---

## Properties listing

### V14 🔴 The same properties render twice

**Confirmed both visually and at the API.** After infinite scroll loads page 2, the mobile grid shows *Baner Hilltop Residences*, *Golf Course Road Executive Towers* and *Anjuna Hillside Villas* a second time. React's duplicate-key warning fires (the dev overlay counter goes 4 → 10 as you scroll).

Verified directly against the API:

```
page=1 → baner-hilltop, anjuna-hillside, powai-lakeview, electronic-city, golf-course-road, hitec-city
page=2 → malviya-nagar, sg-highway, powai-lakeview, electronic-city, baner-hilltop, golf-course-road
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                    4 of 6 repeated from page 1
```

**Cause:** `ORDER BY created_at DESC` with no tiebreaker. The seed inserted every row in one batch, so timestamps collide and Postgres is free to return tied rows in any order between queries — which makes `OFFSET` pagination unstable. Duplicates appear **and some properties are never shown at all.**

**Fix — add a unique tiebreaker to every sort:**

```ts
// lib/queries/properties.ts
const orderBy =
  filters.sort === "most_funded"
    ? [desc(sql`(${properties.amountRaised}::numeric / nullif(${properties.fundingTarget}::numeric, 0))`), asc(properties.id)]
    : filters.sort === "closing_soon"
      ? [asc(properties.fundingDeadline), asc(properties.id)]
      : [desc(properties.createdAt), asc(properties.id)];
```

Belt and braces — de-duplicate on append too:

```tsx
setProperties((prev) => {
  const seen = new Set(prev.map((p) => p.id));
  return [...prev, ...data.properties.filter((p) => !seen.has(p.id))];
});
```

### V15 🔴 "500+ Happy Investors" here vs "327+" on the home page

Both are on screen within one click of each other — home stats bar says **327+**, the listing sidebar's Market Snapshot says **500+**. Same claim, two numbers.

### V16 🟠 The right column is empty for most of the page

The sidebar (Why GharShare → Market Snapshot → Notify Me) ends around y=570 of a 2374px page. Below that, the entire 320px right column is **blank white for ~1,800px** while listings continue.

**Fix:** make the sidebar sticky so it stays with the reader.

```tsx
<aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:h-fit">
```

### V17 🟠 The Market Snapshot grid is too narrow and wraps badly

In a 2-column grid inside a 320px sidebar: **"₹18,000 Cr+"** breaks across two lines mid-value, and **"Real Estate Asset under Management"** wraps to four lines. The tile looks broken rather than dense.

**Fix:** single column inside the sidebar, or shorten the labels ("AUM", "Avg. yield").

### V18 🟠 No result count anywhere

Nothing tells the visitor how many properties exist or how many their filter matched. `totalCount` is fetched and passed into the list component but never rendered.

---

## Property detail

### V19 🔴 The description is printed twice, word for word

The intro paragraph under the title reads:

> "A premium high-rise overlooking Powai Lake, popular with IT professionals working in the nearby business parks and known for consistently strong occupancy."

Scroll ~600px and **"About this property"** contains that exact same sentence, identically.

The cause: the intro uses `truncateText(description, 180)`, but the seeded descriptions are *under* 180 characters, so nothing is truncated and the two blocks are literally identical. It reads as a rendering bug.

**Fix:** a separate `summary` field for the intro, or drop the intro paragraph entirely.

### V20 🔴 The gallery for a Mumbai apartment shows a US flag

Four thumbnails on *Powai Lakeview Towers*: **vintage cameras** (the hero image), **a barren mountain**, **the American flag**, and **a coastline**. Across the listing page I also counted a **vulture in flight** (Anjuna Hillside Villas), a **spiky orange flower** (Golf Course Road Executive Towers), a **waterfall** (Whitefield Tech Park) and a **pier at sunset** (Baner Hilltop).

### V21 🟠 Stat rows misalign whenever a label wraps

**Investment Overview:** "Property Value / Min. Investment / Est. Rental Yield" have one-line labels; **"Projected Appreciation"** wraps to two — so its value sits ~18px lower than the other three. The row visibly steps down at the fourth item.

**Property Highlights:** same failure — "Appreciation Potential" wraps and drops its sub-line out of alignment.

**Fix:** give the label a reserved height so all values share a baseline.

```tsx
<p className="min-h-[32px] text-xs leading-4 text-muted-foreground">{stat.label}</p>
```

### V22 🟠 The page dead-ends — "Similar Properties" never renders

Confirmed on both viewports: the page ends at the Highlights row and goes straight to the footer. No related listings, no next step, no secondary CTA. This is the exact-`eq()` location-match bug from the content audit, now confirmed as visible absence.

### V23 🟡 Amenities look like disabled form fields

Full-width outlined pills in a 2-column grid, each with a check icon — visually indistinguishable from the input fields in the sidebar form 300px to the right. Amenities should read as tags.

**Fix:** inline auto-width chips, matching the existing `PropertyTags` styling above them.

### V24 🟡 Whitespace gap between the sticky sidebar and the footer

The sidebar form ends ~600px above the footer, leaving a large white void on the right while the left column has already finished too.

---

## How It Works

### V25 🟠 The right 30% of the page is empty for its entire length

The page is `max-w-5xl` and the text inside is `max-w-2xl`, so content ends around x=980 on a 1440px screen. Below the header, the right third is blank for the full 2,145px scroll. Combined with **no imagery, no diagram and no illustration anywhere**, the page reads as an unformatted document.

Note: `public/assets/images/steps.png` and `property_steps.png` exist in the repo and are used nowhere.

---

## FAQ

### V26 🟠 The page looks empty

Five collapsed accordion rows. Content occupies roughly y=100 → y=510 in a 900px viewport, then the footer. Narrow column (`max-w-3xl`), wide empty margins, no categories, no search, no closing CTA. It reads as a placeholder someone forgot to fill in — which, per the content audit, it is.

---

## Contact

### V27 🔴 The fake phone number appears three times on one screen

`+91 98765 43210` renders in the **Call us** card, the **WhatsApp** card, **and** as the phone field's placeholder. Plus `hello@gharshare.in`. All visible without scrolling.

### V28 🟠 "Send message" is the smallest button on the site

It renders at the default `h-8` size, left-aligned, under full-width inputs — while the equivalent "Submit Interest" button on the property page is full-width and `h-9`+. The most important action on the page is its least prominent element.

```tsx
<Button type="submit" disabled={isSubmitting}
        className="h-11 w-full bg-brand-green px-8 text-white hover:bg-brand-green/90 sm:w-auto">
  {isSubmitting ? "Sending..." : "Send message"}
</Button>
```

---

# PART 3 — Mobile (390×844)

## V29 🟠 The hero headline is jammed against the navbar

The H1 begins roughly 4px below the navbar's bottom edge. There is no breathing room at all between "GharShare ☰" and "Own a piece of". It reads as a rendering error rather than a tight design.

**Fix:** add top padding to the hero's content on small screens.

```tsx
<div className="relative mx-auto flex min-h-[440px] ... px-6 pt-24 pb-12 lg:pt-0 lg:py-0">
```

## V30 🟠 The hero photograph is invisible on mobile

The `bg-[#032E24]/78` scrim below `lg` is heavy enough that the building is barely perceptible — the hero reads as a flat dark green rectangle with text on it. Desktop gets a beautiful anchored photograph; mobile, where most of your traffic will be, gets none of it.

**Fix:** drop the scrim to ~55–60% and rely on a bottom-weighted gradient behind the text block instead of a flat overlay.

## V31 🟠 The stats bar is barely legible

Four columns across 390px ≈ 90px each. Labels render at **9px**. "Rental Income Distributed" wraps to two lines while its neighbours stay on one, so the row sits unevenly. This is your *trust* content, rendered at a size most people cannot comfortably read.

**Fix:** 2×2 grid on mobile, minimum 11px labels.

```tsx
<div className="mx-auto grid max-w-[1340px] grid-cols-2 gap-4 px-4 py-5 sm:grid-cols-4 ...">
```

## V32 🟠 Not one property name is fully readable on the listing page

Every card in the 2-up mobile grid truncates its title:

> "Baner Hilltop Resid…" · "Powai Lakeview To…" · "Electronic City Inno…" · "Golf Course Road E…" · "HITEC City Corpora…" · "Whitefield Tech Par…" · "Cyber City Busines…"

**Fix:** `line-clamp-2` instead of `truncate` — the card already has room.

## V33 🟠 The mobile card hides the numbers that sell and shows the one that scares

The compact mobile card displays **Property Value (₹15 Cr)**, funding %, and a button. It **omits Min. Investment and Expected Yield** entirely.

So a mobile browser sees *"₹15 Cr"* — a number that says "this is not for you" — and does **not** see *"₹10 L minimum"* or *"12% p.a."*, the two numbers that make it feel attainable and worth a tap. The desktop card shows all three; mobile drops exactly the wrong two.

**Fix:** swap what's kept.

```tsx
<div className="flex items-baseline justify-between gap-2">
  <div>
    <p className="text-[10px] text-muted-foreground">Min. investment</p>
    <p className="text-sm font-semibold text-navy">{formatCompactINR(minInvestment)}</p>
  </div>
  <div className="text-right">
    <p className="text-[10px] text-muted-foreground">Est. yield</p>
    <p className="text-sm font-semibold text-brand-green">{property.estAnnualYield}% p.a.</p>
  </div>
</div>
```

## V34 🟠 The notify bar truncates mid-word

Renders as **"New properties. Get notified fir…"**. The `truncate` class cuts the sentence at the "Notify Me" link. Shorten the copy to fit instead: *"New properties weekly"*.

## V35 🟠 The infographic contradicts the rest of the site

The *Traditional vs Fractional* panel states the fractional minimum investment as **"₹5 Lakhs"**.

The hero says **"as little as ₹1 Lakh."** The properties page says **"Invest from ₹1 Lakh."** The cheapest actual listing is **₹1.5 L**.

That is **three different minimum tickets** stated on one site — and the ₹5 L figure is baked into a PNG, so nobody will notice it drifting. This is only findable by looking at the rendered image, which is precisely the risk of putting copy inside artwork.

Related: the same panel has a dangling asterisk — **"Higher*"** — with no footnote anywhere on the page.

## V36 🟠 The interest form sits at 88% page depth with no sticky CTA

On the property detail page the form's heading appears at roughly **y=2,900 of a 3,286px page**. A mobile visitor must scroll past the gallery, facts, tags, investment overview, trust panel, description, amenities and highlights before any way to act appears. There is no sticky bar, no anchor link, no repeat CTA higher up.

## V37 🟠 The filter sheet gives no feedback and no way to finish

Opening **Filters** on mobile shows five well-laid-out fields — and then nothing. There is:
- **no "Show N results" / Apply button**,
- **no result count**,
- **no "Clear all"** (that control lives outside the sheet),
- roughly **400px of empty space** at the bottom of the panel.

Filters apply live behind the sheet, so the user changes a value, sees no confirmation, and must work out that they should dismiss the panel to see what happened.

**Fix:** a sticky footer in the sheet.

```tsx
<div className="sticky bottom-0 mt-auto border-t border-border bg-white p-4">
  <SheetClose render={<Button className="h-12 w-full bg-navy text-white" />} nativeButton={false}>
    Show {totalCount} properties
  </SheetClose>
</div>
```

## V38 🟠 The "Min. investment" filter shows the wrong empty state

Three of the four selects read **"All Locations"**, **"All Property Types"**, **"All statuses"** when unset. The fourth reads **"Min. Investment"** — its own label — which looks like a selected value rather than "no filter".

Cause: `MinInvestmentSelect`'s fallback returns the label when the sentinel value doesn't match an option.

```tsx
{(value: string) =>
  MIN_INVESTMENT_OPTIONS.find((o) => o.value === value)?.label ?? "Any amount"}
```

## V39 🟠 On mobile, "call us" is buried below the entire contact form

The Call / Email / WhatsApp cards render **after** the full form. On a phone — the one device where tapping to call is effortless — the lowest-friction action is the last thing the user reaches.

**Fix:** order the contact cards above the form below `lg`.

```tsx
<div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
  <aside className="order-first space-y-4 lg:order-last">{/* contact cards */}</aside>
  <ContactForm />
</div>
```

## V40 🟡 The gallery thumbnail strip looks clipped, not scrollable

The fourth thumbnail is cut by the right edge with no fade, no arrow and no partial-peek framing. It reads as a layout bug rather than a scrollable row.

## V41 🟡 Quick facts wrap into a ragged 1–2–1 layout

`flex-wrap` produces: *Property Type* on its own full row, then *Area* and *Bedrooms* side by side, then *Possession* alone. The result looks accidental.

**Fix:** `grid grid-cols-2 gap-4` on mobile.

## V42 🟡 The featured carousel gives no hint that it scrolls

Card 1 at 78% width with card 2 peeking is a valid pattern, but there are no dots, no arrows and no "swipe" affordance. Some users will assume there are only the visible cards.

## V43 🟡 The mobile nav drawer wastes 400px

Below "Login" and "Explore Properties", roughly half the drawer is empty. This is prime real estate for a **tap-to-call** row and a **WhatsApp** link — the two highest-intent actions on a phone.

---

# Correction to the earlier report

In [WEBSITE_AUDIT.md](WEBSITE_AUDIT.md) §H3 I predicted the "Why Fractional" image text would be **unreadable** on mobile. Having looked: panels 1 and 3 are **small but legible** at 390px. Only panel 2's table row labels (~7–8px) are genuinely hard to read.

The argument for rebuilding that section as HTML stands — zero SEO value, invisible to screen readers, can't be edited without a designer, and it's exactly how the ₹5 Lakhs / ₹1 Lakh contradiction (V35) got in and stayed — but "unreadable on mobile" overstated it.

---

# Priority order

## 🔴 Fix first

| # | Issue | Effort |
|---|---|---|
| V14 | Duplicate listings from unstable pagination | 15 min |
| V19 | Description printed twice on every property page | 15 min |
| V9 / V20 | Real property photography | external |
| V27 | Fake phone number ×3 on Contact | 15 min |
| V35 | ₹5 Lakhs vs ₹1 Lakh vs ₹1.5 L contradiction | 1 hr |
| V15 | 327+ vs 500+ investors | 30 min |
| V1 | Two logos | 15 min |

## 🟠 Then

| # | Issue | Effort |
|---|---|---|
| V32 / V33 | Mobile cards: untruncate titles, show min investment + yield | 45 min |
| V36 | Sticky mobile CTA on property detail | 1 hr |
| V37 / V38 | Filter sheet: apply button, result count, correct empty state | 1.5 hr |
| V5 | Gold-on-white contrast | 45 min |
| V31 | Mobile stats bar 2×2, 11px minimum | 30 min |
| V29 / V30 | Hero top padding, lighter mobile scrim | 30 min |
| V21 | Stat row alignment when labels wrap | 20 min |
| V22 | Similar Properties query | 20 min |
| V16 | Sticky sidebar on listing page | 10 min |
| V2 / V3 / V4 | Unify buttons, heading fonts, containers | 3 hr |
| V13 | Rebuild the footer | 2 hr |
| V39 | Contact cards above form on mobile | 15 min |
| V12 | Restore how-it-works + trust strip on home | 2 hr |
| V25 / V26 | Give How It Works and FAQ real density | see PAGE_CONTENT_MAP |

## 🟡 Then

V7 active nav state · V17 market snapshot layout · V23 amenity chips · V40 thumbnail affordance · V41 quick-facts grid · V42 carousel dots · V43 drawer contact actions · V6 rupee glyph · V8 Login button contrast

---

*Captured 18 August 2026 · Chrome via Playwright · 1440×900 and 390×844 · live Supabase data*
