import { z } from "zod";

/**
 * The magic-link form: one field, checked against the allowlist before
 * anything is sent.
 */
export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter the email address you were given access with"),
  /**
   * Where to land after the link is followed. Same-origin paths only —
   * see `safeNextPath`, an open redirect through an auth callback is a
   * genuinely dangerous thing to leave lying around.
   */
  next: z.string().optional(),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;

/**
 * Accepts only a path on this site, and only one inside the console.
 *
 * `?next=https://evil.example` on a link that arrives by email, from an
 * address the recipient trusts, is about as good as phishing gets. Anything
 * that isn't a plain `/admin/...` path is discarded in favour of the
 * dashboard.
 */
export function safeNextPath(value: string | null | undefined): string {
  if (!value) return "/admin";

  // Protocol-relative ("//evil.example") and absolute URLs both leave the
  // site; backslashes are treated as slashes by some browsers.
  if (!value.startsWith("/admin") || value.startsWith("//")) return "/admin";
  if (value.includes("\\")) return "/admin";

  return value;
}

/**
 * Password sign-in, alongside the magic link rather than instead of it.
 *
 * A link costs an inbox round trip every single time, which is tiresome for
 * someone opening the console five times a day. A password is faster; the
 * link stays as the way in when the password is forgotten, which is why
 * there is no separate reset flow to build or maintain.
 */
export const adminPasswordLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter the email address you were given access with"),
  password: z.string().min(1, "Enter your password"),
  next: z.string().optional(),
});

export type AdminPasswordLoginValues = z.infer<typeof adminPasswordLoginSchema>;

/**
 * Setting a password, from inside the console.
 *
 * Ten characters rather than Supabase's default of six. This password opens
 * a console holding every lead's name, phone number and email — six
 * characters is a few hours of offline guessing. Length is the requirement
 * that actually helps; character-class rules mostly produce "Password1!".
 *
 * Enable Leaked Password Protection in the Supabase dashboard alongside this:
 * it rejects passwords found in known breaches, which is the one check that
 * catches reuse from somewhere already compromised.
 */
export const adminSetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Use at least 10 characters")
      .max(200, "That is longer than it needs to be"),
    confirm: z.string(),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Those two don't match",
  });

export type AdminSetPasswordValues = z.infer<typeof adminSetPasswordSchema>;
