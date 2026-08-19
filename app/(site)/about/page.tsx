import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Building2, FileSearch, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site-config";

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  PRE-LAUNCH TODO — the TEAM, PARTNERS and founding-story sections below
 *  need real people and real firms. Everything marked TODO must be filled.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * There was no About page at all: no team, no registered address, no company
 * name, no CIN, no founding story, no advisors. For a decision measured in
 * lakhs that is the single biggest unanswered objection on the site — every
 * competitor in this space leads with founders' faces and credentials,
 * because that is what converts.
 *
 * The due-diligence section is written out in full because it is the part
 * that converts and it describes a process, not a person. The team section
 * renders nothing while `TEAM` is empty rather than showing invented people.
 */

export const metadata: Metadata = {
  title: "About us",
  description:
    "Who runs GharShare, how we choose the properties we list, and the company behind the platform.",
  alternates: { canonical: "/about" },
};

type TeamMember = {
  name: string;
  role: string;
  /** Prior experience matters more than anything else on this page. */
  background: string;
  linkedin?: string;
  photo?: string;
};

type Partner = { name: string; role: string };

// TODO(pre-launch): real names, real roles, real prior experience, LinkedIn
// links and photographs. Nothing invented — this is the page people check.
const TEAM: TeamMember[] = [];

// TODO(pre-launch): the firms actually engaged — legal, valuation, escrow
// bank, property managers — named, with their written agreement to be named.
const PARTNERS: Partner[] = [];

const DUE_DILIGENCE = [
  {
    icon: FileSearch,
    title: "Title and encumbrance",
    body: "A title search covering the chain of ownership, plus a current encumbrance certificate. A property with an unclear chain of title does not get listed, regardless of how good the yield looks.",
  },
  {
    icon: Scale,
    title: "Independent legal review",
    body: "A law firm we do not control reviews the documentation and flags what it finds. We publish what matters to an investor rather than only what flatters the listing.",
  },
  {
    icon: Building2,
    title: "Independent valuation",
    body: "A third-party valuation sets the number we list against — not the seller's asking price, and not our own estimate.",
  },
  {
    icon: AlertTriangle,
    title: "Rent roll and occupancy",
    body: "For a leased asset, we check the lease itself: who the tenant is, what they pay, when it escalates, when it expires, and whether they have actually been paying. A yield is only as good as the rent roll behind it.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        About GharShare
      </h1>

      {/* ── Founding story ─────────────────────────────────────────────── */}
      <section className="mt-8 max-w-2xl space-y-4 text-lg text-muted-foreground">
        <p>
          Good commercial real estate in India has always been available to
          people who could write a five-crore cheque, and to almost nobody
          else. The assets that produce reliable rent — a leased office floor,
          a mall unit with real footfall — sit far above what an individual
          investor can reach, so most people end up in a second flat they did
          not want and cannot easily sell.
        </p>
        <p className="rounded-xl border border-gold/40 bg-gold-light/40 p-4 text-base text-navy">
          <strong>TODO(pre-launch):</strong>{" "}
          replace this section with the real founding story — why this company exists, who decided to build it,
          and what they were doing before. Two or three paragraphs, in plain
          language, in the founder&apos;s own voice. It is the cheapest trust
          you will ever buy.
        </p>
      </section>

      {/* ── Team ───────────────────────────────────────────────────────── */}
      {TEAM.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            The team
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="font-semibold text-navy">{member.name}</h3>
                <p className="text-sm text-brand-green">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {member.background}
                </p>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-navy underline underline-offset-2"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-16">
          <h2 className="font-serif text-2xl font-semibold text-navy">
            The team
          </h2>
          <p className="mt-4 rounded-xl border border-gold/40 bg-gold-light/40 p-4 text-navy">
            <strong>TODO(pre-launch):</strong>{" "}
            this section is intentionally empty rather than filled with
            placeholder people. Add the real
            team to <code>TEAM</code> in this file — name, role, prior
            experience, LinkedIn, photograph. Prior experience is the part that
            persuades; do not skip it.
          </p>
        </section>
      )}

      {/* ── Due diligence — the section that converts ──────────────────── */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          How we choose properties
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Most listings we look at do not make it onto the site. This is what
          each one has to clear first.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {DUE_DILIGENCE.map((check) => {
            const Icon = check.icon;
            return (
              <div
                key={check.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-navy-light text-navy">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-navy">{check.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {check.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Partners ───────────────────────────────────────────────────── */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          Who we work with
        </h2>
        {PARTNERS.length > 0 ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {PARTNERS.map((partner) => (
              <li
                key={partner.name}
                className="rounded-xl border border-border bg-card p-4"
              >
                <p className="font-medium text-navy">{partner.name}</p>
                <p className="text-sm text-muted-foreground">{partner.role}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-gold/40 bg-gold-light/40 p-4 text-navy">
            <strong>TODO(pre-launch):</strong>{" "}
            name the legal firm, valuation agency, escrow bank and property
            managers actually engaged — with
            their written agreement to be named. Borrowed credibility from
            institutions people already trust is worth more here than anything
            we can say about ourselves.
          </p>
        )}
      </section>

      {/* ── Company details ────────────────────────────────────────────── */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-semibold text-navy">
          Company details
        </h2>
        <dl className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
            <dt className="w-48 shrink-0 text-sm text-muted-foreground">
              Registered entity
            </dt>
            <dd className="font-medium text-navy">{SITE.legalName}</dd>
          </div>
          <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
            <dt className="w-48 shrink-0 text-sm text-muted-foreground">CIN</dt>
            <dd className="font-medium text-navy">
              {SITE.cin || "To be published before launch"}
            </dd>
          </div>
          <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
            <dt className="w-48 shrink-0 text-sm text-muted-foreground">
              Registered office
            </dt>
            <dd className="font-medium text-navy">
              {SITE.address || "To be published before launch"}
            </dd>
          </div>
          <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
            <dt className="w-48 shrink-0 text-sm text-muted-foreground">
              Contact
            </dt>
            <dd className="font-medium text-navy">
              <a
                href={`mailto:${SITE.email}`}
                className="underline underline-offset-2"
              >
                {SITE.email}
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-16 rounded-2xl bg-navy-light px-6 py-10 text-center sm:px-10">
        <h2 className="text-xl font-semibold text-navy">
          Want to talk to us first?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          That is usually the right instinct with an investment platform. Ask
          us anything before you look at a single listing.
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
            Talk to us
          </Button>
        </div>
      </div>
    </div>
  );
}
