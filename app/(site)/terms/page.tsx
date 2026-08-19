import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site-config";

/**
 * NOTE FOR LAUNCH: an accurate description of how this website may be used
 * and what the listings on it are and are not. It has NOT been reviewed by a
 * lawyer, and the governing-law and jurisdiction clause below carries a
 * placeholder city that must be set. Have counsel review before go-live.
 */

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms on which you may use the GharShare website, and what the listings published on it are and are not.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "19 August 2026";

const SECTIONS = [
  {
    heading: "Who these terms are between",
    body: [
      `This website is operated by ${SITE.legalName} ("GharShare", "we", "us"). By using it you agree to these terms. If you do not agree with them, please do not use the site.`,
      "We may update these terms as the site and the business change. The date at the top of this page tells you when they were last changed, and continued use of the site after a change means you accept the updated terms.",
    ],
  },
  {
    heading: "What the listings on this site are",
    body: [
      "Every property listing on this site is published for information only. It is an invitation to enquire — not an offer, not a solicitation, and not a recommendation to invest in, buy, or lease anything.",
      "No contract of any kind comes into existence by browsing this site or by submitting a form on it. Registering interest costs nothing, commits you to nothing, and obliges us to nothing beyond contacting you about your enquiry.",
      "Any actual investment, purchase or lease is governed entirely by the separate documentation executed for that specific property. Where anything on this website conflicts with that documentation, the documentation prevails.",
    ],
  },
  {
    heading: "Accuracy of information",
    body: [
      "We take reasonable care over what we publish. Property details, valuations, yields, funding progress, availability and photographs are drawn from information supplied to us and from independent professional opinions obtained at a point in time.",
      "We do not warrant that everything on this site is accurate, complete or current at the moment you read it. Funding status and availability in particular change frequently. Verify anything you intend to rely on with our team, and with the property documentation, before you act on it.",
      "Estimated yields and projected appreciation are forward-looking estimates and not guarantees. Please read our{{RISK_LINK}} in full.",
    ],
  },
  {
    heading: "This site does not provide advice",
    body: [
      "Nothing on this website constitutes investment, legal, or tax advice, and nothing on it takes account of your personal circumstances, objectives or risk tolerance.",
      "You are responsible for your own decisions and for taking independent professional advice before making any of them.",
    ],
  },
  {
    heading: "Using the site",
    body: [
      "You may use this site for your own personal, non-commercial purposes. You may not scrape it, copy its content or listings systematically, resell or republish any part of it, attempt to interfere with its operation or security, or submit anything through its forms that is false, abusive, or not yours to submit.",
      "You are responsible for the accuracy of the details you give us. Submitting somebody else's contact details without their knowledge is not permitted.",
    ],
  },
  {
    heading: "Intellectual property",
    body: [
      "The design, text, graphics, logos and software of this site belong to us or to our licensors and are protected by law. Property photographs and documents may belong to third parties.",
      "You may not reproduce any of it beyond what these terms permit without written consent.",
    ],
  },
  {
    heading: "Links to other sites",
    body: [
      "Where we link to a third-party site, we do so for convenience. We do not control those sites, we are not responsible for their content, and a link is not an endorsement.",
    ],
  },
  {
    heading: "Availability and liability",
    body: [
      "We do not guarantee that the site will be available uninterrupted or free of errors. We may change, suspend or withdraw any part of it at any time.",
      "To the extent permitted by law, we are not liable for any loss arising from your use of, or reliance on, this website — including loss of profit, loss of opportunity, or any indirect or consequential loss. Nothing in these terms limits any liability that cannot be limited by law.",
    ],
  },
  {
    heading: "Privacy",
    body: [
      "Personal data you submit through this site is handled as described in our{{PRIVACY_LINK}}, which forms part of these terms.",
    ],
  },
  {
    heading: "Governing law",
    body: [
      "These terms are governed by the laws of India. The courts at TODO(pre-launch): insert the city of the registered office shall have exclusive jurisdiction over any dispute arising out of them.",
    ],
  },
];

/** Two paragraphs need an inline link; splitting on a token keeps the copy in
 *  one place rather than fragmenting the section data structure. */
function renderParagraph(text: string) {
  if (text.includes("{{RISK_LINK}}")) {
    const [before, after] = text.split("{{RISK_LINK}}");
    return (
      <>
        {before}{" "}
        <Link
          href="/risk-disclosure"
          className="font-medium text-navy underline underline-offset-2"
        >
          risk disclosure
        </Link>
        {after}
      </>
    );
  }
  if (text.includes("{{PRIVACY_LINK}}")) {
    const [before, after] = text.split("{{PRIVACY_LINK}}");
    return (
      <>
        {before}{" "}
        <Link
          href="/privacy"
          className="font-medium text-navy underline underline-offset-2"
        >
          Privacy Policy
        </Link>
        {after}
      </>
    );
  }
  return text;
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        Terms of Use
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated {LAST_UPDATED}
      </p>
      <p className="mt-6 text-lg text-muted-foreground">
        These terms govern your use of this website. They are not the terms of
        any investment — those live in the documentation for each individual
        property.
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
                  {renderParagraph(paragraph)}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-xl font-semibold text-navy">Contact</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Questions about these terms can go to{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="font-medium text-navy underline underline-offset-2"
            >
              {SITE.email}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
