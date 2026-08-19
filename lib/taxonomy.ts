import type {
  ListingStatus,
  ListingType,
  PropertyCategory,
} from "@/db/schema";

/**
 * Display labels and grouping for the property taxonomy.
 *
 * The database stores stable enum values; everything user-facing is
 * resolved through here, so renaming a label never means a migration.
 */

export const LISTING_TYPE_LABEL: Record<ListingType, string> = {
  fractional: "Fractional investment",
  sale: "For sale",
  rent: "For rent",
};

/** Short form for cards and filter chips. */
export const LISTING_TYPE_SHORT: Record<ListingType, string> = {
  fractional: "Invest",
  sale: "Buy",
  rent: "Rent",
};

export const CATEGORY_LABEL: Record<PropertyCategory, string> = {
  residential_apartment: "Apartment",
  villa: "Villa",
  plot_land: "Plot / Land",
  commercial_office: "Office",
  coworking_space: "Co-working",
  retail_shop: "Retail Shop",
  mall_shop: "Mall Shop",
  showroom: "Showroom",
  food_court_unit: "Food Court Unit",
  restaurant_space: "Restaurant Space",
  warehouse: "Warehouse",
  holiday_rental: "Holiday Rental",
};

/** Filter-bar grouping, so a 12-item list stays scannable. */
export const CATEGORY_GROUPS: {
  label: string;
  categories: PropertyCategory[];
}[] = [
  {
    label: "Residential",
    categories: ["residential_apartment", "villa", "plot_land"],
  },
  {
    label: "Workspace",
    categories: ["commercial_office", "coworking_space"],
  },
  {
    label: "Retail",
    categories: ["retail_shop", "mall_shop", "showroom"],
  },
  {
    label: "Food & Beverage",
    categories: ["food_court_unit", "restaurant_space"],
  },
  {
    label: "Other",
    categories: ["warehouse", "holiday_rental"],
  },
];

/** Categories that sit inside a mall or building and care about footfall. */
export const RETAIL_CATEGORIES: PropertyCategory[] = [
  "retail_shop",
  "mall_shop",
  "showroom",
  "food_court_unit",
  "restaurant_space",
];

/** Categories where kitchen provisioning and seating are decision factors. */
export const FNB_CATEGORIES: PropertyCategory[] = [
  "food_court_unit",
  "restaurant_space",
];

export function isRetail(category: PropertyCategory): boolean {
  return RETAIL_CATEGORIES.includes(category);
}

export function isFnB(category: PropertyCategory): boolean {
  return FNB_CATEGORIES.includes(category);
}

export const STATUS_LABEL: Record<ListingStatus, string> = {
  fundraising: "Fundraising",
  fully_funded: "Fully Funded",
  closed: "Closed",
  available: "Available",
  under_offer: "Under Offer",
  sold: "Sold",
  let: "Let",
  off_market: "Off Market",
};

/** Which statuses are selectable for a given listing type. */
export const STATUSES_FOR_LISTING_TYPE: Record<ListingType, ListingStatus[]> = {
  fractional: ["fundraising", "fully_funded", "closed"],
  sale: ["available", "under_offer", "sold"],
  rent: ["available", "under_offer", "let"],
};

/** A listing still open to enquiries — drives whether we show the CTA form. */
export function isOpen(status: ListingStatus): boolean {
  return status === "fundraising" || status === "available";
}

/**
 * The headline figure for a card or hero, chosen by listing type.
 * Returns the label and the raw numeric value; formatting is the caller's job
 * so the same helper works for compact (₹2.5 L) and exact (₹2,50,000) output.
 */
export function headlinePrice(property: {
  listingType: ListingType;
  minInvestment: string | null;
  salePrice: string | null;
  monthlyRent: string | null;
}): { label: string; value: number | null; suffix?: string } {
  switch (property.listingType) {
    case "fractional":
      return {
        label: "Min. investment",
        value: property.minInvestment ? Number(property.minInvestment) : null,
      };
    case "sale":
      return {
        label: "Asking price",
        value: property.salePrice ? Number(property.salePrice) : null,
      };
    case "rent":
      return {
        label: "Monthly rent",
        value: property.monthlyRent ? Number(property.monthlyRent) : null,
        suffix: "/mo",
      };
  }
}
