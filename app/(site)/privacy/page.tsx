import type { Metadata } from "next";
import Link from "next/link";

/**
 * NOTE FOR LAUNCH: this is a factually accurate description of what the site
 * currently does with personal data, structured to the DPDP Act 2023's notice
 * requirements. It has NOT been reviewed by a lawyer. Have counsel review and
 * amend before go-live, and fill in the grievance officer details below —
 * naming a grievance officer is a statutory requirement, not optional.
 */

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How GharShare collects, uses and protects your personal data under India's Digital Personal Data Protection Act, 2023.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "19 August 2026";

const SECTIONS = [
  {
    heading: "What we collect",
    body: [
      "When you submit an enquiry or register interest in a property, we collect the name, phone number and email address you provide, the amount or budget you indicate, any message you write, and which property or page the enquiry came from.",
      "We also record basic campaign information — where you arrived from, such as a search engine or an advertisement — so we can understand which channels bring people to the site.",
      "We do not collect financial account details, identity documents, or KYC information through this website. Those are only ever collected later, directly by our team, during a formal onboarding process.",
    ],
  },
  {
    heading: "Why we collect it",
    body: [
      "To contact you about the property or enquiry you submitted, and to answer your questions.",
      "To share investment or leasing documentation you have asked for.",
      "To understand which properties and channels generate interest, so we can improve the site and the range of properties we list.",
    ],
  },
  {
    heading: "The basis on which we process it",
    body: [
      "We process your personal data on the basis of the consent you give when you submit a form. Every form on this site tells you, at the point of submission, that you are agreeing to be contacted and to your details being handled as described here.",
      "You can withdraw that consent at any time by contacting us. Withdrawing consent will not affect processing that already took place while consent was in force.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "We do not sell your personal data, and we do not share it with advertisers or data brokers.",
      "We share it only with service providers who help us run the site and manage enquiries — our database and hosting providers — and only to the extent needed to provide those services.",
      "If you proceed to a transaction, we will share the details necessary with the legal, valuation or escrow partners involved in that specific property, and we will tell you who they are before we do so.",
      "We may disclose data where we are required to by law.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep enquiry records for as long as needed to respond to you and to maintain a record of the enquiry, and for up to 24 months after our last contact with you.",
      "If you ask us to delete your data, we will do so unless we are required to retain it by law.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "Under the Digital Personal Data Protection Act, 2023, you have the right to ask us what personal data of yours we hold and how we have used it; to have inaccurate or incomplete data corrected; to have your data erased; to withdraw your consent; and to nominate another person to exercise these rights on your behalf if you are unable to.",
      "To exercise any of these rights, contact our Grievance Officer using the details below. We will respond within the timeframes set by the Act.",
    ],
  },
  {
    heading: "Security",
    body: [
      "Data submitted through this site is transmitted over an encrypted connection and stored in a managed database with access restricted to the people who need it to handle your enquiry.",
      "No system is perfectly secure. If a breach occurs that affects your data, we will notify you and the Data Protection Board as required by law.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "This site uses only the cookies required for it to function. We do not use advertising or cross-site tracking cookies. If that changes, this policy will be updated and you will be asked for consent before any such cookie is set.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated {LAST_UPDATED}
      </p>
      <p className="mt-6 text-lg text-muted-foreground">
        This policy explains what personal data GharShare collects through this
        website, why we collect it, and what rights you have over it under
        India&apos;s Digital Personal Data Protection Act, 2023.
      </p>

      <div className="mt-12 space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold text-navy">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph) => (
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
          <h2 className="text-xl font-semibold text-navy">
            Grievance Officer
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            If you have a question or complaint about how your personal data has
            been handled, contact our Grievance Officer. We will acknowledge
            your complaint and respond within the period required by the Act.
          </p>
          <div className="mt-4 rounded-xl border border-border bg-card p-5 text-sm">
            <p className="font-medium text-navy">Grievance Officer</p>
            <p className="mt-1 text-muted-foreground">
              GharShare — contact details to be published before launch
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-block font-medium text-navy underline underline-offset-2"
            >
              Contact us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
