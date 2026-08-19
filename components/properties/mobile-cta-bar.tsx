import Link from "next/link";
import type { ListingType } from "@/db/schema";

/**
 * Sticky action bar, mobile only.
 *
 * On a phone the enquiry form sits at roughly 88% of the page's scroll depth —
 * after the gallery, facts, terms, description, amenities and highlights — so
 * most mobile visitors never reached any way to act. Desktop already has the
 * sticky sidebar; this is its equivalent.
 */
export function MobileCtaBar({
  label,
  value,
  open,
  listingType,
}: {
  label: string;
  value: string;
  open: boolean;
  listingType: ListingType;
}) {
  const cta =
    listingType === "fractional"
      ? "Register interest"
      : listingType === "rent"
        ? "Enquire to lease"
        : "Enquire to buy";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden">
      <div className="min-w-0 leading-tight">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate font-semibold text-navy">{value}</p>
      </div>

      {open ? (
        <a
          href="#enquiry"
          className="flex h-11 shrink-0 items-center justify-center rounded-lg bg-brand-green px-5 text-sm font-medium text-white"
        >
          {cta}
        </a>
      ) : (
        <Link
          href="/contact"
          className="flex h-11 shrink-0 items-center justify-center rounded-lg bg-navy px-5 text-sm font-medium text-white"
        >
          Join waitlist
        </Link>
      )}
    </div>
  );
}
