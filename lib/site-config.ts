/**
 * Single source of truth for the company's own facts.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  PRE-LAUNCH TODO — these values MUST be replaced before any traffic.
 * ─────────────────────────────────────────────────────────────────────────
 * The site previously hardcoded `+91 98765 43210` and `hello@gharshare.in`
 * into the contact page. 98765 43210 is *the* sample phone number in India —
 * it appears in every form tutorial in the country — and a prospective
 * investor recognises it instantly. Combined with unverifiable statistics it
 * made the whole site read as a template nobody had finished.
 *
 * Everything here is now env-driven so it can be corrected without touching a
 * component. The fallbacks are deliberately, visibly fake (all zeroes, "TBC")
 * rather than plausible-looking: a placeholder that looks real is worse than
 * one that looks obviously unfinished, because it ships silently.
 *
 * Set these in `.env.local` (and in the Netlify dashboard) before launch:
 *
 *   NEXT_PUBLIC_CONTACT_PHONE     e.g. "+91 80 4718 2200"
 *   NEXT_PUBLIC_CONTACT_EMAIL     e.g. "invest@gharshare.in"
 *   NEXT_PUBLIC_WHATSAPP          digits only, with country code, no "+"
 *   NEXT_PUBLIC_LEGAL_NAME        the registered entity
 *   NEXT_PUBLIC_CIN               Corporate Identity Number
 *   NEXT_PUBLIC_ADDRESS           registered office address
 *   NEXT_PUBLIC_SITE_URL          canonical origin, no trailing slash
 */

const PLACEHOLDER_PHONE = "+91 00000 00000";
const PLACEHOLDER_WHATSAPP = "910000000000";

export const SITE = {
  name: "GharShare",

  /** Registered entity. Shown in the footer and on the legal pages. */
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "GharShare (entity name TBC)",
  /** Corporate Identity Number. */
  cin: process.env.NEXT_PUBLIC_CIN ?? "",

  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? PLACEHOLDER_PHONE,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@gharshare.in",
  /** Digits only, country code included, no "+" — that's what wa.me expects. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? PLACEHOLDER_WHATSAPP,

  address: process.env.NEXT_PUBLIC_ADDRESS ?? "",
  hours: "Monday to Saturday, 10:00 – 19:00 IST",

  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gharshare.in",
} as const;

/** True while a contact channel is still the placeholder, so the UI can hide
 *  it rather than publish a number nobody answers. */
export const hasRealPhone = SITE.phone !== PLACEHOLDER_PHONE;
export const hasRealWhatsapp = SITE.whatsapp !== PLACEHOLDER_WHATSAPP;

/** `tel:` needs the number stripped of spaces and punctuation. */
export const telHref = `tel:${SITE.phone.replace(/[^\d+]/g, "")}`;

/** Opens WhatsApp with a message already typed, which measurably lifts the
 *  proportion of taps that turn into an actual conversation. */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
