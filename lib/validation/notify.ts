import { z } from "zod";

/**
 * One field. Deliberately.
 *
 * "Notify Me" used to route to /contact — a five-field form with a phone
 * number, an enquiry-type selector and a message box — for what is, from the
 * visitor's side, an email alert. That is an enormous amount of friction for
 * a low-intent action, and it converts accordingly.
 *
 * The `leads` table requires name and phone, so the action fills those with
 * explicit sentinels rather than inventing values: a notify signup is not a
 * lead anyone should try to call, and it must be obvious in the table which
 * rows are which. Filter on `source = 'notify'`.
 */
export const notifyFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  /** Honeypot — must stay empty. */
  company: z.string().max(0, "Submission rejected").optional(),
});

export type NotifyFormValues = z.infer<typeof notifyFormSchema>;
