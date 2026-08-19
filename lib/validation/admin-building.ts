import { z } from "zod";

import { buildingTypeEnum } from "@/db/schema";

/**
 * Buildings are a much smaller form than properties: sixteen fields, none of
 * them conditional, because a mall and an office park record the same facts.
 */

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable();

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

export const buildingFormSchema = z.object({
  id: z.string().uuid().optional(),

  name: z.string().trim().min(2, "Give it a name").max(150),
  slug: z
    .string()
    .trim()
    .min(2, "The slug identifies this building")
    .max(90)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Lowercase letters, numbers and single hyphens only"
    ),

  buildingType: z.enum(buildingTypeEnum.enumValues),

  location: z.string().trim().min(1, "Location is required").max(200),
  shortLocation: z.string().trim().min(1, "Short location is required").max(80),
  city: z.string().trim().min(1, "City is required").max(80),

  description: z.string().trim().max(5000),

  images: z.array(z.string().trim().min(1)).max(40),
  amenities: z.array(z.string().trim().min(1)).max(60),
  anchorTenants: z.array(z.string().trim().min(1)).max(60),

  totalUnits: optionalInteger,
  footfallMonthly: optionalInteger,
  yearBuilt: optionalInteger,

  reraNumber: optionalText,
  latitude: optionalText,
  longitude: optionalText,
});

export type BuildingFormValues = z.input<typeof buildingFormSchema>;
