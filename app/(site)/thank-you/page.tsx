import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SITE,
  hasRealPhone,
  hasRealWhatsapp,
  telHref,
  whatsappHref,
} from "@/lib/site-config";

/**
 * A real URL to land on after a form submission.
 *
 * Both forms used to show an inline success state, which meant the URL never
 * changed — and without a URL change there is no event for GA4, Meta or
 * Google Ads to attribute a conversion to. You cannot tell which campaign
 * produced a lead if every lead ends on the same URL it started on.
 *
 * It is also the better experience: an inline panel in a sidebar has room for
 * one sentence, where this page has room to say when we will call, how, and
 * what is worth reading in the meantime.
 */
export const metadata: Metadata = {
  title: "Thank you",
  description: "We've received your enquiry and will be in touch shortly.",
  // Keep this out of the index: it is a step in a funnel, not a destination,
  // and it carries no content anyone should arrive at from a search.
  robots: { index: false, follow: true },
};

type EnquiryKind =
  | "interest"
  | "contact"
  | "notify"
  | "list_property"
  | "managed_plan";

const COPY: Record<
  EnquiryKind,
  { heading: string; body: string; showNextSteps: boolean }
> = {
  interest: {
    heading: "Interest submitted",
    body: "We've got your details. An advisor will call you on the number you provided within 1 business day to share the full documentation and answer your questions. There is no obligation at this stage, and nothing is payable.",
    showNextSteps: true,
  },
  contact: {
    heading: "Thanks for reaching out",
    body: "We've received your enquiry. A member of our team will get back to you within 1 business day.",
    showNextSteps: true,
  },
  notify: {
    heading: "You're on the list",
    body: "We'll email you when new properties list. Nothing else — no calls, and you can unsubscribe from any email we send.",
    showNextSteps: false,
  },
  managed_plan: {
    heading: "Request received",
    body: "We've got your details. An advisor will call you within 1 business day with the portfolio pack — what's held today, the fee, the target return band and how it's arrived at, and the risks in full. Nothing is payable, and nothing is committed until you've read all of it.",
    showNextSteps: true,
  },
  list_property: {
    heading: "Property received",
    body: "Thanks — we've got the details. Someone from our acquisitions team will call you within 1 business day and tell you honestly whether it's a fit. There's no listing fee and no exclusivity at any stage.",
    showNextSteps: true,
  },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawType = Array.isArray(params.type) ? params.type[0] : params.type;
  const kind: EnquiryKind =
    rawType === "contact" ||
    rawType === "notify" ||
    rawType === "list_property" ||
    rawType === "managed_plan"
      ? rawType
      : "interest";
  const copy = COPY[kind];

  const property = Array.isArray(params.property)
    ? params.property[0]
    : params.property;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-green-light">
        <CheckCircle2
          className="size-7 text-brand-green"
          aria-hidden="true"
        />
      </span>

      <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-navy">
        {copy.heading}
      </h1>
      <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
        {copy.body}
      </p>

      {copy.showNextSteps && (
        <div className="mt-8 flex w-full max-w-md flex-col gap-3">
          {hasRealWhatsapp && (
            <a
              href={whatsappHref(
                property
                  ? `Hi GharShare — I just registered interest in ${property}.`
                  : "Hi GharShare — I just submitted an enquiry."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-medium text-navy transition-colors hover:border-brand-green"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Prefer WhatsApp? Message us now
            </a>
          )}
          {hasRealPhone && (
            <a
              href={telHref}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-medium text-navy transition-colors hover:border-brand-green"
            >
              Call us on {SITE.phone}
            </a>
          )}
          <Link
            href="/how-it-works"
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-sm text-muted-foreground transition-colors hover:border-brand-green hover:text-navy"
          >
            Meanwhile: read how onboarding works
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      <Button
        render={<Link href="/properties" />}
        nativeButton={false}
        className="mt-10 bg-brand-green text-white hover:bg-brand-green/90"
      >
        Keep browsing properties
      </Button>
    </div>
  );
}
