import type { ListingStatus, ListingType, PropertyCategory } from "@/db/schema";
import { FNB_CATEGORIES, RETAIL_CATEGORIES, STATUSES_FOR_LISTING_TYPE } from "@/lib/taxonomy";

/**
 * Which of the ~70 property columns are relevant to which listing.
 *
 * A flat form containing all of them is not merely unpleasant — it produces
 * bad data. Faced with `funding_deadline` on a rent listing, somebody
 * eventually types something into it, and now a shop to let has a fundraising
 * deadline that no page knows how to show and no query knows to ignore.
 *
 * Relevance is a function of `listing_type` and `category`, so it is computed
 * here, once, and used by the form, the validation schema and the create
 * flow alike. One source of truth: a field the form hides but the schema
 * still requires is a save button that fails with no visible reason.
 */

export type PropertyFieldName =
  | "title" | "slug" | "listingType" | "category" | "status"
  | "city" | "location" | "shortLocation" | "propertyType"
  | "description" | "summary"
  | "buildingId" | "unitNumber" | "floorLabel"
  | "areaSqft" | "carpetAreaSqft" | "bedrooms"
  | "totalValuation" | "fundingTarget" | "amountRaised" | "minInvestment"
  | "estAnnualYield" | "projectedAppreciation" | "investmentHorizon"
  | "fundingDeadline" | "investorCount"
  | "platformFeePct" | "managementFeePct" | "exitFeePct"
  | "salePrice" | "pricePerSqft"
  | "monthlyRent" | "securityDeposit" | "leaseTermMonths" | "lockInMonths"
  | "rentEscalationPct" | "camPerSqftMonthly" | "availableFrom"
  | "furnishingStatus"
  | "frontageFt" | "footfallMonthly" | "seatingCapacity"
  | "hasKitchenProvision" | "powerLoadKva"
  | "tenantName" | "leaseEndDate" | "occupancyRate"
  | "possessionStatus" | "maintenanceMonthly" | "reraNumber"
  | "images" | "amenities" | "highlights" | "tags" | "documents"
  | "propertyRisks" | "managedBy" | "yearBuilt"
  | "latitude" | "longitude"
  | "isFeatured" | "isPublished";

const ALWAYS: PropertyFieldName[] = [
  "title", "slug", "listingType", "category", "status",
  "city", "location", "shortLocation", "propertyType",
  "description", "summary",
  "buildingId", "unitNumber", "floorLabel",
  "areaSqft", "carpetAreaSqft",
  "possessionStatus", "maintenanceMonthly", "reraNumber",
  // NOT NULL with defaults ("0"), so every row carries them whatever its
  // type. Treating them as fractional-only would make every sale and rent
  // listing in the database unsaveable.
  "amountRaised", "investorCount",
  "images", "amenities", "highlights", "tags", "documents",
  "propertyRisks", "managedBy", "yearBuilt",
  "latitude", "longitude",
  "isFeatured", "isPublished",
];

/**
 * The economics of a lease that already exists on the asset.
 *
 * Distinct from the rent listing's own terms, which describe what is being
 * offered. A fractional retail block with a nine-year anchor lease has all of
 * these, and hiding them would make the yield unexplainable.
 */
const LEASE_IN_PLACE: PropertyFieldName[] = [
  "monthlyRent",
  "leaseTermMonths",
  "lockInMonths",
  "rentEscalationPct",
  "camPerSqftMonthly",
];

const BY_LISTING_TYPE: Record<ListingType, PropertyFieldName[]> = {
  fractional: [
    "totalValuation", "fundingTarget", "minInvestment",
    "estAnnualYield", "projectedAppreciation", "investmentHorizon",
    "fundingDeadline",
    "platformFeePct", "managementFeePct", "exitFeePct",
    "occupancyRate",
    // The lease already in place. For a tenanted asset this rent *is* the
    // yield being sold, so it is recorded here as well as on rent listings —
    // the seeded anchor blocks and food courts all carry it.
    ...LEASE_IN_PLACE,
  ],
  sale: ["salePrice", "pricePerSqft", ...LEASE_IN_PLACE],
  rent: [
    "monthlyRent", "securityDeposit", "leaseTermMonths", "lockInMonths",
    "rentEscalationPct", "camPerSqftMonthly", "availableFrom",
    "furnishingStatus",
  ],
};

const RESIDENTIAL: PropertyCategory[] = [
  "residential_apartment",
  "villa",
  "holiday_rental",
];

/** Footfall and frontage price a retail unit; they mean nothing for a flat. */
function isFootfallDriven(category: PropertyCategory): boolean {
  return (
    RETAIL_CATEGORIES.includes(category) || FNB_CATEGORIES.includes(category)
  );
}

