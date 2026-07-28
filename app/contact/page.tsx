import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact — GharShare",
  description:
    "Get in touch with the GharShare team for questions about fractional real estate investment.",
};

const CONTACT_DETAILS = [
  {
    icon: Phone,
    label: "Call us",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: Mail,
    label: "Email us",
    value: "hello@gharshare.in",
    href: "mailto:hello@gharshare.in",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+91 98765 43210",
    href: "https://wa.me/919876543210",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          Get in touch
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Have a question about fractional investing, or want to talk to our
          team before you commit? Reach out — we usually respond within one
          business day.
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
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {detail.label}
                  </p>
                  <p className="font-medium text-foreground">
                    {detail.value}
                  </p>
                </div>
              </a>
            );
          })}
        </aside>
      </div>
    </div>
  );
}
