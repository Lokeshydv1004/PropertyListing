import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ClipboardCheck,
  HandCoins,
  Landmark,
  Search,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SITE, hasRealPhone, telHref } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How fractional real estate investment works with GharShare: the process, the fees, the tax treatment, the KYC you'll need, and what happens if a property doesn't fund.",
  alternates: { canonical: "/how-it-works" },
};

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  PRE-LAUNCH TODO — every figure marked TODO below must be replaced with
 *  GharShare's real, agreed commercial terms before this page goes live.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * This page previously stopped at the comfortable parts: browse, submit,
 * onboard, earn. Everything a person actually hesitates over — what it costs,
 * how it's taxed, what documents they need, whether they're even eligible,
 * how long it takes, where the money sits before funding closes, and what
 * happens if the raise fails — was absent. "What fees does this platform
 * charge" is the most-searched question about every fractional platform in
 * India, and its absence here read as an answer.
 *
 * The general material below (tax treatment, KYC list, NRI position, escrow
 * mechanics) is accurate as a description of how these structures ordinarily
 * work in India and is safe to publish. The GharShare-specific numbers are
 * marked and MUST be filled in — a placeholder fee is worse than no fee page.
 */

const TODO = "TODO";

const STEPS = [
  {
    icon: Search,
    title: "Browse",
    summary: "Explore verified, income-generating properties.",
    detail:
      "Every listing goes through verification before it is published — ownership and title documents, an independent valuation, and the funding target are all checked. Filter by city, property type, funding status and minimum ticket to find opportunities that fit your budget.",
  },
  {
    icon: HandCoins,
    title: "Register interest",
    summary: "Tell us the amount you're considering.",
    detail:
      "Submit your interest from the listing page with the amount you have in mind. Nothing is paid and nothing is committed at this stage — it simply tells our team you're a genuinely interested investor so we can send you the full documentation.",
  },
  {
    icon: ClipboardCheck,
    title: "Get onboarded",
    summary: "Documentation, questions, KYC.",
    detail:
      "An advisor calls you, answers your questions, and shares the complete investment documentation for that specific property. You complete KYC, review the agreement, and only then decide whether to proceed. You can stop at any point in this process without cost.",
  },
  {
    icon: Landmark,
    title: "Funds into escrow",
    summary: "Your money does not sit with us.",
    detail:
      "Committed funds go into an escrow account held for that property, not into a GharShare account. They are released to the transaction only when the raise completes. If it does not complete, they are returned to you in full.",
  },
  {
    icon: TrendingUp,
    title: "Earn returns",
    summary: "Rental income, then appreciation at exit.",
    detail:
      "Once the property is funded and tenanted, your share of the rent is distributed periodically. Your share of any capital appreciation is realised when the property is sold at the end of the stated horizon.",
  },
];

/**
 * The single most conspicuous omission on the old page.
 * TODO(pre-launch): replace every `amount` below with the real, agreed figure.
 */
const FEES = [
  {
    name: "Platform fee",
    amount: `${TODO}% of the amount invested`,
    when: "One time, at onboarding",
    note: "Charged on the capital you commit, disclosed on the listing before you commit it.",
  },
  {
    name: "Annual management fee",
    amount: `${TODO}% of rent collected`,
    when: "Deducted before each distribution",
    note: "Covers tenanting, maintenance oversight, compliance, reporting and the property manager.",
  },
  {
    name: "Exit / performance fee",
    amount: `${TODO}% of gains above ${TODO}%`,
    when: "On sale, from the proceeds",
    note: "Charged only on returns above the stated hurdle — nothing is charged if there is no gain.",
  },
  {
    name: "Registering interest",
    amount: "Free",
    when: "Always",
    note: "There is no charge for enquiring, for the advisor call, or for receiving the documentation.",
  },
];

/**
 * General to how these structures are taxed in India, not specific to us —
 * safe to publish as written. Still worth a CA's eye before launch.
 */
const TAX_ROWS: [string, string, string][] = [
  [
    "Rental income distributed to you",
    "Taxable as income in your hands",
    "Added to your total income and taxed at your applicable slab rate.",
  ],
  [
    "TDS on distributions",
    "Deducted at source where applicable",
    "Reflected in your Form 26AS; you claim credit for it when you file.",
  ],
  [
    "Gain when the property is sold",
    "Capital gains",
    "Short- or long-term depending on how long the holding was held. Indexation and rates follow the rules in force at the time of sale.",
  ],
  [
    "If you are an NRI",
    "TDS applies at NRI rates",
    "Treaty relief may reduce it. You will need a PAN to claim credit either way.",
  ],
];

const KYC_DOCUMENTS = [
  "PAN card — mandatory, no exceptions",
  "Aadhaar or passport, for identity and address",
  "A cancelled cheque or bank statement, for the account returns are paid into",
  "A recent photograph",
  "For NRIs: passport, visa or OCI card, overseas address proof, and NRE/NRO account details",
];

