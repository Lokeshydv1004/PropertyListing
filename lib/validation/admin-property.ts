import { z } from "zod";

import {
  listingTypeEnum,
  listingStatusEnum,
  propertyCategoryEnum,
} from "@/db/schema";
import {
  REQUIRED_PRICE_FIELD,
  adminStatusesFor,
  fieldsFor,
  FIELD_LABEL,
} from "@/lib/admin/property-fields";

/**
 * One schema for the property form and the Server Action behind it.
 *
 * Everything arrives as a string, because that is what an HTML input gives
 * you, and `numeric` columns are read back from postgres-js as strings
 * anyway. Empty string means "not set" and becomes null — not 0. The
 * distinction matters: a fee of 0% is a promise, a fee of null is silence,
 * and the public page renders them differently on purpose.
 */

const listingTypes = listingTypeEnum.enumValues;
const categories = propertyCategoryEnum.enumValues;
const statuses = listingStatusEnum.enumValues;

/** "" → null, so an emptied field clears rather than storing "". */
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable();

/** A number held as text all the way to the numeric column. */
const optionalNumber = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .refine(
    (value) => value === null || (!Number.isNaN(Number(value)) && Number(value) >= 0),
    "Enter a number that isn't negative"
  );

const optionalInteger = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .refine(
    (value) =>
      value === null || (Number.isInteger(Number(value)) && Number(value) >= 0),
    "Enter a whole number"
  );

/** Percentages are stored unbounded; 0–100 is enforced here or nowhere. */
const optionalPercent = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .refine(
    (value) =>
      value === null ||
      (!Number.isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100),
    "Must be between 0 and 100"
  );

const optionalDate = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .refine(
    (value) => value === null || !Number.isNaN(new Date(value).getTime()),
    "Not a valid date"
  );

const stringArray = z.array(z.string().trim().min(1)).max(60);

