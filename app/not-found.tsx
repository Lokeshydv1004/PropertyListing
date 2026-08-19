import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "The page you were looking for doesn't exist. Browse properties, read how fractional investment works, or get in touch.",
};

/** A 404 that offered exactly one link was a dead end for anyone who wanted
 *  anything else. These are the three places people actually want next. */
const DESTINATIONS = [
  {
    href: "/properties",
    title: "Browse properties",
    description: "Everything currently open for investment, purchase or lease.",
  },
  {
    href: "/how-it-works",
    title: "How it works",
    description: "The process, the fees, the tax treatment and the timeline.",
  },
  {
    href: "/contact",
    title: "Talk to us",
    description: "Ask a question and get an answer from a person.",
  },
];

/**
 * The global 404, for URLs that match no route at all.
 *
 * It renders the site chrome itself rather than inheriting it: this file sits
 * at the app root, outside the (site) route group, because Next only uses a
 * root-level not-found for unmatched paths. Someone who mistypes a URL should
 * still land somewhere with a way out.
 */
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16 bg-white">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-brand-green">404</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            Page not found
          </h1>
          <p className="mt-3 text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist, or a listing that
            was here has since closed.
          </p>

          <Button
            render={<Link href="/properties" />}
            nativeButton={false}
            className="mt-8 bg-brand-green text-white hover:bg-brand-green/90"
          >
            Browse properties
          </Button>

          <ul className="mt-12 grid w-full gap-3 text-left sm:grid-cols-3">
            {DESTINATIONS.map((destination) => (
              <li key={destination.href}>
                <Link
                  href={destination.href}
                  className="flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand-green"
                >
                  <span className="font-medium text-navy">{destination.title}</span>
                  <span className="mt-1 text-sm text-muted-foreground">
                    {destination.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
