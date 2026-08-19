import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * The top objections, answered before the visitor has to go looking.
 *
 * Making somebody navigate to /faq to find out whether they can get their
 * money back is how you lose them. These four are the questions that decide
 * whether a first-time visitor keeps reading, so they are answered in place.
 * Every answer here is a shortened version of the one on /faq — keep the two
 * in step when either changes.
 */
const TEASER_QUESTIONS = [
  {
    question: "What am I actually buying?",
    answer:
      "A proportional economic interest in a specific property, held through a structure set up for that property alone. You are not lending money to GharShare and your interest is not pooled across unrelated assets — every listing stands on its own, and the exact holding structure is set out in the documentation you receive before you commit anything.",
  },
  {
    question: "What does GharShare charge?",
    answer:
      "Fees are stated upfront on every listing and again in the documentation, before you commit. We do not take a cut that is not disclosed in writing first. The full fee schedule is on the How It Works page.",
  },
  {
    question: "Can I get my money out before the horizon ends?",
    answer:
      "Fractional real estate is not a liquid investment, and you should not invest money you may need at short notice. Each listing states its target hold period and the exit route planned for it. Early exit is possible only where a buyer for your share can be found, and is never guaranteed.",
  },
  {
    question: "What happens if a property doesn't fully fund?",
    answer:
      "The investment does not proceed. Funds held in escrow are returned in full to everyone who committed — nobody ends up holding a stake in a partially funded asset.",
  },
];

export function FaqTeaser() {
  return (
    <section className="bg-cream py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          Questions people ask first
        </h2>
        <p className="mt-2 text-muted-foreground">
          The four that come up in almost every conversation.
        </p>

        <Accordion className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
          {TEASER_QUESTIONS.map((item) => (
            <AccordionItem
              key={item.question}
              value={item.question}
              className="px-5"
            >
              <AccordionTrigger className="py-4 text-left text-base font-medium text-navy">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Link
          href="/faq"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-navy underline underline-offset-4 hover:text-brand-green"
        >
          Read all frequently asked questions
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
