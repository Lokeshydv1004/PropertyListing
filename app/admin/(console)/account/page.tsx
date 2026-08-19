import type { Metadata } from "next";

import { PasswordForm } from "@/components/admin/password-form";
import { requireAdminPage } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Your account" };

export const dynamic = "force-dynamic";

/**
 * Deliberately not part of Settings.
 *
 * Settings is owner-only, because everything in it changes what *other*
 * people can do. Your own password is not that — every admin needs to be
 * able to set one, including staff, so it lives on its own page.
 */
export default async function AccountPage() {
  const admin = await requireAdminPage();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-navy">
          Your account
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {admin.name} · {admin.email} · {admin.role}
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-medium text-navy">Password</h2>
        <p className="mt-0.5 mb-4 text-sm text-muted-foreground">
          Optional. You can always sign in with an emailed link instead — which
          is also what to use if you forget this, since there is no separate
          reset flow to go wrong.
        </p>

        <PasswordForm />
      </section>
    </div>
  );
}