/** TODO(pre-launch): confirm each of these against what actually happens. */
const TIMELINE = [
  { label: "You register interest", when: "Day 0" },
  { label: "An advisor calls you", when: `Within ${TODO} business day(s)` },
  { label: "Full documentation shared", when: `Within ${TODO} days` },
  { label: "KYC completed and agreement signed", when: `Around day ${TODO}` },
  { label: "Funds transferred to escrow", when: `Around day ${TODO}` },
  { label: "Raise closes, transaction completes", when: "Per the listing's deadline" },
];

const WHAT_YOU_RECEIVE = [
  "The investment agreement for that specific property",
  "A certificate confirming your holding and its size",
  "Periodic reports: rent collected, expenses incurred, what was distributed to you",
  "Statements you can hand to your CA at the end of the financial year",
];

const NRI_POINTS = [
  "NRIs and OCI holders can generally invest in commercial and residential property in India, subject to FEMA. Agricultural land, plantation property and farmhouses cannot be acquired.",
  "Investment must be routed through normal banking channels — from an NRE, NRO or FCNR account, not by cash.",
  "Repatriation of sale proceeds is subject to FEMA limits and conditions; income routed through an NRO account has its own repatriation cap per financial year.",
  "TDS applies at NRI rates on both rental income and capital gains, with treaty relief available in many cases.",
  "A PAN is required. Take your own tax advice in your country of residence as well as in India — GharShare does not provide tax advice.",
];

