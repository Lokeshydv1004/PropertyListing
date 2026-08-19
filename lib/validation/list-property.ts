import { z } from "zod";
import { phoneSchema } from "./interest";

/**
 * The owner/developer side of the marketplace.
 *
 * The product is a two-sided marketplace where agents and owners list
 * property, but there was no page for them anywhere on the site — every
 * listing had to originate in an offline conversation, which is not a
 * pipeline, it is a bottleneck.
 *
 * Deliberately short. This form's job is to start a conversation with someone
 * who owns a building, not to collect a full asset pack; anything more is
 * asked on the call.
 */

export const PROPERTY_KINDS = [
  { value: "office", label: "Office / IT space" },
  { value: "retail", label: "Retail / mall unit" },
  { value: "warehouse", label: "Warehouse / industrial" },
  { value: "residential", label: "Residential" },
  { value: "land", label: "Land / plot" },
  { value: "other", label: "Something else" },
] as const;

export const OCCUPANCY_STATUSES = [
  { value: "leased", label: "Leased and generating rent" },
  { value: "partially_leased", label: "Partially leased" },
  { value: "vacant", label: "Vacant" },
  { value: "under_construction", label: "Under construction" },
] as const;

export const LISTING_GOALS = [
  { value: "fractional", label: "Raise capital from fractional investors" },
  { value: "sale", label: "Sell outright" },
  { value: "rent", label: "Find a tenant" },
  { value: "unsure", label: "Not sure yet — advise me" },
] as const;

export const listPropertyFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: phoneSchema,
  email: z.string().trim().email("Enter a valid email address"),
  city: z.string().trim().min(2, "Which city is the property in?").max(80),
  // Plain string enums rather than z.enum with .default(): a default makes the
  // *input* type optional and desyncs react-hook-form's resolver generics.
  // The form supplies the defaults, exactly as the contact form does.
  propertyKind: z.enum(
    PROPERTY_KINDS.map((kind) => kind.value) as [string, ...string[]]
  ),
  occupancy: z.enum(
    OCCUPANCY_STATUSES.map((status) => status.value) as [string, ...string[]]
  ),
  goal: z.enum(
    LISTING_GOALS.map((goal) => goal.value) as [string, ...string[]]
  ),
  /** Free text, not a number: owners answer this in ranges and in words. */
  valuation: z.string().trim().max(60).optional().or(z.literal("")),
  monthlyRent: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  /** Honeypot — must stay empty. */
  company: z.string().max(0, "Submission rejected").optional(),
});

export type ListPropertyFormValues = z.infer<typeof listPropertyFormSchema>;
