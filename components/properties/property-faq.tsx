import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatCompactINR } from "@/lib/format";
import type { ListingType, Property } from "@/db/schema";

/**
 * The last objections, answered where the decision is made.
 *
 * These questions were reachable only from /faq — i.e. by leaving the page
 * with the form on it. Answering them in place removes the reasons somebody
 * closes the tab "to check something", and gives Google a block it can lift
 * into an expandable FAQ result for this listing specifically.
 *
 * Answers are written from this property's own data wherever the data exists,
 * so two listings never show identical text the way the old generic
 * highlights block did.
 */
function questionsFor(property: Property): { q: string; a: string }[] {
  const horizon = property.investmentHorizon;
  const minTicket = property.minInvestment
    ? formatCompactINR(Number(property.minInvestment))
    : null;

  const byType: Record<ListingType, { q: string; a: string }[]> = {
    fractional: [
      {
        q: "What happens if this property doesn't fully fund?",
        a: "The investment does not proceed. Funds held in escrow are returned in full to everyone who committed — nobody is left holding a stake in a partially funded asset, and no fee is charged.",
      },
      {
        q: "When would I receive my first payout?",
        a: "Rental income is distributed periodically once the property is funded, tenanted and generating rent. The exact schedule for this property, including the date of the first expected distribution, is set out in the documentation we share before you commit anything.",
      },
      {
        q: "What fees apply to this property?",
        a: "The fee schedule for this listing — what is charged, when, and on what basis — is stated in the investment documentation, and we walk you through it on the call before anything is signed. No fee applies to registering interest.",
      },
      {
        q: horizon
          ? `What happens at the end of the ${horizon} horizon?`
          : "What happens at the end of the horizon?",
        a: `The intention is to sell the property${horizon ? ` at around the ${horizon} mark` : " at the end of the stated horizon"} and distribute the proceeds in proportion to each holding. Market conditions can extend that timeline, which is why this is not money you should expect back on a fixed date.`,
      },
      {
        q: minTicket
          ? `Do I have to invest exactly ${minTicket}?`
          : "How much do I have to invest?",
        a: minTicket
          ? `${minTicket} is the minimum for this property, not the required amount. You can commit more, subject to what remains unallocated. Tell us the figure you're considering on the form and we'll confirm what's available.`
          : "The minimum for this property is shown above. You can commit more, subject to what remains unallocated.",
      },
    ],
    sale: [
      {
        q: "Is the asking price negotiable?",
        a: "Every sale has room to discuss. Tell us your budget on the enquiry form and we'll tell you honestly whether it is in range before you spend time on a site visit.",
      },
      {
        q: "What documents will I see before I commit?",
        a: "Title deed and chain of title, encumbrance certificate, approved plans, tax receipts and — where the project is registered — the RERA registration. We share these during the buying process, not after.",
      },
      {
        q: "Can I visit the property?",
        a: "Yes. Enquire and we'll arrange a viewing at a time that suits you, with someone who can answer questions about the building and the locality on site.",
      },
    ],
    rent: [
      {
        q: "What is the deposit and lock-in?",
        a: "The commercial terms for this unit — deposit, lock-in period, notice period and any escalation — are set out in the listing terms above and confirmed in the draft lease we share on enquiry.",
      },
      {
        q: "Who handles maintenance?",
        a: "Building maintenance and common-area upkeep are handled by the property manager. What sits with the tenant versus the landlord is defined in the lease, and we go through it line by line before you sign.",
      },
      {
        q: "How quickly can I move in?",
        a: "That depends on the unit's current status and how fast documentation completes at your end. Enquire and we'll give you a realistic date rather than an optimistic one.",
      },
    ],
  };

  return byType[property.listingType];
}

export function PropertyFaq({ property }: { property: Property }) {
  const questions = questionsFor(property);

  return (
    <div className="mt-8">
      <h2 className="font-serif text-xl font-semibold text-navy">
        Questions about this listing
      </h2>

      <Accordion className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
        {questions.map((item) => (
          <AccordionItem key={item.q} value={item.q} className="px-5">
            <AccordionTrigger className="py-4 text-left text-base font-medium text-navy">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="pb-4 leading-relaxed text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <p className="mt-4 text-sm text-muted-foreground">
        Something else on your mind?{" "}
        <Link
          href="/faq"
          className="font-medium text-navy underline underline-offset-2 hover:text-brand-green"
        >
          Read all FAQs
        </Link>{" "}
        or{" "}
        <Link
          href="/contact"
          className="font-medium text-navy underline underline-offset-2 hover:text-brand-green"
        >
          ask us directly
        </Link>
        .
      </p>
    </div>
  );
}
