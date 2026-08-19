import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaqBrowser } from "@/components/faq/faq-browser";
import { JsonLd } from "@/components/seo/json-ld";
import { FAQ_CATEGORIES, FAQ_COUNT } from "@/lib/faq-data";
import { faqSchema } from "@/lib/structured-data";
import {
  SITE,
  hasRealPhone,
  hasRealWhatsapp,
  telHref,
  whatsappHref,
} from "@/lib/site-config";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers on fees, tax, TDS, KYC, NRI eligibility, ownership structure, exit and risk for fractional real estate investment in India.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        Frequently asked questions
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {FAQ_COUNT} answers on how fractional real estate investment works in
        India — including the ones about fees, tax and getting your money back
        out.
      </p>

      <FaqBrowser />

      {/* Every question on the page, flattened. Google requires the schema to
          match visible content — which it does, since both read the same
          corpus in lib/faq-data.ts. */}
      <JsonLd
        data={faqSchema(FAQ_CATEGORIES.flatMap((category) => category.questions))}
      />

      <section className="mt-16 rounded-2xl bg-navy-light px-6 py-10 text-center sm:px-10">
        <h2 className="text-xl font-semibold text-navy">
          Still have questions?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Ask us anything — including the awkward ones. You will get a straight
          answer from a person, not a brochure.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            render={<Link href="/contact" />}
            nativeButton={false}
            className="bg-brand-green text-white hover:bg-brand-green/90"
          >
            Ask us a question
          </Button>
          {hasRealWhatsapp && (
            <Button
              render={
                <Link
                  href={whatsappHref("Hi GharShare — I have a question.")}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
              variant="outline"
              className="gap-2"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp us
            </Button>
          )}
        </div>
        {hasRealPhone && (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="size-3.5" aria-hidden="true" />
            <a
              href={telHref}
              className="font-medium text-navy underline underline-offset-2"
            >
              {SITE.phone}
            </a>
            <span>· {SITE.hours}</span>
          </p>
        )}
      </section>
    </div>
  );
}
