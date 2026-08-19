import type { Metadata } from "next";
import {
  Building2,
  ClipboardCheck,
  FileSearch,
  Gauge,
  Handshake,
  IndianRupee,
  ScrollText,
  Users,
} from "lucide-react";
import { ListPropertyForm } from "@/components/list-property/list-property-form";
import { SITE, hasRealPhone, telHref } from "@/lib/site-config";

/**
 * The supply side, which had no front door at all.
 *
 * The product is a two-sided marketplace, but every route on the site spoke
 * only to investors. An owner or agent with a building to place had nowhere
 * to land, no statement of what we look for, and no way to reach us other
 * than the generic contact form — so every listing had to begin with somebody
 * we already knew.
 */

export const metadata: Metadata = {
  title: "List your property",
  description:
    "Own a commercial or residential asset in India? List it with GharShare for fractional investment, outright sale or lease. No listing fee, no exclusivity.",
  alternates: { canonical: "/list-your-property" },
  openGraph: {
    title: "List your property | GharShare",
    description:
      "List your property with GharShare for fractional investment, outright sale or lease. No listing fee, no exclusivity.",
    url: "/list-your-property",
  },
};

const AUDIENCE = [
  {
    icon: Building2,
    title: "Owners",
    body: "You hold a commercial or residential asset and want to release capital from it without selling the whole thing to one buyer.",
  },
  {
    icon: Users,
    title: "Developers",
    body: "You have completed inventory to place and would rather reach a pool of investors than wait for a single large cheque.",
  },
  {
    icon: Handshake,
    title: "Agents and channel partners",
    body: "You represent an owner and want a route that can transact in fractions rather than only outright.",
  },
];

const WE_LOOK_FOR = [
  {
    icon: ScrollText,
    label: "Clear title",
    body: "A clean chain of ownership and a current encumbrance certificate. This is the one thing with no flexibility.",
  },
  {
    icon: IndianRupee,
    label: "Income, or a credible path to it",
    body: "Leased assets are the strongest fit. Vacant space can work where the letting case is genuinely strong.",
  },
  {
    icon: Gauge,
    label: "Grade-A or close to it",
    body: "Specification and location that a quality tenant would actually choose, in a market with real demand.",
  },
  {
    icon: FileSearch,
    label: "Documentation you can share",
    body: "Approved plans, occupancy certificate, RERA registration where applicable, and the lease and rent roll.",
  },
];

const WHAT_YOU_GET = [
  {
    title: "Speed",
    body: "Fractional demand aggregates faster than a single buyer with the whole cheque. You are not waiting for one person to say yes.",
  },
  {
    title: "Real price discovery",
    body: "An independent valuation and genuine investor interest tell you what the asset is worth, rather than what one negotiating buyer says it is.",
  },
  {
    title: "Fees stated upfront",
    body: "TODO(pre-launch): state the fee GharShare charges an owner, when it becomes payable, and whether it is contingent on a completed transaction. Owners ask this first, and a page that avoids it reads exactly the way our old investor pages did.",
  },
  {
    title: "No exclusivity",
    body: "Listing with us does not stop you marketing the asset elsewhere or taking a direct offer.",
  },
];

const PROCESS = [
  {
    title: "Submit",
    body: "Tell us what you have. Five minutes, no documents needed at this stage.",
  },
  {
    title: "First call",
    body: "We come back within one business day and tell you honestly whether it fits. Most conversations end here, and that saves you time.",
  },
  {
    title: "Valuation",
    body: "If it fits, we commission an independent valuation — not our own estimate, and not your asking price.",
  },
  {
    title: "Legal review",
    body: "Title search, encumbrance check and an independent legal opinion on the documentation.",
  },
  {
    title: "Listing",
    body: "We build the listing with the terms, the fees and the risks stated on the page, and take it live.",
  },
  {
    title: "Funding and completion",
    body: "Investor funds are held in escrow and released on completion, per the transaction documents.",
  },
];

export default function ListYourPropertyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          List your property
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          If you own a building worth owning, we can bring you investors for
          part of it — or a buyer or tenant for all of it. No listing fee, no
          exclusivity, and a straight answer on whether it fits.
        </p>
      </div>

      {/* ── Who this is for ────────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          Who this is for
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {AUDIENCE.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-navy-light text-navy">
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

      {/* ── What we look for ───────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          What we look for
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Most assets we are shown do not make it onto the site. Knowing the bar
          before you spend time on it is worth more than a polite maybe.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {WE_LOOK_FOR.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-light text-gold-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-navy">{item.label}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── What you get ───────────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          What you get
        </h2>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          {WHAT_YOU_GET.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <dt className="font-semibold text-navy">{item.title}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Process ────────────────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          How it works
        </h2>
        <ol className="mt-6 space-y-4">
          {PROCESS.map((step, index) => (
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

      {/* ── Form ───────────────────────────────────────────────────────── */}
      <section
        id="submit"
        className="mt-16 scroll-mt-24 rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-green-light text-brand-green">
            <ClipboardCheck className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-serif text-2xl font-semibold text-navy">
              Tell us about your property
            </h2>
            <p className="mt-1 text-muted-foreground">
              Five minutes. We reply within one business day, either way.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <ListPropertyForm />
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