export function fieldsFor(input: {
  listingType: ListingType;
  category: PropertyCategory;
}): Set<PropertyFieldName> {
  const fields = new Set<PropertyFieldName>([
    ...ALWAYS,
    ...BY_LISTING_TYPE[input.listingType],
  ]);

  if (RESIDENTIAL.includes(input.category)) fields.add("bedrooms");

  if (isFootfallDriven(input.category)) {
    fields.add("frontageFt");
    fields.add("footfallMonthly");
    // Sanctioned load gates what a retail unit can actually run, not just
    // kitchens — the seeded mall shops record it.
    fields.add("powerLoadKva");
  }

  // A kitchen is the gate on whether an F&B unit can trade at all, and it
  // depends on three things that are recorded nowhere else.
  if (FNB_CATEGORIES.includes(input.category)) {
    fields.add("seatingCapacity");
    fields.add("hasKitchenProvision");
  }

  /**
   * Tenant fields, for an asset that already has one.
   *
   * Shown for fractional and sale, where a sitting tenant *is* the
   * investment case, and hidden for rent — on a rent listing the tenant is
   * who we are looking for, not who is already there.
   */
  if (input.listingType !== "rent") {
    fields.add("tenantName");
    fields.add("leaseEndDate");
    fields.add("occupancyRate");
  }

  return fields;
}

/**
 * Statuses selectable for a listing type.
 *
 * `off_market` is appended rather than added to STATUSES_FOR_LISTING_TYPE
 * because that constant also drives the public filter bar, where "Off Market"
 * is not something a visitor should be able to browse for.
 */
export function adminStatusesFor(listingType: ListingType): ListingStatus[] {
  return [...STATUSES_FOR_LISTING_TYPE[listingType], "off_market"];
}

/** The price field that must be filled before a listing may be published. */
export const REQUIRED_PRICE_FIELD: Record<ListingType, PropertyFieldName> = {
  fractional: "fundingTarget",
  sale: "salePrice",
  rent: "monthlyRent",
};

export const FIELD_LABEL: Partial<Record<PropertyFieldName, string>> = {
  title: "Title",
  slug: "URL slug",
  listingType: "Listing type",
  category: "Category",
  status: "Status",
  city: "City",
  location: "Full location",
  shortLocation: "Short location",
  propertyType: "Display label",
  description: "Description",
  summary: "Summary",
  buildingId: "Parent building",
  unitNumber: "Unit number",
  floorLabel: "Floor",
  areaSqft: "Built-up area (sq.ft.)",
  carpetAreaSqft: "Carpet area (sq.ft.)",
  bedrooms: "Bedrooms",
  totalValuation: "Total valuation",
  fundingTarget: "Funding target",
  amountRaised: "Amount raised",
  minInvestment: "Minimum investment",
  estAnnualYield: "Est. annual yield (%)",
  projectedAppreciation: "Projected appreciation (%)",
  investmentHorizon: "Investment horizon",
  fundingDeadline: "Funding deadline",
  investorCount: "Investor count",
  platformFeePct: "Platform fee (%)",
  managementFeePct: "Management fee (%)",
  exitFeePct: "Exit fee (%)",
  salePrice: "Asking price",
  pricePerSqft: "Price per sq.ft.",
  monthlyRent: "Monthly rent",
  securityDeposit: "Security deposit",
  leaseTermMonths: "Lease term (months)",
  lockInMonths: "Lock-in (months)",
  rentEscalationPct: "Rent escalation (%)",
  camPerSqftMonthly: "CAM (₹/sq.ft./month)",
  availableFrom: "Available from",
  furnishingStatus: "Furnishing",
  frontageFt: "Frontage (ft)",
  footfallMonthly: "Monthly footfall",
  seatingCapacity: "Seating capacity",
  hasKitchenProvision: "Kitchen provision",
  powerLoadKva: "Power load (kVA)",
  tenantName: "Tenant",
  leaseEndDate: "Lease ends",
  occupancyRate: "Occupancy (%)",
  possessionStatus: "Possession",
  maintenanceMonthly: "Maintenance (₹/month)",
  reraNumber: "RERA number",
  images: "Images",
  amenities: "Amenities",
  highlights: "Highlights",
  tags: "Tags",
  documents: "Documents",
  propertyRisks: "Property risks",
  managedBy: "Managed by",
  yearBuilt: "Year built",
  latitude: "Latitude",
  longitude: "Longitude",
  isFeatured: "Featured",
  isPublished: "Published",
};

/** Percentages are stored as plain numerics; nothing clamps them but us. */
export const PERCENT_FIELDS: PropertyFieldName[] = [
  "estAnnualYield",
  "projectedAppreciation",
  "platformFeePct",
  "managementFeePct",
  "exitFeePct",
  "occupancyRate",
  "rentEscalationPct",
];

/** Turns a title into a URL slug. The uniqueness check is server-side. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