export const propertyFormSchema = z
  .object({
    /** Absent when creating. */
    id: z.string().uuid().optional(),

    /**
     * The row's `updated_at` as the form was loaded. Sent back on save so the
     * action can refuse to overwrite somebody else's edit made in between.
     */
    expectedUpdatedAt: z.string().optional(),

    title: z.string().trim().min(3, "Give it a title").max(200),
    slug: z
      .string()
      .trim()
      .min(3, "The slug is the public URL — it can't be empty")
      .max(90)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Lowercase letters, numbers and single hyphens only"
      ),

    listingType: z.enum(listingTypes),
    category: z.enum(categories),
    status: z.enum(statuses),

    city: z.string().trim().min(1, "City is required").max(80),
    location: z.string().trim().min(1, "Location is required").max(200),
    shortLocation: z.string().trim().min(1, "Short location is required").max(80),
    propertyType: z.string().trim().min(1, "Display label is required").max(80),

    description: z.string().trim().max(20000),
    summary: optionalText,

    buildingId: z
      .union([z.string().uuid(), z.literal("")])
      .transform((value) => (value === "" ? null : value))
      .nullable(),
    unitNumber: optionalText,
    floorLabel: optionalText,

    areaSqft: z
      .string()
      .trim()
      .min(1, "Area is required")
      .refine((value) => Number(value) > 0, "Area must be greater than zero"),
    carpetAreaSqft: optionalNumber,
    bedrooms: optionalInteger,

    totalValuation: optionalNumber,
    fundingTarget: optionalNumber,
    amountRaised: optionalNumber,
    minInvestment: optionalNumber,
    estAnnualYield: optionalPercent,
    projectedAppreciation: optionalPercent,
    investmentHorizon: optionalText,
    fundingDeadline: optionalDate,
    investorCount: optionalInteger,
    platformFeePct: optionalPercent,
    managementFeePct: optionalPercent,
    exitFeePct: optionalPercent,

    salePrice: optionalNumber,
    pricePerSqft: optionalNumber,

    monthlyRent: optionalNumber,
    securityDeposit: optionalNumber,
    leaseTermMonths: optionalInteger,
    lockInMonths: optionalInteger,
    rentEscalationPct: optionalPercent,
    camPerSqftMonthly: optionalNumber,
    availableFrom: optionalDate,
    furnishingStatus: optionalText,

    frontageFt: optionalNumber,
    footfallMonthly: optionalInteger,
    seatingCapacity: optionalInteger,
    hasKitchenProvision: z.boolean().nullable(),
    powerLoadKva: optionalNumber,

    tenantName: optionalText,
    leaseEndDate: optionalDate,
    occupancyRate: optionalPercent,

    possessionStatus: z.string().trim().min(1, "Possession is required").max(80),
    maintenanceMonthly: optionalNumber,
    reraNumber: optionalText,

    images: stringArray,
    amenities: stringArray,
    highlights: stringArray,
    tags: stringArray,
    documents: stringArray,
    propertyRisks: stringArray,

    managedBy: optionalText,
    yearBuilt: optionalInteger,
    latitude: optionalText,
    longitude: optionalText,

    isFeatured: z.boolean(),
    isPublished: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const problem = (path: keyof typeof values, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    // The status vocabulary is three vocabularies in one enum. "fundraising"
    // on a rent listing is not a typo the database can catch.
    if (!adminStatusesFor(values.listingType).includes(values.status)) {
      problem(
        "status",
        `"${values.status}" isn't a valid status for a ${values.listingType} listing`
      );
    }

    const area = Number(values.areaSqft);
    const carpet = values.carpetAreaSqft ? Number(values.carpetAreaSqft) : null;

    // Carpet area is a subset of built-up area by definition. Inverted, it
    // makes the listing's own efficiency figure nonsense.
    if (carpet !== null && area > 0 && carpet > area) {
      problem("carpetAreaSqft", "Carpet area can't exceed built-up area");
    }

    if (values.listingType === "fractional") {
      const target = values.fundingTarget ? Number(values.fundingTarget) : null;
      const raised = values.amountRaised ? Number(values.amountRaised) : null;
      const min = values.minInvestment ? Number(values.minInvestment) : null;

      if (target !== null && raised !== null && raised > target) {
        problem(
          "amountRaised",
          "Raised is more than the target — raise the target, or mark it fully funded"
        );
      }

      if (target !== null && min !== null && min > target) {
        problem("minInvestment", "Minimum ticket is larger than the whole raise");
      }

      // A fundraise advertising a deadline in the past reads as abandoned.
      if (values.status === "fundraising" && values.fundingDeadline) {
        const deadline = new Date(values.fundingDeadline);
        if (deadline.getTime() < Date.now()) {
          problem(
            "fundingDeadline",
            "This deadline has passed — move it, or change the status"
          );
        }
      }
    }

    // Fields that don't apply to this listing type must not carry values:
    // the form hides them, so anything in them is stale data from a type
    // change and would be invisible to whoever saves next.
    const allowed = fieldsFor({
      listingType: values.listingType,
      category: values.category,
    });

    for (const [key, value] of Object.entries(values)) {
      if (key === "id" || key === "expectedUpdatedAt") continue;
      if (allowed.has(key as never)) continue;
      if (value === null || value === "" || value === false) continue;
      if (Array.isArray(value) && value.length === 0) continue;

      problem(
        key as keyof typeof values,
        `${FIELD_LABEL[key as never] ?? key} doesn't apply to this listing`
      );
    }
  });

export type PropertyFormValues = z.input<typeof propertyFormSchema>;
export type PropertyFormParsed = z.output<typeof propertyFormSchema>;

/**
 * Why this listing can't go live yet.
 *
 * Kept separate from the schema because a draft is allowed to be incomplete —
 * that is the entire point of a draft. These rules only bite at the moment
 * somebody ticks "published", and each returns a message naming the field so
 * "cannot publish" is never the whole explanation.
 */
export function publishBlockers(values: {
  listingType: (typeof listingTypes)[number];
  images: string[];
  description: string;
  slug: string;
  [key: string]: unknown;
}): string[] {
  const blockers: string[] = [];

  if (values.images.length === 0) {
    blockers.push("Add at least one image — the first one is the cover.");
  }

  if (!values.description || values.description.trim().length < 40) {
    blockers.push("Write a description of at least 40 characters.");
  }

  if (!values.slug) {
    blockers.push("Set a URL slug.");
  }

  const priceField = REQUIRED_PRICE_FIELD[values.listingType];
  if (!values[priceField]) {
    blockers.push(
      `Set the ${FIELD_LABEL[priceField]?.toLowerCase() ?? priceField} — a listing with no price can't go live.`
    );
  }

  return blockers;
}

/** The inline edits the properties table makes without opening the form. */
export const propertyQuickEditSchema = z.object({
  id: z.string().uuid(),
  amountRaised: z.string().trim().optional(),
  investorCount: z.string().trim().optional(),
  status: z.enum(statuses).optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export type PropertyQuickEditValues = z.infer<typeof propertyQuickEditSchema>;
