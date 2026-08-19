import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  ClipboardCheck,
  Layers,
  ScrollText,
  ShieldAlert,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManagedPlanForm } from "@/components/invest-with-us/managed-plan-form";
import { SITE, hasRealPhone, telHref } from "@/lib/site-config";

/**
 * For the visitor who wants in but cannot pick a building.
 *
 * Every other route into the product assumed a decision the visitor has not
 * made: choose an asset, then commit. Someone comparing a Kurla office
 * against a Whitefield warehouse with no way to tell which is the better bet
 * simply leaves. This page gives them the other answer — one commitment,
 * spread across everything we have underwritten, managed by us.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  READ THIS BEFORE CHANGING THE COPY.
 * ─────────────────────────────────────────────────────────────────────────
 * The natural way to write this page is "invest in GharShare and we will pay
 * you a stable return". That sentence cannot ship. In India, accepting money
 * from the public against a promised or assured return is deposit-taking:
 * regulated by section 73 of the Companies Act 2013, and prohibited outright
 * for unregistered schemes by the Banning of Unregulated Deposit Schemes Act
 * 2019. That is a criminal exposure for the company and its directors, not a
 * marketing risk. "Assured", "guaranteed", "fixed return", "capital
 * protected" and "principal safe" must not appear on this page.
 *
 * What this page describes instead is a *diversified holding in the same
 * underlying properties* — steadier than one asset because a single vacancy
 * cannot take the whole income to zero, and lower-yielding than the best
 * single asset because you also hold the average ones. That is a true
 * statement about diversification, and it is the honest version of what was
 * asked for. Every return figure on it is targeted, not promised.
 *
 * TODO(pre-launch): the legal structure of the pooled vehicle, the target
 * return band, the fee and the exit mechanics are all marked TODO below.
 * They need the company's lawyers, not a copywriter. Do not invent them.
 */

export const metadata: Metadata = {
  title: "Not sure which property? Invest across the portfolio",
  description:
    "Can't choose a single property? Put one commitment across the whole GharShare portfolio — steadier income from diversification, professionally managed. Targeted returns, not guaranteed.",
  alternates: { canonical: "/invest-with-us" },
  openGraph: {
    title: "Invest across the portfolio | GharShare",
    description:
      "One commitment, spread across every property we've underwritten. Steadier than a single asset, and managed end to end.",
    url: "/invest-with-us",
  },
};

const WHY_STEADIER = [
  {
    icon: Layers,
    title: "One vacancy can't take your income to zero",
    body: "In a single property, one tenant leaving stops the rent. Across a portfolio, that same vacancy is one line in a rent roll — the other properties keep paying while it is re-let.",
  },
  {
    icon: Building2,
    title: "Several assets, several cities, several tenants",
    body: "You hold a slice of everything we have underwritten rather than a concentrated bet on one micro-market. That is what smooths the income, and it is the only reason we can call it steadier.",
  },
  {
    icon: Wallet,
    title: "Nothing to choose, nothing to time",
    body: "No comparing yields across listings, no deciding whether to wait for the next one. You commit once and we allocate across the portfolio as raises complete.",
  },
];

/**
 * The trade-off, stated as plainly as the benefit.
 *
 * A page that only lists advantages reads as a pitch. The honest comparison
 * is what makes the "steadier" claim believable, and the lower return is the
 * price of it — so it sits in the middle of the page, not in a footnote.
 */
const TRADE_OFF: [string, string, string][] = [
  [
    "What you choose",
    "One property you picked yourself",
    "Nothing — we allocate across the portfolio",
  ],
  [
    "Income pattern",
    "One tenant. Strong while leased, nil during a vacancy",
    "Blended across tenants, so gaps are smoothed rather than total",
  ],
  [
    "Target return",
    "Higher on a good asset, lower on a weak one",
    "Below the best single asset, by design — you hold the average too",
  ],
  [
    "Concentration risk",
    "Entirely on one building and one micro-market",
    "Spread across assets, cities and tenants",
  ],
  [
    "Effort from you",
    "Read each listing, compare, decide, repeat",
    "One conversation, one commitment",
  ],
];

