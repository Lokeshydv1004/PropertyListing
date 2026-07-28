import type { Metadata } from "next";
import Link from "next/link";
import { Search, HandCoins, ClipboardCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "How It Works — GharShare",
  description:
    "How fractional real estate investment works with GharShare, from browsing properties to earning returns.",
};

const STEPS = [
  {
    icon: Search,
    title: "Browse",
    summary: "Explore verified, income-generating properties.",
    detail:
      "Every listing on GharShare goes through a verification process before it's published — ownership documents, valuation, and funding target are checked. You can filter by location, property type, funding status, and minimum investment to find opportunities that fit your budget.",
  },
  {
    icon: HandCoins,
    title: "Submit Interest",
    summary: "Tell us how much you'd like to invest.",
    detail:
      "Found a property you like? Submit your interest directly from the listing page with the amount you're considering. There's no payment at this stage — this simply lets our team know you're a qualified, interested investor.",
  },
  {
    icon: ClipboardCheck,
    title: "Get Onboarded",
    summary: "Our team walks you through the details.",
    detail:
      "A member of the GharShare team will reach out to answer your questions, share the full investment documentation, and guide you through the onboarding and legal process for that specific property.",
  },
  {
    icon: TrendingUp,
    title: "Earn Returns",
    summary: "Receive your share of rental income and appreciation.",
    detail:
      "Once the property is fully funded and operational, returns are distributed to investors based on their ownership share — typically a mix of periodic rental income and capital appreciation at exit.",
  },
];

const MECHANICS_FAQS = [
  {
    question: "How is my investment structured?",
    answer:
      "Each property is held through a legal ownership structure managed by our legal team, with investors holding a proportional share based on their investment amount. GharShare's platform only reflects the property's public funding status — the legal structuring is handled separately and shared with you during onboarding.",
  },
  {
    question: "Who manages the property day-to-day?",
    answer:
      "A property manager (either the original owner's team or a professional management partner) handles leasing, maintenance, and tenant relations, so investors don't need to manage anything directly.",
  },
  {
    question: "How and when do I receive returns?",
    answer:
      "Returns are typically distributed periodically as rental income is collected, with additional returns realized through capital appreciation when the property is eventually sold. Exact timelines vary by property and are shared during onboarding.",
  },
  {
    question: "What happens if a property doesn't reach its funding target?",
    answer:
      "If a property doesn't reach its funding target by the listed deadline, the fundraise doesn't proceed and any commitments made during that window are void. Our team will reach out directly if this affects a property you've expressed interest in.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          How GharShare works
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Fractional real estate investment, from browsing a property to
          earning your first returns — here's exactly what happens at each
          step.
        </p>
      </div>

      <div className="mt-16 space-y-12">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                  <Icon className="size-5" />
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

      <div className="mt-20">
        <h2 className="text-2xl font-semibold text-navy">
          Investment mechanics FAQs
        </h2>
        <Accordion className="mt-6">
          {MECHANICS_FAQS.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-16 rounded-2xl bg-navy-light px-6 py-10 text-center sm:px-10">
        <h2 className="text-xl font-semibold text-navy">
          Ready to explore properties?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Browse verified, fully-vetted properties currently open for
          fractional investment.
        </p>
        <Button
          render={<Link href="/properties" />}
          nativeButton={false}
          className="mt-6 bg-brand-green text-white hover:bg-brand-green/90"
        >
          Browse Properties
        </Button>
      </div>
    </div>
  );
}
