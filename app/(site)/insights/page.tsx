import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { INSIGHTS_BY_DATE } from "@/lib/insights-data";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Plain-language guides to fractional real estate in India — the regulation, the tax treatment, how yields work, and how to evaluate a commercial asset.",
  alternates: { canonical: "/insights" },
  openGraph: {
    title: "Insights | GharShare",
    description:
      "Plain-language guides to fractional real estate in India — regulation, tax, yields and how to evaluate an asset.",
    url: "/insights",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function InsightsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        Insights
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        The questions people research before they invest — answered properly,
        including the parts that are inconvenient for us.
      </p>

      <ul className="mt-12 space-y-4">
        {INSIGHTS_BY_DATE.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/insights/${post.slug}`}
              className="group block rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand-green"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="rounded-full bg-navy-light px-2.5 py-1 font-medium text-navy">
                  {post.category}
                </span>
                <span className="text-muted-foreground">
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3" aria-hidden="true" />
                  {post.readingMinutes} min read
                </span>
                {post.needsReview && (
                  <span className="rounded-full bg-gold-light px-2.5 py-1 font-medium text-gold-700">
                    Draft — pending review
                  </span>
                )}
              </div>

              <h2 className="mt-3 font-serif text-xl font-semibold text-navy group-hover:text-brand-green">
                {post.title}
              </h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {post.summary}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-navy">
                Read
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-14 rounded-2xl bg-navy-light px-6 py-10 text-center sm:px-10">
        <h2 className="text-xl font-semibold text-navy">
          Ready to look at actual properties?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Every listing states its terms, its fees and its risks on the page.
        </p>
        <Link
          href="/properties"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-brand-green px-6 text-sm font-medium text-white transition-colors hover:bg-brand-green/90"
        >
          Browse properties
        </Link>
      </div>
    </div>
  );
}
