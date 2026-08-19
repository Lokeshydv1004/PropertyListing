import { z } from "zod";

/**
 * One field, and it is checked against the allowlist before anything is sent.
 *
 * There is no password to validate because there is no password: the console
 * signs in with an emailed magic link, so the only thing the form collects is
 * where to send it.
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