const HOW = [
  {
    title: "Tell us your range",
    body: "Amount band, how long you can stay invested, and whether you care more about income or growth. Five minutes, nothing payable.",
  },
  {
    title: "We send the portfolio pack",
    body: "What is currently held, what is being underwritten, the fee, the target return band and how it is calculated, and the risks in full. Read it before anything else happens.",
  },
  {
    title: "Advisor call",
    body: "An honest conversation about whether this or a single listing suits you better. Sometimes the answer is neither, and we will say so.",
  },
  {
    title: "Documentation and KYC",
    body: "Handled directly with our team, exactly as it is for a single-property investment. None of it is collected through this website.",
  },
  {
    title: "Funds and allocation",
    body: "Money is held in escrow under the transaction documents and allocated across the portfolio as raises complete. TODO(pre-launch): state the legal structure of the pooled vehicle and who holds title.",
  },
  {
    title: "Distributions and reporting",
    body: "Your share of the net rental income, distributed periodically, with a statement showing what was collected, what was deducted and what was paid. TODO(pre-launch): confirm the distribution frequency.",
  },
];

const STRAIGHT_ANSWERS = [
  {
    question: "Is the return guaranteed?",
    answer:
      "No. There is no assured return, no capital protection and no deposit insurance. The portfolio is steadier than one property because the income comes from several tenants rather than one — not because anybody has promised to make up a shortfall. You can get back less than you put in.",
  },
  {
    question: "Why is the target return lower than a single property?",
    answer:
      "Because you hold the average, not the winner. A concentrated bet on the single best asset in the portfolio would out-earn this — and a concentrated bet on the weakest would badly under-earn it. Lower and steadier is the trade, and it is deliberate.",
  },
  {
    question: "What return should I expect?",
    answer:
      "TODO(pre-launch): state the target band, the period it is measured over, whether it is net or gross of fees, and what it is based on. A figure invented for this page would be the single most damaging sentence on the site — leave this exactly as it is until the real number exists.",
  },
  {
    question: "Is this a fixed deposit or a savings product?",
    answer:
      "No, and it should not be compared to one. A bank deposit is a promise from a bank, insured up to ₹5 lakh by DICGC. This is an equity-style holding in commercial property: the income depends on tenants paying rent, and the capital value moves with the market.",
  },
  {
    question: "Can I get my money out early?",
    answer:
      "Treat it as illiquid for the full horizon. TODO(pre-launch): describe the exit mechanism honestly, including whether any secondary transfer is possible and what it costs.",
  },
  {
    question: "What are the fees?",
    answer:
      "TODO(pre-launch): state the management fee, any performance fee, and when each is charged. Every listing on this site states its fees upfront, and this has to do the same before it goes live.",
  },
];

