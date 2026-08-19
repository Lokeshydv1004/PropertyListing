import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import {
  SITE,
  hasRealPhone,
  hasRealWhatsapp,
  telHref,
  whatsappHref,
} from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the GharShare team for questions about fractional real estate investment.",
  alternates: { canonical: "/contact" },
};

/**
 * Every channel comes from `lib/site-config`.
 *
 * This page used to hardcode "+91 98765 43210" — the sample phone number
 * every form tutorial in India uses, which a prospective investor recognises
 * on sight — for both the phone tile and the WhatsApp tile. A channel that is
 * still a placeholder is now hidden rather than published, because an
 * unanswered number is worse than no number at all.
 */
const CONTACT_DETAILS = [
  hasRealPhone && {
    icon: Phone,
    label: "Call us",
    value: SITE.phone,
    href: telHref,
  },
  {
    icon: Mail,
    label: "Email us",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
  },
  hasRealWhatsapp && {
    icon: MessageCircle,
    label: "WhatsApp",
    value: SITE.phone,
    href: whatsappHref("Hi GharShare — I have a question."),
  },
].filter(Boolean) as {
  icon: typeof Phone;
  label: string;
  value: string;
  href: string;
}[];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          Get in touch
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Have a question about fractional investing, want to buy or lease a
          space, or want to talk to our team before you commit? Reach out — we
          reply within one business day.
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ContactForm />

        <aside className="space-y-4">
          {CONTACT_DETAILS.map((detail) => {
            const Icon = detail.icon;
            return (
              <a
                key={detail.label}
                href={detail.href}
                target={detail.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  detail.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:border-brand-green"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-light text-navy">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">
                    {detail.label}
                  </p>
                  <p className="truncate font-medium text-foreground">
                    {detail.value}
                  </p>
                </div>
              </a>
            );
          })}

          {/* "We respond within one business day" is a promise you cannot
              check without knowing what our business days are. */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-light text-navy">
                <Clock className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Office hours</p>
                <p className="font-medium text-foreground">{SITE.hours}</p>
              </div>
            </div>
          </div>

          {SITE.address && (
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-light text-navy">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Registered office
                  </p>
                  <p className="font-medium text-foreground">
                    {SITE.legalName}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {SITE.address}
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
