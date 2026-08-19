"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  inviteAdmin,
  setAdminActive,
  setAdminRole,
} from "@/lib/actions/admin-team";

export type TeamMemberRow = {
  id: string;
  email: string;
  name: string;
  role: "owner" | "staff";
  isActive: boolean;
  lastSeenAt: string | null;
};

export function TeamManager({
  members,
  currentUserId,
}: {
  members: TeamMemberRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", name: "", role: "staff" });

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card">
        <h2 className="border-b border-border px-4 py-3 font-medium text-navy">
          Who has access
        </h2>

        <ul className="divide-y divide-border">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-navy">
                  {member.name}
                  {member.id === currentUserId && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      (you)
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email}
                  {member.lastSeenAt
                    ? ` · last seen ${new Date(member.lastSeenAt).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" })}`
                    : " · never signed in"}
                </p>
              </div>

              <select
                value={member.role}
                disabled={pending}
                onChange={(event) =>
                  run(() =>
                    setAdminRole({
                      id: member.id,
                      role: event.target.value as "owner" | "staff",
                    })
                  )
                }
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-navy"
                aria-label={`Role for ${member.name}`}
              >
                <option value="staff">Staff</option>
                <option value="owner">Owner</option>
              </select>

              <div className="flex items-center gap-2">
                <Switch
                  checked={member.isActive}
                  // Deactivating yourself is refused server-side too; the
                  // disabled control just avoids offering it.
                  disabled={pending || member.id === currentUserId}
                  onCheckedChange={(checked) =>
                    run(() =>
                      setAdminActive({ id: member.id, isActive: checked })
                    )
                  }
                  aria-label={`Access for ${member.name}`}
                />
                <span className="text-xs text-muted-foreground">
                  {member.isActive ? "Active" : "Revoked"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-medium text-navy">Add someone</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          No email is sent. They sign in themselves at /admin/login — this only
          makes their address one the system will send a link to.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="invite-name">Name</Label>
            <Input
              id="invite-name"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              value={form.role}
              onChange={(event) =>
                setForm({ ...form, role: event.target.value })
              }
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-navy"
            >
              <option value="staff">Staff — everything except the team</option>
              <option value="owner">Owner — can also manage access</option>
            </select>
          </div>
        </div>

        <Button
          className="mt-3 bg-brand-green text-white hover:bg-brand-green/90"
          disabled={pending || !form.email || !form.name}
          onClick={() =>
            run(async () => {
              const result = await inviteAdmin(form);
              if (result.success) setForm({ email: "", name: "", role: "staff" });
              return result;
            })
          }
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <UserPlus className="size-4" aria-hidden="true" />
          )}
          Give access
        </Button>

        {error && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