export default function InvestWithUsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-gold-light px-3 py-1 text-xs font-semibold tracking-wide text-navy uppercase">
          Managed portfolio
        </span>
        <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          Not sure which property to pick?
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Then don&apos;t pick one. Make a single commitment to the GharShare
          managed portfolio and we spread it across every property we have
          underwritten — steadier income than a single asset, because one empty
          floor cannot take it to zero.
        </p>
        <p className="mt-3 text-base text-muted-foreground">
          The trade is honest, and it is the whole point: expect{" "}
          <strong className="font-semibold text-navy">
            a lower target return than the best single listing
          </strong>
          , in exchange for income that does not depend on one tenant. Returns
          are targeted, not guaranteed.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button
            render={<Link href="#request" />}
            nativeButton={false}
            className="h-12 gap-2 bg-brand-green px-6 text-white hover:bg-brand-green/90"
          >
            Request the portfolio pack
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <Button
            render={<Link href="/properties" />}
            nativeButton={false}
            variant="outline"
            className="h-12 px-6"
          >
            Rather choose a property yourself?
          </Button>
        </div>
      </div>

      {/* ── Why it is steadier ─────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          Why it is steadier
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Not because anything is promised — because the income comes from more
          than one place.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {WHY_STEADIER.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-gold-light text-navy">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── The trade-off ──────────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          One property vs. the managed portfolio
        </h2>

        {/* Two renderings of one array, for the reason documented in
            why-fractional.tsx: a horizontally-scrolled table hides the
            right-hand column entirely on a phone — and here that column is
            the half of the comparison this page exists to make. */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-border sm:hidden">
          <div className="grid grid-cols-2 gap-3 bg-navy-light px-4 py-2">
            <p className="text-[11px] font-semibold tracking-wide text-navy uppercase">
              One property
            </p>
            <p className="text-[11px] font-semibold tracking-wide text-brand-green uppercase">
              Portfolio
            </p>
          </div>
          <ul className="divide-y divide-border">
            {TRADE_OFF.map(([label, single, portfolio]) => (
              <li key={label} className="px-4 py-2.5">
                <p className="text-xs font-medium text-muted-foreground">
                  {label}
                </p>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <p className="text-[13px] leading-snug text-foreground/80">
                    {single}
                  </p>
                  <p className="text-[13px] leading-snug font-medium text-brand-green">
                    {portfolio}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-border sm:block">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">
              A comparison of investing in a single GharShare listing against
              the managed portfolio, across what you choose, income pattern,
              target return, concentration risk and effort.
            </caption>
            <thead className="bg-navy-light text-navy">
              <tr>
                <th scope="col" className="px-5 py-3 text-left font-semibold">
                  <span className="sr-only">Aspect</span>
                </th>
                <th scope="col" className="px-5 py-3 text-left font-semibold">
                  A single property
                </th>
                <th scope="col" className="px-5 py-3 text-left font-semibold">
                  Managed portfolio
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TRADE_OFF.map(([label, single, portfolio]) => (
                <tr key={label}>
                  <th
                    scope="row"
                    className="px-5 py-3 text-left font-medium text-navy"
                  >
                    {label}
                  </th>
                  <td className="px-5 py-3 text-muted-foreground">{single}</td>
                  <td className="px-5 py-3 font-medium text-brand-green">
                    {portfolio}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          How it works
        </h2>
        <ol className="mt-6 space-y-4">
          {HOW.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold text-navy">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── What this is not ───────────────────────────────────────────── */}
      <section className="mt-14 rounded-2xl border border-destructive/25 bg-destructive/5 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-serif text-2xl font-semibold text-navy">
              What this is not
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Worth being blunt about, because the words &ldquo;steady
              returns&rdquo; invite exactly the wrong assumptions.
            </p>
          </div>
        </div>
        <ul className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/80">
          <li className="flex gap-3">
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <span>
              <strong className="font-semibold text-navy">
                Not a deposit, and not a fixed return.
              </strong>{" "}
              GharShare does not accept deposits and does not promise a rate.
              Nothing here is insured by DICGC or anyone else, and no return is
              assured by the company.
            </span>
          </li>
          <li className="flex gap-3">
            <TrendingDown
              className="mt-0.5 size-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <span>
              <strong className="font-semibold text-navy">
                Not capital protected.
              </strong>{" "}
              Property values fall as well as rise. Diversification reduces the
              chance that one bad asset dominates your outcome; it does not
              stop the market moving against all of them at once.
            </span>
          </li>
          <li className="flex gap-3">
            <ScrollText
              className="mt-0.5 size-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <span>
              <strong className="font-semibold text-navy">
                Not liquid, and not advice.
              </strong>{" "}
              Assume your money is committed for the full horizon. Nothing on
              this page is investment, legal or tax advice — read the{" "}
              <Link
                href="/risk-disclosure"
                className="font-medium text-navy underline underline-offset-2"
              >
                full risk disclosure
              </Link>{" "}
              and speak to an independent adviser.
            </span>
          </li>
        </ul>
      </section>

      {/* ── Straight answers ───────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          Straight answers
        </h2>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          {STRAIGHT_ANSWERS.map((item) => (
            <div
              key={item.question}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <dt className="font-semibold text-navy">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Form ───────────────────────────────────────────────────────── */}
      <section
        id="request"
        className="mt-16 scroll-mt-24 rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-green-light text-brand-green">
            <ClipboardCheck className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-serif text-2xl font-semibold text-navy">
              Request the portfolio pack
            </h2>
            <p className="mt-1 text-muted-foreground">
              We reply within one business day. Nothing payable, no obligation,
              and you see the numbers before you decide anything.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <ManagedPlanForm />
        </div>
      </section>

      {hasRealPhone && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Would rather talk it through first? Call{" "}
          <a
            href={telHref}
            className="font-medium text-navy underline underline-offset-2"
          >
            {SITE.phone}
          </a>{" "}
          — {SITE.hours}
        </p>
      )}
    </div>
  );
}