const MECHANICS_FAQS = [
  {
    question: "What happens if a property doesn't reach its funding target?",
    answer:
      "The raise does not proceed and the transaction does not complete. Money held in escrow is returned in full to everyone who committed — no fee is deducted and nobody ends up holding a stake in a partially funded asset. Our team contacts you directly if this affects a property you committed to.",
  },
  {
    question: "Where does my money sit before funding closes?",
    answer:
      "In an escrow account opened for that specific property, controlled under the escrow agreement rather than by GharShare. Funds are released only when the conditions for completion are met. This is the single most important protection in the structure, and it is why we do not accept payment into our own account at any point.",
  },
  {
    question: "How is my investment structured?",
    answer:
      "Each property is held through a legal structure set up for that property alone, with investors holding a proportional interest. Your interest is not pooled across unrelated assets. The exact structure, and the documents that evidence your holding, are shared with you during onboarding — before you commit anything.",
  },
  {
    question: "Who manages the property day to day?",
    answer:
      "A professional property manager handles leasing, maintenance, tenant relations and statutory compliance. Investors are not asked to manage anything. The manager for each property is named in that property's documentation.",
  },
  {
    question: "Can I exit before the horizon ends?",
    answer:
      "Fractional real estate is not a liquid investment. Each property states a target hold period and the exit route planned for it. An earlier exit is possible only where a buyer for your holding can be found, and is never guaranteed — so do not invest money you may need at short notice.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          How GharShare works
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The whole process, including the parts most platforms leave out —
          what it costs, how it is taxed, what you will need, and what happens
          when things do not go to plan.
        </p>
      </div>

      {/* ── The process ────────────────────────────────────────────────── */}
      <div className="mt-16 space-y-12">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {index < STEPS.length - 1 && (
                  <span className="mt-2 w-px flex-1 bg-border" />
                )}
              </div>
              <div className="pb-4">
                <span className="text-sm font-medium text-brand-green">
                  Step {index + 1}
                </span>
                <h2 className="mt-1 text-xl font-semibold text-navy">
                  {step.title}
                </h2>
                <p className="mt-1 font-medium text-foreground">
                  {step.summary}
                </p>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* The artwork already in the repo, previously unused. */}
      <div className="mt-14 overflow-hidden rounded-2xl border border-border">
        <Image
          src="/assets/images/steps.png"
          alt=""
          width={1536}
          height={1024}
          className="h-auto w-full"
        />
      </div>

      {/* ── Fees ───────────────────────────────────────────────────────── */}
      <section id="fees" className="mt-20 scroll-mt-24">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          Fees, in full
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every charge you can incur, in one place. Nothing is deducted that is
          not on this list and in the documentation you sign.
        </p>

        {/* Below sm this renders as cards. As a single scrolling table at
            390px the Amount column was clipped mid-word and the When column
            was entirely off-screen — a fee table that shows the fee names and
            hides every number is worse than no fee table. */}
        <ul className="mt-6 space-y-3 sm:hidden">
          {FEES.map((fee) => (
            <li
              key={fee.name}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 bg-navy-light px-4 py-3">
                <p className="font-semibold text-navy">{fee.name}</p>
                <p className="font-semibold text-brand-green">{fee.amount}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {fee.when}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {fee.note}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-border sm:block">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-navy-light text-navy">
              <tr>
                <th scope="col" className="px-5 py-3 text-left font-semibold">
                  Fee
                </th>
                <th scope="col" className="px-5 py-3 text-left font-semibold">
                  Amount
                </th>
                <th scope="col" className="px-5 py-3 text-left font-semibold">
                  When
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {FEES.map((fee) => (
                <tr key={fee.name}>
                  <th
                    scope="row"
                    className="px-5 py-4 text-left align-top font-medium text-navy"
                  >
                    {fee.name}
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {fee.note}
                    </span>
                  </th>
                  <td className="px-5 py-4 align-top font-medium text-brand-green">
                    {fee.amount}
                  </td>
                  <td className="px-5 py-4 align-top text-muted-foreground">
                    {fee.when}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-xl border border-gold/40 bg-gold-light/40 p-4 text-sm text-navy">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-gold-700"
            aria-hidden="true"
          />
          <span>
            <strong>Pre-launch note:</strong> the percentages above are marked{" "}
            <code className="font-mono">{TODO}</code> and must be replaced with
            GharShare&apos;s agreed commercial terms before this page is
            published.
          </span>
        </p>
      </section>

      {/* ── Tax ────────────────────────────────────────────────────────── */}
      <section id="tax" className="mt-20 scroll-mt-24">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          How it is taxed
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          A general summary of how income from these structures is ordinarily
          treated in India. It is not tax advice, and your position depends on
          your own circumstances — take advice from your CA before investing.
        </p>

        <ul className="mt-6 space-y-3 sm:hidden">
          {TAX_ROWS.map(([what, treatment, practice]) => (
            <li
              key={what}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <p className="bg-navy-light px-4 py-2.5 text-sm font-semibold text-navy">
                {what}
              </p>
              <div className="px-4 py-3">
                <p className="font-medium text-foreground/85">{treatment}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {practice}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-border sm:block">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-navy-light text-navy">
              <tr>
                <th scope="col" className="px-5 py-3 text-left font-semibold">
                  What
                </th>
                <th scope="col" className="px-5 py-3 text-left font-semibold">
                  Treatment
                </th>
                <th scope="col" className="px-5 py-3 text-left font-semibold">
                  In practice
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TAX_ROWS.map(([what, treatment, practice]) => (
                <tr key={what}>
                  <th
                    scope="row"
                    className="px-5 py-4 text-left align-top font-medium text-navy"
                  >
                    {what}
                  </th>
                  <td className="px-5 py-4 align-top font-medium text-foreground/85">
                    {treatment}
                  </td>
                  <td className="px-5 py-4 align-top text-muted-foreground">
                    {practice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── KYC + timeline ─────────────────────────────────────────────── */}
      <section id="onboarding" className="mt-20 scroll-mt-24">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          What you&apos;ll need, and how long it takes
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold text-navy">Documents for KYC</h3>
            <ul className="mt-4 space-y-2.5">
              {KYC_DOCUMENTS.map((document) => (
                <li
                  key={document}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-green"
                    aria-hidden="true"
                  />
                  {document}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              None of this is collected through the website. KYC happens
              directly with our team, after you have seen the documentation and
              decided you want to proceed.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold text-navy">Typical timeline</h3>
            <ol className="mt-4 space-y-3">
              {/* Stacked below sm: side by side, a label wrapping to three
                  lines left its value baseline-aligned to the first line with
                  a ragged gap under it. */}
              {TIMELINE.map((entry) => (
                <li
                  key={entry.label}
                  className="flex flex-col gap-0.5 border-b border-border pb-3 text-sm last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <span className="text-muted-foreground">{entry.label}</span>
                  <span className="font-medium text-navy sm:shrink-0">
                    {entry.when}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              TODO(pre-launch): confirm each of these against what the team
              actually does, and remove any that overpromise.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold text-navy">What you receive</h3>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {WHAT_YOU_RECEIVE.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-muted-foreground"
              >
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-green"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── NRI ────────────────────────────────────────────────────────── */}
      <section id="nri" className="mt-20 scroll-mt-24">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          If you are an NRI
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          A large share of investment into Indian real estate comes from
          non-residents, and the rules differ in ways worth knowing before you
          start rather than after.
        </p>
        <ul className="mt-6 space-y-3">
          {NRI_POINTS.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground"
            >
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"
                aria-hidden="true"
              />
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* ── FAQs ───────────────────────────────────────────────────────── */}
      <section className="mt-20">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          Investment mechanics
        </h2>
        <Accordion className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
          {MECHANICS_FAQS.map((item) => (
            <AccordionItem key={item.question} value={item.question} className="px-5">
              <AccordionTrigger className="py-4 text-left text-base font-medium text-navy">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <div className="mt-16 rounded-2xl bg-navy-light px-6 py-10 text-center sm:px-10">
        <h2 className="text-xl font-semibold text-navy">
          Ready to look at properties?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Browse what is open right now — or talk to someone first. People who
          read this page all the way down usually want a conversation, not more
          browsing.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            render={<Link href="/properties" />}
            nativeButton={false}
            className="bg-brand-green text-white hover:bg-brand-green/90"
          >
            Browse properties
          </Button>
          <Button
            render={<Link href="/contact" />}
            nativeButton={false}
            variant="outline"
          >
            Talk to our team
          </Button>
        </div>
        {hasRealPhone && (
          <p className="mt-4 text-sm text-muted-foreground">
            Or call{" "}
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
    </div>
  );
}
