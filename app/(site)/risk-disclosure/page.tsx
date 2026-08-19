import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site-config";

/**
 * NOTE FOR LAUNCH: this is a full and honest statement of the risks that
 * apply to the investments described on this site. It has NOT been reviewed
 * by a lawyer. Have counsel review it, and reconcile it against the actual
 * offering documents, before go-live.
 *
 * It exists because the site publishes estimated yields and projected
 * appreciation on every listing, and until now the word "risk" appeared in
 * exactly one place on the entire site: question four of the FAQ. Forward-
 * looking figures published without an accessible risk statement are a
 * problem under ASCI's code and, for an investment product, potentially a
 * good deal more than that.
 */

export const metadata: Metadata = {
  title: "Risk Disclosure",
  description:
    "The risks of fractional real estate investment: market, liquidity, tenant, execution, regulatory and tax risk. No returns are guaranteed.",
  alternates: { canonical: "/risk-disclosure" },
};

const LAST_UPDATED = "19 August 2026";

const RISKS = [
  {
    heading: "No guaranteed returns",
    body: [
      "Every yield, appreciation figure, horizon and payout schedule shown anywhere on this website is an estimate. Estimates are derived from current lease terms, current market data and reasonable assumptions — all of which change. They are not promises, they are not guarantees, and they are not a floor.",
      "You can receive less than the estimate. You can receive nothing in a given period. You can get back less capital than you put in, including in the worst case losing a substantial part of it.",
    ],
  },
  {
    heading: "Market risk",
    body: [
      "Property values fall as well as rise. Local supply, interest rates, the wider economy and the fortunes of a single micro-market can all move a valuation against you, and property markets can stay depressed for years rather than months.",
      "Past performance — ours, the market's, or a specific property's — does not indicate future results.",
    ],
  },
  {
    heading: "Liquidity risk",
    body: [
      "These are illiquid investments. There is no exchange to sell into, no redemption window, and no obligation on anyone to buy your holding from you.",
      "An exit before the end of the stated horizon is possible only where a buyer can be found on terms both sides accept, and may not be possible at all. Do not invest money you may need at short notice, and do not invest money you cannot afford to have locked up for longer than the stated horizon.",
    ],
  },
  {
    heading: "Tenant and vacancy risk",
    body: [
      "Rental income depends on a tenant continuing to occupy the property and continuing to pay. A tenant can default, renegotiate, or leave at the end of a lease or a lock-in.",
      "A vacant property produces no rent, so distributions pause or reduce for as long as it takes to re-let. Re-letting can take months, and the new rent may be lower than the old one.",
    ],
  },
  {
    heading: "Concentration risk",
    body: [
      "Each investment is exposed to one property, in one location, usually with one tenant. That is a concentrated position by construction, and it does not behave like a diversified portfolio.",
      "Committing a large share of your savings to a single listing concentrates that risk further.",
    ],
  },
  {
    heading: "Execution and counterparty risk",
    body: [
      "The investment depends on other parties performing: the seller, the property manager, the escrow agent, the legal and valuation advisers, and GharShare itself. Any of them can underperform, delay, or fail.",
      "Due diligence reduces the chance of an unpleasant surprise. It does not eliminate it. A title search, a valuation and a legal review are professional opinions formed on the information available at a point in time, not warranties.",
    ],
  },
  {
    heading: "Regulatory and tax risk",
    body: [
      "The regulatory treatment of fractional real estate in India continues to develop, including under SEBI's SM REIT framework. Changes in regulation can affect how these structures operate, what they cost to run, and how easily they can be exited.",
      "Tax treatment of rental income and of capital gains can change, and any change may apply to investments already made. Nothing on this site is tax advice.",
    ],
  },
  {
    heading: "Estimates, projections and forward-looking statements",
    body: [
      "Statements about future rent, future occupancy, future valuation, future distributions or future exit timing are forward-looking. They reflect what we believe to be reasonable at the time of publication and nothing more.",
      "We do not undertake to update them as circumstances change, except where doing so is required of us.",
    ],
  },
  {
    heading: "This is not advice",
    body: [
      "Nothing on this website — no listing, no figure, no article, no answer given by our team — constitutes investment advice, legal advice, or tax advice, and none of it takes account of your particular circumstances, objectives or risk tolerance.",
      "Read the complete documentation for any property before committing, and take independent advice from a qualified financial adviser, and where relevant a lawyer and a chartered accountant, before you invest.",
    ],
  },
];

export default function RiskDisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        Risk Disclosure
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated {LAST_UPDATED}
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <p className="leading-relaxed text-foreground/85">
          Real estate investments are subject to market risk. Returns are not
          guaranteed, capital is at risk, and these investments are illiquid.
          Please read this page in full before acting on anything else on this
          site.
        </p>
      </div>

      <div className="mt-12 space-y-10">
        {RISKS.map((risk) => (
          <section key={risk.heading}>
            <h2 className="text-xl font-semibold text-navy">{risk.heading}</h2>
            <div className="mt-3 space-y-3">
              {risk.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-xl font-semibold text-navy">Questions</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            If anything on this page is unclear, or you want to understand how
            a specific risk applies to a specific property, ask us before you
            invest rather than after. Write to{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="font-medium text-navy underline underline-offset-2"
            >
              {SITE.email}
            </a>{" "}
            or{" "}
            <Link
              href="/contact"
              className="font-medium text-navy underline underline-offset-2"
            >
              contact us
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
