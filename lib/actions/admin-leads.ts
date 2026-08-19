"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/client";
import { adminActivity, adminUsers, leadNotes, leads } from "@/db/schema";
import { logActivity } from "@/lib/admin/activity";
import { requireAdmin, requireOwner } from "@/lib/auth/admin";
import { withDbRetry } from "@/lib/with-db-retry";
import {
  leadAssignSchema,
  leadDeleteSchema,
  leadNoteSchema,
  leadStatusSchema,
} from "@/lib/validation/admin-leads";

export type AdminActionResult =
  | { success: true }
  | { success: false; error: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";
const NOT_FOUND = "That lead no longer exists.";

/**
 * Every export in this file is a public HTTP endpoint with a guessable id.
 * The console's pages are guarded; these are not, until each one guards
 * itself. That is what the `requireAdmin()` on the first line of each is
 * doing — it is not ceremony.
 */

function revalidateLeads(id?: string) {
  revalidatePath("/admin/leads");
  if (id) revalidatePath(`/admin/leads/${id}`);
  // The overview's "unworked leads" tile and the nav badge both read counts.
  revalidatePath("/admin", "layout");
}

export async function updateLeadStatus(
  input: unknown
): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = leadStatusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid status." };

  const { id, status } = parsed.data;

  try {
    const [existing] = await withDbRetry(() =>
      db
        .select({
          status: leads.status,
          name: leads.name,
          contactedAt: leads.contactedAt,
        })
        .from(leads)
        .where(and(eq(leads.id, id), isNull(leads.deletedAt)))
        .limit(1)
    );

    if (!existing) return { success: false, error: NOT_FOUND };
    if (existing.status === status) return { success: true };

    await withDbRetry(() =>
      db
        .update(leads)
        .set({
          status,
          // Stamped once, on the first move to contacted. Re-opening a lead
          // and contacting it again must not rewrite when first contact
          // actually happened — that timestamp is the response-time record.
          contactedAt:
            status === "contacted" && !existing.contactedAt
              ? new Date()
              : existing.contactedAt,
        })
        .where(eq(leads.id, id))
    );

    await logActivity({
      actor: guard.user,
      action: "lead_status",
      entityType: "lead",
      entityId: id,
      entityLabel: existing.name,
      changedFields: { status: { from: existing.status, to: status } },
    });
  } catch {
    // console.error("[admin] failed to update lead status", error);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidateLeads(id);
  return { success: true };
}

export async function addLeadNote(input: unknown): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = leadNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid note.",
    };
  }

  const { id, body } = parsed.data;

  try {
    const [existing] = await withDbRetry(() =>
      db
        .select({ name: leads.name })
        .from(leads)
        .where(and(eq(leads.id, id), isNull(leads.deletedAt)))
        .limit(1)
    );

    if (!existing) return { success: false, error: NOT_FOUND };

    await withDbRetry(() =>
      db.insert(leadNotes).values({
        leadId: id,
        authorId: guard.user.id,
        authorName: guard.user.name,
        body,
      })
    );

    await logActivity({
      actor: guard.user,
      action: "lead_note",
      entityType: "lead",
      entityId: id,
      entityLabel: existing.name,
    });
  } catch {
    // console.error("[admin] failed to add lead note", error);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidateLeads(id);
  return { success: true };
}

export async function assignLead(input: unknown): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = leadAssignSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid assignee." };

  const { id, assignedTo } = parsed.data;
  const nextAssignee = assignedTo || null;

  try {
    const [existing] = await withDbRetry(() =>
      db
        .select({ name: leads.name, assignedTo: leads.assignedTo })
        .from(leads)
        .where(and(eq(leads.id, id), isNull(leads.deletedAt)))
        .limit(1)
    );

    if (!existing) return { success: false, error: NOT_FOUND };

    // Assigning to someone who has been deactivated would silently hide the
    // lead from the only person expected to work it.
    if (nextAssignee) {
      const [assignee] = await withDbRetry(() =>
        db
          .select({ id: adminUsers.id })
          .from(adminUsers)
          .where(and(eq(adminUsers.id, nextAssignee), eq(adminUsers.isActive, true)))
          .limit(1)
      );

      if (!assignee) {
        return { success: false, error: "That person no longer has access." };
      }
    }

    await withDbRetry(() =>
      db.update(leads).set({ assignedTo: nextAssignee }).where(eq(leads.id, id))
    );

    await logActivity({
      actor: guard.user,
      action: "update",
      entityType: "lead",
      entityId: id,
      entityLabel: existing.name,
      changedFields: {
        assignedTo: { from: existing.assignedTo, to: nextAssignee },
      },
    });
  } catch {
    // console.error("[admin] failed to assign lead", error);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidateLeads(id);
  return { success: true };
}

/**
 * Permanent delete, owner only.
 *
 * A removal here is an erasure, not a hide. The lead row goes (taking its
 * notes with it via the cascade), and every audit entry that ever named this
 * person is purged first — status changes and notes recorded the name too,
 * so deleting only the row would leave "Tanushree" scattered through the
 * activity feed forever.
 *
 * What survives is one line: an owner removed a lead, at this time. That is
 * the fact worth auditing. Who it was is exactly the part being erased, so
 * the entry carries no id and no name — nothing to join back to.
 *
 * This is not recoverable, deliberately. The console holds names, phone
 * numbers and messages; "removed" has to mean removed, or the feed goes on
 * repeating a name someone asked us to forget.
 */
export async function deleteLead(input: unknown): Promise<AdminActionResult> {
  const guard = await requireOwner();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = leadDeleteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid lead." };

  const { id } = parsed.data;

  try {
    // No `deleted_at` filter: rows soft-deleted by the previous behaviour
    // are still sitting in the table with their PII intact, and this action
    // is how they finally leave.
    const [existing] = await withDbRetry(() =>
      db.select({ id: leads.id }).from(leads).where(eq(leads.id, id)).limit(1)
    );

    if (!existing) return { success: false, error: NOT_FOUND };

    // Order matters. Purge the history that names them first, then the row,
    // then log — logging before the purge would delete the entry it just
    // wrote.
    await withDbRetry(() =>
      db
        .delete(adminActivity)
        .where(
          and(
            eq(adminActivity.entityType, "lead"),
            eq(adminActivity.entityId, id)
          )
        )
    );

    // `lead_notes.lead_id` is ON DELETE CASCADE, so the follow-up notes —
    // which quote the conversation — go with it.
    await withDbRetry(() => db.delete(leads).where(eq(leads.id, id)));

    await logActivity({
      actor: guard.user,
      action: "delete",
      entityType: "lead",
      entityId: null,
      entityLabel: null,
    });
  } catch {
    // console.error("[admin] failed to delete lead", error);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidateLeads(id);
  return { success: true };
}
