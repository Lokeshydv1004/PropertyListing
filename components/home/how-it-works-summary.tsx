import Link from "next/link";
import { ArrowRight, Search, HandCoins, ClipboardCheck, TrendingUp } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Browse",
    description: "Explore verified, income-generating properties.",
  },
  {
    icon: HandCoins,
    title: "Submit Interest",
    description: "Tell us how much you'd like to invest.",
  },
  {
    icon: ClipboardCheck,
    title: "Get Onboarded",
    description: "Our team walks you through the details.",
  },
  {
    icon: TrendingUp,
    title: "Earn Returns",
    description: "Receive your share of rental income and appreciation.",
  },
];

export function HowItWorksSummary() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-navy">
          How it works
        </h2>
        <p className="mt-2 max-w-lg text-muted-foreground">
          From browsing a property to earning your first returns, in four
          steps.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white">
                <Icon className="size-5" />
              </span>
              <p className="mt-4 text-sm font-medium text-brand-green">
                Step {index + 1}
              </p>
              <h3 className="mt-1 font-semibold text-navy">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/how-it-works"
          className="flex items-center gap-1.5 text-sm font-medium text-navy hover:text-brand-green"
        >
          Learn more about how it works
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
