"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db/client";
import { adminUsers } from "@/db/schema";
import { logActivity } from "@/lib/admin/activity";
import { requireOwner } from "@/lib/auth/admin";
import { withDbRetry } from "@/lib/with-db-retry";

export type TeamActionResult =
  | { success: true }
  | { success: false; error: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  name: z.string().trim().min(2, "Enter their name").max(100),
  role: z.enum(["owner", "staff"]),
});

const toggleSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

const roleSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["owner", "staff"]),
});

/**
 * Adds an address to the allowlist.
 *
 * No email is sent and no account is created here — the person signs in at
 * /admin/login themselves, which is what creates their Supabase auth user.
 * This row is only the permission to do so.
 */
export async function inviteAdmin(input: unknown): Promise<TeamActionResult> {
  const guard = await requireOwner();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid details.",
    };
  }

  const { email, name, role } = parsed.data;

  try {
    const [existing] = await withDbRetry(() =>
      db
        .select({ id: adminUsers.id, isActive: adminUsers.isActive })
        .from(adminUsers)
        .where(eq(adminUsers.email, email))
        .limit(1)
    );

    if (existing) {
      // Re-inviting somebody who was deactivated is the natural way to
      // restore them, and much less surprising than an error.
      if (!existing.isActive) {
        await withDbRetry(() =>
          db
            .update(adminUsers)
            .set({ isActive: true, name, role })
            .where(eq(adminUsers.id, existing.id))
        );

        await logActivity({
          actor: guard.user,
          action: "update",
          entityType: "admin_user",
          entityId: existing.id,
          entityLabel: email,
          changedFields: { isActive: { from: false, to: true } },
        });

        revalidatePath("/admin/settings");
        return { success: true };
      }

      return { success: false, error: "That address already has access." };
    }

    const [created] = await withDbRetry(() =>
      db
        .insert(adminUsers)
        .values({ email, name, role })
        .returning({ id: adminUsers.id })
    );

    await logActivity({
      actor: guard.user,
      action: "create",
      entityType: "admin_user",
      entityId: created.id,
      entityLabel: `${name} <${email}>`,
      changedFields: { role: { from: null, to: role } },
    });
  } catch {
    // console.error("[admin] invite failed", error);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/settings");
  return { success: true };
}

/**
 * Revokes or restores access.
 *
 * Deactivating rather than deleting: the audit log references actors by id,
 * and a deleted row turns every historical entry into "someone changed this".
 * `getAdminUser()` re-checks `is_active` on every request, so this takes
 * effect on their next page load rather than whenever their session expires.
 */
export async function setAdminActive(input: unknown): Promise<TeamActionResult> {
  const guard = await requireOwner();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid request." };

  const { id, isActive } = parsed.data;

  // Locking yourself out of the console you administer is a support call
  // nobody can answer without database access.
  if (id === guard.user.id && !isActive) {
    return { success: false, error: "You can't deactivate your own account." };
  }

  try {
    const [existing] = await withDbRetry(() =>
      db
        .select({ email: adminUsers.email, name: adminUsers.name })
        .from(adminUsers)
        .where(eq(adminUsers.id, id))
        .limit(1)
    );

    if (!existing) return { success: false, error: "No such account." };

    await withDbRetry(() =>
      db.update(adminUsers).set({ isActive }).where(eq(adminUsers.id, id))
    );

    await logActivity({
      actor: guard.user,
      action: "update",
      entityType: "admin_user",
      entityId: id,
      entityLabel: existing.name,
      changedFields: { isActive: { from: !isActive, to: isActive } },
    });
  } catch {
    // console.error("[admin] set active failed", error);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function setAdminRole(input: unknown): Promise<TeamActionResult> {
  const guard = await requireOwner();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid role." };

  const { id, role } = parsed.data;

  try {
    const [existing] = await withDbRetry(() =>
      db
        .select({ name: adminUsers.name, role: adminUsers.role })
        .from(adminUsers)
        .where(eq(adminUsers.id, id))
        .limit(1)
    );

    if (!existing) return { success: false, error: "No such account." };
    if (existing.role === role) return { success: true };

    // Demoting the last owner leaves nobody who can manage the team or
    // promote anyone back.
    if (existing.role === "owner" && role === "staff") {
      const owners = await withDbRetry(() =>
        db
          .select({ id: adminUsers.id })
          .from(adminUsers)
          .where(eq(adminUsers.role, "owner"))
      );

      const activeOwners = owners.length;
      if (activeOwners <= 1) {
        return {
          success: false,
          error: "There has to be at least one owner. Promote someone first.",
        };
      }
    }

    await withDbRetry(() =>
      db.update(adminUsers).set({ role }).where(eq(adminUsers.id, id))
    );

    await logActivity({
      actor: guard.user,
      action: "update",
      entityType: "admin_user",
      entityId: id,
      entityLabel: existing.name,
      changedFields: { role: { from: existing.role, to: role } },
    });
  } catch {
    // console.error("[admin] set role failed", error);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/settings");
  return { success: true };
}
