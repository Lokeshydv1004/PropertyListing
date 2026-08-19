/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SCAFFOLDING — NOT RENDERED. Requires real material before it ships.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * These are the three highest-leverage trust blocks a fractional-investment
 * home page can carry: investor stories, borrowed credibility from named
 * partners, and a founder with a face. All three are built here and wired to
 * render nothing while their data arrays are empty, which is why `app/page.tsx`
 * can import and place them today without shipping anything untrue.
 *
 * The reason they are empty rather than filled with plausible sample content:
 * every one of these blocks derives its entire value from being *verifiable*.
 * A fabricated testimonial with an invented name and city is not a placeholder
 * that gets swapped later — it is a false statement about a real person's
 * experience of a financial product, published on the internet. The site
 * already lost credibility once to invented statistics; the fix is not to
 * invent better ones.
 *
 * TO SHIP EACH BLOCK:
 *
 * 1. TESTIMONIALS — fill `TESTIMONIALS` with real investors who have given
 *    written permission to be named. Each needs: real name, city, what they
 *    were worried about beforehand, and what actually happened. Keep the
 *    worry — a testimonial that only says "great platform" persuades nobody.
 *    If you have no investors yet, use advisor or partner endorsements and
 *    label them as such via the `role` field. Never soften an endorsement
 *    into something it wasn't.
 *
 * 2. PARTNERS — fill `PARTNERS` with organisations that have agreed in
 *    writing to be named: legal firm, valuation agency, escrow bank,
 *    property managers. A logo you do not have permission to display is a
 *    trademark problem on top of a trust problem. Add each logo file to
 *    /public/assets/partners/ and reference it by `logo`.
 *
 * 3. FOUNDER NOTE — fill `FOUNDER` with the real name, role, two-sentence
 *    note and a photograph at /public/assets/team/. This one is worth doing
 *    first: it is the cheapest of the three and it answers the biggest
 *    unanswered objection on the site, which is "who are these people?".
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

type Testimonial = {
  /** Real name, with written permission to publish it. */
  name: string;
  city: string;
  /** e.g. "Investor since 2026", or "Legal adviser" for a partner endorsement. */
  role: string;
  /** What they were worried about before investing. */
  concern: string;
  /** What actually happened. Their words, not ours. */
  quote: string;
  /** Optional photo under /public/assets/team/. */
  photo?: string;
};

type Partner = {
  name: string;
  /** What they do for us — "Legal due diligence", "Escrow banking". */
  role: string;
  /** Path under /public/assets/partners/. */
  logo?: string;
};

type Founder = {
  name: string;
  role: string;
  /** Two sentences. Why they built this. */
  note: string;
  photo?: string;
};

// TODO(pre-launch): real investor stories only. See the header comment.
const TESTIMONIALS: Testimonial[] = [];

// TODO(pre-launch): only organisations that have agreed to be named.
const PARTNERS: Partner[] = [];

// TODO(pre-launch): the real founder, with a photograph.
const FOUNDER: Founder | null = null;

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          What our investors say
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-6"
            >
              <Quote
                className="size-6 shrink-0 text-gold-700"
                aria-hidden="true"
              />
              <p className="mt-3 text-xs font-medium text-brand-green">
                Was worried about: {item.concern}
              </p>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/85">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                {item.photo && (
                  <Image
                    src={item.photo}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                )}
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-navy">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.role} · {item.city}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Partners() {
  if (PARTNERS.length === 0) return null;

  return (
    <section className="border-y border-border bg-cream py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Who we work with
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {PARTNERS.map((partner) => (
            <li key={partner.name} className="flex items-center gap-3">
              {partner.logo && (
                <Image
                  src={partner.logo}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 object-contain"
                />
              )}
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium text-navy">
                  {partner.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {partner.role}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FounderNote() {
  if (!FOUNDER) return null;

  return (
    <section className="bg-white py-14">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
        {FOUNDER.photo && (
          <Image
            src={FOUNDER.photo}
            alt=""
            width={72}
            height={72}
            className="size-18 rounded-full object-cover"
          />
        )}
        <p className="text-lg leading-relaxed text-foreground/85">
          “{FOUNDER.note}”
        </p>
        <div className="leading-tight">
          <p className="font-semibold text-navy">{FOUNDER.name}</p>
          <p className="text-sm text-muted-foreground">{FOUNDER.role}</p>
        </div>
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-navy underline underline-offset-4 hover:text-brand-green"
        >
          Meet the team
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
