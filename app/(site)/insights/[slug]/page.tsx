import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ChevronRight, Clock, Info } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { INSIGHTS, getInsightBySlug, type Block } from "@/lib/insights-data";
import { articleSchema, breadcrumbSchema } from "@/lib/structured-data";

/** The corpus is static, so every post is prerendered at build time. */
export function generateStaticParams() {
  return INSIGHTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getInsightBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      url: `/insights/${post.slug}`,
      publishedTime: post.publishedAt,
    },
    // A draft awaiting professional review should not be collecting search
    // traffic on legal and tax questions. Flip `needsReview` once reviewed.
    ...(post.needsReview && { robots: { index: false, follow: true } }),
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          key={index}
          className="mt-10 font-serif text-2xl font-semibold text-navy"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={index} className="mt-8 text-lg font-semibold text-navy">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p key={index} className="mt-4 leading-relaxed text-foreground/80">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={index} className="mt-4 space-y-2.5">
          {block.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 leading-relaxed text-foreground/80"
            >
              <span
                className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-green"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div
          key={index}
          className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-navy-light/60 p-4"
        >
          <Info
            className="mt-0.5 size-4 shrink-0 text-navy"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-navy">{block.text}</p>
        </div>
      );
    case "todo":
      // Rendered visibly rather than hidden in a comment: an unfinished
      // section on a live page should be impossible to miss.
      return (
        <div
          key={index}
          className="mt-6 flex items-start gap-3 rounded-xl border border-gold/40 bg-gold-light/40 p-4"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-gold-700"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-navy">
            <strong>Editor&apos;s note (pre-publication):</strong>{" "}
            {block.text}
          </p>
        </div>
      );
  }
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getInsightBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = INSIGHTS.filter((item) => item.slug !== post.slug).slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-navy">
          Home
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <Link href="/insights" className="hover:text-navy">
          Insights
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <span className="text-foreground">{post.title}</span>
      </nav>

      <article className="mt-8">
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
        </div>

        <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {post.summary}
        </p>

        {post.needsReview ? (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-gold/50 bg-gold-light/50 p-4">
            <AlertTriangle
              className="mt-0.5 size-5 shrink-0 text-gold-700"
              aria-hidden="true"
            />
            <div className="text-sm leading-relaxed text-navy">
              <strong>Draft — not yet reviewed.</strong> This article covers
              legal and tax matters and has not been checked by a qualified
              professional. It is set to <code>noindex</code> and should not be
              linked from marketing until a lawyer and a chartered accountant
              have reviewed it.
            </div>
          </div>
        ) : (
          post.reviewedBy && (
            <p className="mt-6 text-sm text-muted-foreground">
              Reviewed by {post.reviewedBy}.
            </p>
          )
        )}

        <div className="mt-6 border-t border-border pt-2">
          {post.body.map(renderBlock)}
        </div>
      </article>

      {/* A soft CTA, not a hard sell — someone reading a tax explainer is
          researching, not buying today. */}
      <div className="mt-14 rounded-2xl bg-navy-light px-6 py-8">
        <h2 className="text-lg font-semibold text-navy">
          See how this works in practice
        </h2>
        <p className="mt-2 text-muted-foreground">
          Every listing on GharShare states its terms, fees and risks on the
          page — no obligation to enquire.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/properties"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-green px-6 text-sm font-medium text-white transition-colors hover:bg-brand-green/90"
          >
            Browse properties
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium text-navy transition-colors hover:border-brand-green"
          >
            How it works
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14 border-t border-border pt-8">
          <h2 className="font-serif text-xl font-semibold text-navy">
            Related reading
          </h2>
          <ul className="mt-4 space-y-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/insights/${item.slug}`}
                  className="block rounded-xl border border-border p-4 transition-colors hover:border-brand-green"
                >
                  <p className="font-medium text-navy">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <JsonLd data={articleSchema(post)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
          { name: post.title, path: `/insights/${post.slug}` },
        ])}
      />
    </div>
  );
}
