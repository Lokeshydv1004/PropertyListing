import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ — GharShare",
  description:
    "Frequently asked questions about fractional real estate investment with GharShare.",
};

const FAQ_SECTIONS = [
  {
    question: "What is fractional real estate investment?",
    answer:
      "Fractional real estate investment lets multiple investors pool capital to co-own a share of a property, rather than one person or entity buying it outright. Each investor owns a proportional stake based on how much they invest, and shares in the property's rental income and appreciation accordingly — without needing the capital, time, or expertise to buy and manage a whole property alone.",
  },
  {
    question: "What is the minimum ticket size?",
    answer:
      "Minimum investment amounts vary by property and are shown on each property's listing page — typically starting from a few lakhs of rupees. This makes it possible to build a diversified real estate portfolio across multiple properties without needing crore-scale capital for any single one.",
  },
  {
    question: "How do returns work?",
    answer:
      "Returns generally come from two sources: periodic rental income distributed to investors based on their ownership share, and capital appreciation realized when the property is eventually sold. Estimated annual yield and investment horizon are listed on each property, though actual returns depend on market conditions and property performance.",
  },
  {
    question: "What are the risks involved?",
    answer:
      "As with any real estate investment, returns are not guaranteed. Risks include vacancy or delayed rental income, property value fluctuations, delays in exit timelines, and general real estate market risk. Fractional ownership also means less individual control over property-level decisions compared to sole ownership. We encourage you to review the specific documentation for a property and consult your own financial advisor before investing.",
  },
  {
    question: "How do exits work?",
    answer:
      "Each property has a stated investment horizon at the end of which the property is typically sold and proceeds are distributed to investors proportional to their ownership. Specific exit terms, and whether any interim liquidity options exist, are detailed in the property's investment documentation shared during onboarding.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        Frequently asked questions
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Everything you need to know about investing in fractional real
        estate with GharShare.
      </p>

      <Accordion className="mt-10">
        {FAQ_SECTIONS.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger className="text-left text-base">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
