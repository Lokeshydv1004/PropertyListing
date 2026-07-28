import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email address"),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
