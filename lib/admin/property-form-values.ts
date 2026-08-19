import type { ListingType, Property, PropertyCategory } from "@/db/schema";
import { adminStatusesFor } from "@/lib/admin/property-fields";
import type { PropertyFormValues } from "@/lib/validation/admin-property";

/**
 * Database row → form values.
 *
 * Every field becomes a string, because that is what an input holds. null
 * becomes "" on the way in and is turned back into null by the schema on the
 * way out, so "cleared" and "never set" stay the same thing rather than
 * becoming 0 or "null".
 */
const text = (value: string | number | null | undefined): string =>
  value === null || value === undefined ? "" : String(value);

export function propertyToFormValues(property: Property): PropertyFormValues {
  return {
    id: property.id,
    // The concurrency token: sent back on save and compared against the row.
    expectedUpdatedAt: property.updatedAt.toISOString(),

    title: property.title,
    slug: property.slug,
    listingType: property.listingType,
    category: property.category,
    status: property.status,

    city: property.city,
    location: property.location,
    shortLocation: property.shortLocation,
    propertyType: property.propertyType,
    description: property.description,
    summary: text(property.summary),

    buildingId: text(property.buildingId),
    unitNumber: text(property.unitNumber),
    floorLabel: text(property.floorLabel),

    areaSqft: text(property.areaSqft),
    carpetAreaSqft: text(property.carpetAreaSqft),
    bedrooms: text(property.bedrooms),

    totalValuation: text(property.totalValuation),
    fundingTarget: text(property.fundingTarget),
    amountRaised: text(property.amountRaised),
    minInvestment: text(property.minInvestment),
    estAnnualYield: text(property.estAnnualYield),
    projectedAppreciation: text(property.projectedAppreciation),
    investmentHorizon: text(property.investmentHorizon),
    fundingDeadline: text(property.fundingDeadline),
    investorCount: text(property.investorCount),
    platformFeePct: text(property.platformFeePct),
    managementFeePct: text(property.managementFeePct),
    exitFeePct: text(property.exitFeePct),

    salePrice: text(property.salePrice),
    pricePerSqft: text(property.pricePerSqft),

    monthlyRent: text(property.monthlyRent),
    securityDeposit: text(property.securityDeposit),
    leaseTermMonths: text(property.leaseTermMonths),
    lockInMonths: text(property.lockInMonths),
    rentEscalationPct: text(property.rentEscalationPct),
    camPerSqftMonthly: text(property.camPerSqftMonthly),
    availableFrom: text(property.availableFrom),
    furnishingStatus: text(property.furnishingStatus),

    frontageFt: text(property.frontageFt),
    footfallMonthly: text(property.footfallMonthly),
    seatingCapacity: text(property.seatingCapacity),
    hasKitchenProvision: property.hasKitchenProvision,
    powerLoadKva: text(property.powerLoadKva),

    tenantName: text(property.tenantName),
    leaseEndDate: text(property.leaseEndDate),
    occupancyRate: text(property.occupancyRate),

    possessionStatus: property.possessionStatus,
    maintenanceMonthly: text(property.maintenanceMonthly),
    reraNumber: text(property.reraNumber),

    images: property.images,
    amenities: property.amenities,
    highlights: property.highlights,
    tags: property.tags,
    documents: property.documents,
    propertyRisks: property.propertyRisks,

    managedBy: text(property.managedBy),
    yearBuilt: text(property.yearBuilt),
    latitude: text(property.latitude),
    longitude: text(property.longitude),

    isFeatured: property.isFeatured,
    isPublished: property.isPublished,
  };
}

/**
 * A blank listing of the chosen type.
 *
 * The status is the first one valid for that type rather than the column
 * default of "fundraising", which is meaningless on a shop to let.
 */
export function emptyFormValues(input: {
  listingType: ListingType;
  category: PropertyCategory;
}): PropertyFormValues {
  return {
    title: "",
    slug: "",
    listingType: input.listingType,
    category: input.category,
    status: adminStatusesFor(input.listingType)[0],

    city: "",
    location: "",
    shortLocation: "",
    propertyType: "",
    description: "",
    summary: "",

    buildingId: "",
    unitNumber: "",
    floorLabel: "",

    areaSqft: "",
    carpetAreaSqft: "",
    bedrooms: "",

    totalValuation: "",
    fundingTarget: "",
    amountRaised: "0",
    minInvestment: "",
    estAnnualYield: "",
    projectedAppreciation: "",
    investmentHorizon: "",
    fundingDeadline: "",
    investorCount: "0",
    platformFeePct: "",
    managementFeePct: "",
    exitFeePct: "",

    salePrice: "",
    pricePerSqft: "",

    monthlyRent: "",
    securityDeposit: "",
    leaseTermMonths: "",
    lockInMonths: "",
    rentEscalationPct: "",
    camPerSqftMonthly: "",
    availableFrom: "",
    furnishingStatus: "",

    frontageFt: "",
    footfallMonthly: "",
    seatingCapacity: "",
    hasKitchenProvision: null,
    powerLoadKva: "",

    tenantName: "",
    leaseEndDate: "",
    occupancyRate: "",

    possessionStatus: "",
    maintenanceMonthly: "",
    reraNumber: "",

    images: [],
    amenities: [],
    highlights: [],
    tags: [],
    documents: [],
    propertyRisks: [],

    managedBy: "",
    yearBuilt: "",
    latitude: "",
    longitude: "",

    isFeatured: false,
    // A new listing is always a draft. Publishing is a separate, deliberate
    // act with its own completeness rules.
    isPublished: false,
  };
}
