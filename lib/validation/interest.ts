import { z } from "zod";

export const interestFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email address"),
  amountInterested: z
    .string()
    .trim()
    .min(1, "Enter the amount you're interested in")
    .refine(
      (value) => !Number.isNaN(Number(value)) && Number(value) > 0,
      "Enter a valid amount"
    ),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type InterestFormValues = z.infer<typeof interestFormSchema>;
