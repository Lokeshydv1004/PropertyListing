import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";

import { TeamManager } from "@/components/admin/team-manager";
import { db } from "@/db/client";
import { adminUsers } from "@/db/schema";
import { requireAdminPage } from "@/lib/auth/admin";
import { storageConfigured } from "@/lib/supabase/storage";
import { withDbRetry } from "@/lib/with-db-retry";

export const metadata: Metadata = { title: "Settings" };

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const admin = await requireAdminPage();

  // The nav hides this from staff, but a nav is not a permission — the page
  // has to check for itself, and so does every action behind it.
  if (admin.role !== "owner") redirect("/admin");

  const members = await withDbRetry(() =>
    db.select().from(adminUsers).orderBy(asc(adminUsers.name))
  );

  const webhookConfigured = Boolean(process.env.LEAD_WEBHOOK_URL);
  const analyticsConfigured = Boolean(process.env.NEXT_PUBLIC_GA_ID);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-navy">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Owner only. Everything here changes what other people can do.
        </p>
      </div>

      <TeamManager
        currentUserId={admin.id}
        members={members.map((member) => ({
          id: member.id,
          email: member.email,
          name: member.name,
          role: member.role,
          isActive: member.isActive,
          lastSeenAt: member.lastSeenAt?.toISOString() ?? null,
        }))}
      />

      {/*
        Read-only on purpose. These live in environment variables, which are
        the deployment's business — writing them from a web form would mean
        either a restart to take effect or a second source of truth that
        disagrees with the first.
      */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-medium text-navy">Environment</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Set in .env.local and in the Netlify dashboard. Shown here so you can
          see what is switched on without reading a config file.
        </p>

        <dl className="mt-3 space-y-2 text-sm">
          <Row
            label="Lead notifications"
            on={webhookConfigured}
            onText="Webhook configured — new leads are posted to it"
            offText="No webhook — leads are saved but nothing is announced"
          />
          <Row
            label="File uploads"
            on={storageConfigured()}
            onText="Supabase Storage ready"
            offText="Add SUPABASE_SECRET_KEY and run npm run storage:init"
          />
          <Row
            label="Analytics"
            on={analyticsConfigured}
            onText="Google Analytics enabled"
            offText="No analytics script is loaded"
          />
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-medium text-navy">Featured listings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The home page shows three, ordered by least-funded first so traffic
          goes where it is needed. Flagging more than three is allowed — the
          extras simply never appear, and the properties list warns you when
          that happens.
        </p>
      </section>
    </div>
  );
}

function Row({
  label,
  on,
  onText,
  offText,
}: {
  label: string;
  on: boolean;
  onText: string;
  offText: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3">
      <dt className="w-40 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-1.5">
        {/* Text, not colour alone. */}
        <span
          className={
            on
              ? "rounded bg-brand-green-light px-1.5 py-0.5 text-xs font-medium text-brand-green"
              : "rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
          }
        >
          {on ? "On" : "Off"}
        </span>
        <span className="text-navy">{on ? onText : offText}</span>
      </dd>
    </div>
  );
}
