import { z } from "zod";
import { phoneSchema } from "./interest";

export const ENQUIRY_TYPES = [
  { value: "investor", label: "I want to invest" },
  {
    value: "managed_plan",
    label: "I can't choose a property — tell me about the managed portfolio",
  },
  { value: "buy", label: "I want to buy a property" },
  { value: "rent", label: "I want to lease a space" },
  { value: "list_property", label: "I want to list my property" },
  { value: "partnership", label: "Partnership or press" },
  { value: "other", label: "Something else" },
] as const;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: phoneSchema,
  email: z.string().trim().email("Enter a valid email address"),
  // Routes the lead to the right person and tells us where demand is coming
  // from — previously every enquiry arrived as an undifferentiated row.
  // No .default() here: it would make the *input* type optional and desync
  // react-hook-form's resolver generics. The form supplies the default.
  enquiryType: z.enum(
    ENQUIRY_TYPES.map((type) => type.value) as [string, ...string[]]
  ),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  /** Honeypot — must stay empty. */
  company: z.string().max(0, "Submission rejected").optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
