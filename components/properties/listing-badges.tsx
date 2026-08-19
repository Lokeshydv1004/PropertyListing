import { cn } from "@/lib/utils";
import { LISTING_TYPE_SHORT, STATUS_LABEL } from "@/lib/taxonomy";
import type { ListingStatus, ListingType } from "@/db/schema";

/**
 * The "Invest / Buy / Rent" pill.
 *
 * With three transaction modes in one catalogue, this is the first thing a
 * card has to communicate — the same ₹26,000,000 means "asking price" on a
 * sale listing and nothing at all on a rental.
 */
export function ListingTypeBadge({
  listingType,
  className,
}: {
  listingType: ListingType;
  className?: string;
}) {
  const style: Record<ListingType, string> = {
    fractional: "bg-brand-green text-white",
    sale: "bg-navy text-white",
    rent: "bg-gold text-navy",
  };

  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase sm:px-2.5 sm:py-1 sm:text-[11px]",
        style[listingType],
        className
      )}
    >
      {LISTING_TYPE_SHORT[listingType]}
    </span>
  );
}

/**
 * Status pill. Colours carry meaning: green = open to enquiries,
 * amber = in progress, muted = no longer available.
 */
export function StatusBadge({
  status,
  percentFunded,
  className,
}: {
  status: ListingStatus;
  /** Fractional only — shown instead of the word "Fundraising". */
  percentFunded?: number;
  className?: string;
}) {
  const style: Record<ListingStatus, string> = {
    fundraising: "bg-white/95 text-navy",
    fully_funded: "bg-navy text-white",
    closed: "bg-muted text-muted-foreground",
    available: "bg-white/95 text-brand-green",
    under_offer: "bg-gold text-navy",
    sold: "bg-navy text-white",
    let: "bg-navy text-white",
    off_market: "bg-muted text-muted-foreground",
  };

  const label =
    status === "fundraising" && percentFunded !== undefined
      ? `${Math.round(percentFunded)}% FUNDED`
      : STATUS_LABEL[status].toUpperCase();

  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs",
        style[status],
        className
      )}
    >
      {label}
    </span>
  );
}
