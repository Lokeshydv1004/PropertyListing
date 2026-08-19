import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import {
  SITE,
  hasRealPhone,
  hasRealWhatsapp,
  telHref,
  whatsappHref,
} from "@/lib/site-config";

const EXPLORE_LINKS = [
  { href: "/properties", label: "Properties" },
  { href: "/invest-with-us", label: "Managed portfolio" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/insights", label: "Insights" },
  { href: "/faq", label: "FAQ" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/list-your-property", label: "List your property" },
  { href: "/contact", label: "Contact" },
];

/**
 * Legal is a first-class column, not a footnote.
 *
 * The site collects name, phone, email and stated investment amount, and
 * publishes forward-looking yield figures. Both of those carry obligations —
 * notice and consent under the DPDP Act 2023, and a risk disclosure for
 * investment content — and neither was reachable from anywhere on the site.
 */
const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/risk-disclosure", label: "Risk Disclosure" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#032E24] text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-6 sm:gap-8">
          <div className="col-span-2 sm:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-green text-sm font-bold text-white">
                G
              </span>
              GharShare
            </Link>
            <p className="mt-2 max-w-xs text-sm">
              Fractional real estate investment, made simple. Browse
              opportunities and submit your interest — our team handles the
              rest.
            </p>

            {/* Who you are dealing with. A ₹1 lakh+ decision made to an
                anonymous website is a decision almost nobody makes. */}
            <div className="mt-3 space-y-1 text-xs text-white/60">
              <p>{SITE.legalName}</p>
              {SITE.address && <p>{SITE.address}</p>}
              {SITE.cin && <p>CIN: {SITE.cin}</p>}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Explore</h3>
            <ul className="mt-2 space-y-1.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-2 space-y-1.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Its own column, not a sub-heading inside Company. Nested under
              Company it started halfway down the right-hand column and left a
              tall gap beside the Explore list on a phone. */}
          <div>
            <h3 className="text-sm font-semibold text-white">Talk to us</h3>
            <ul className="mt-2 space-y-1.5">
              {hasRealPhone && (
                <li>
                  <a
                    href={telHref}
                    className="flex items-center gap-2 text-sm transition-colors hover:text-white"
                  >
                    <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                    {SITE.phone}
                  </a>
                </li>
              )}
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-2 text-sm transition-colors hover:text-white"
                >
                  <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                  {SITE.email}
                </a>
              </li>
              {hasRealWhatsapp && (
                <li>
                  <a
                    href={whatsappHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm transition-colors hover:text-white"
                  >
                    <MessageCircle
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-2 space-y-1.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
          <p>
            © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </p>
          <p>{SITE.hours}</p>
        </div>
      </div>
    </footer>
  );
}
