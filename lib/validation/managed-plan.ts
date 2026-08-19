import { z } from "zod";
import { phoneSchema } from "./interest";

/**
 * The "I don't know which property to pick" path.
 *
 * Every route into the product so far required the visitor to have already
 * chosen an asset. Someone who likes the idea but cannot choose between a
 * Kurla office and a Whitefield warehouse had nowhere to go except away.
 * This form starts a conversation about the managed portfolio instead — one
 * commitment spread across the properties GharShare has underwritten.
 *
 * Note on wording, which is load-bearing rather than stylistic: nothing here
 * (or on the page that renders it) may promise a guaranteed or assured
 * return. Soliciting money from the public against a promised return is
 * deposit-taking under the Companies Act 2013 and the BUDS Act 2019, and the
 * rest of this site is careful to say "targeted, not guaranteed" everywhere.
 * This form collects an expression of interest. It takes no money and it
 * makes no promise.
 */

export const PLAN_AMOUNT_BANDS = [
  { value: "under_5l", label: "Under ₹5 lakh" },
  { value: "5l_25l", label: "₹5 lakh – ₹25 lakh" },
  { value: "25l_1cr", label: "₹25 lakh – ₹1 crore" },
  { value: "above_1cr", label: "Above ₹1 crore" },
  { value: "undecided", label: "Not decided yet" },
] as const;

export const PLAN_HORIZONS = [
  { value: "under_2y", label: "Under 2 years" },
  { value: "2_4y", label: "2 – 4 years" },
  { value: "4_plus", label: "4 years or more" },
  { value: "unsure", label: "Not sure — advise me" },
] as const;

export const PLAN_PRIORITIES = [
  { value: "income", label: "Steady income, above all" },
  { value: "balanced", label: "A balance of income and growth" },
  { value: "growth", label: "Growth, and I can wait for it" },
  { value: "unsure", label: "Not sure — advise me" },
] as const;

export const managedPlanFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: phoneSchema,
  email: z.string().trim().email("Enter a valid email address"),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  // Plain enums without .default(), for the same resolver-generics reason
  // documented in list-property.ts — the form supplies the defaults.
  amountBand: z.enum(
    PLAN_AMOUNT_BANDS.map((band) => band.value) as [string, ...string[]]
  ),
  horizon: z.enum(
    PLAN_HORIZONS.map((horizon) => horizon.value) as [string, ...string[]]
  ),
  priority: z.enum(
    PLAN_PRIORITIES.map((priority) => priority.value) as [string, ...string[]]
  ),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  /** Honeypot — must stay empty. */
  company: z.string().max(0, "Submission rejected").optional(),
});

export type ManagedPlanFormValues = z.infer<typeof managedPlanFormSchema>;
