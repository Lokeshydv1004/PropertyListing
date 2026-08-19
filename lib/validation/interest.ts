import { z } from "zod";

/** Accepts 10-digit Indian mobiles with or without a country code, and
 *  tolerates the spaces, dashes and brackets people actually type. */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Enter your phone number")
  .transform((value) => value.replace(/[\s()\-.]/g, ""))
  .refine(
    (value) => /^(\+?\d{1,3})?[6-9]\d{9}$/.test(value) || /^\+?\d{8,15}$/.test(value),
    "Enter a valid phone number"
  );

export const interestFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: phoneSchema,
  email: z.string().trim().email("Enter a valid email address"),
  // Optional across all listing types: a required budget field is friction on
  // a rental enquiry, and a blocked submit is a lost lead.
  amountInterested: z
    .string()
    .trim()
    .max(15)
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || (!Number.isNaN(Number(value)) && Number(value) > 0),
      "Enter a valid amount"
    ),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  /** Honeypot — must stay empty. Bots fill every field they find. */
  company: z.string().max(0, "Submission rejected").optional(),
});

export type InterestFormValues = z.infer<typeof interestFormSchema>;
