import Link from "next/link";
import { ArrowRight, ClipboardCheck, HandCoins, Search, TrendingUp } from "lucide-react";

/**
 * The on-ramp for someone who has never heard of fractional ownership.
 *
 * This section was deleted and never replaced, which left the home page
 * jumping from a row of statistics straight to ₹5 crore listings. A
 * first-time visitor who does not already know what fractional ownership *is*
 * had nothing to stand on between "here are numbers" and "here is a property
 * you cannot afford".
 */
const STEPS = [
  {
    icon: Search,
    title: "Browse",
    text: "Explore title-verified, income-generating properties with the full terms on every listing.",
  },
  {
    icon: HandCoins,
    title: "Register interest",
    text: "Tell us the amount you're considering. Nothing is paid and nothing is committed at this stage.",
  },
  {
    icon: ClipboardCheck,
    title: "Get onboarded",
    text: "We share the complete documentation, answer your questions, and complete KYC with you.",
  },
  {
    icon: TrendingUp,
    title: "Earn returns",
    text: "Receive your share of the rental income, and of any appreciation when the property is sold.",
  },
];

export function HowItWorksSummary() {
  return (
    <section className="bg-cream py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          How it works
        </h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          From browsing a property to your first rental payout — four steps, no
          jargon.
        </p>

        {/* A connected timeline on a phone, cards from sm up.
            As four stacked cards this section ran to 1131px — 1.3 phone
            screens for what is meant to be a *summary* with a link to the
            full process. The timeline carries the same four steps and the
            same copy in roughly a third of the height, and the connecting
            rule makes the sequence clearer than separate cards did. */}
        <ol className="mt-6 sm:mt-8 sm:grid sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === STEPS.length - 1;
            return (
              <li
                key={step.title}
                className="flex gap-3.5 sm:block sm:rounded-2xl sm:border sm:border-border sm:bg-card sm:p-5"
              >
                <div className="flex flex-col items-center sm:block">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy text-white sm:size-10">
                    <Icon className="size-4 sm:size-5" aria-hidden="true" />
                  </span>
                  {!isLast && (
                    <span
                      className="mt-1 w-px flex-1 bg-border sm:hidden"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className={isLast ? "" : "pb-6 sm:pb-0"}>
                  <p className="text-xs font-medium text-brand-green sm:mt-4">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-0.5 font-semibold text-navy sm:mt-1">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:mt-1.5">
                    {step.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <Link
          href="/how-it-works"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-navy underline underline-offset-4 hover:text-brand-green sm:mt-8"
        >
          See the full process, fees and timelines
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
