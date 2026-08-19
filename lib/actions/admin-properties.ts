"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/client";
import { buildings, properties, type NewProperty } from "@/db/schema";
import { diffFields, logActivity } from "@/lib/admin/activity";
import { revalidateProperty } from "@/lib/admin/revalidate";
import { slugify } from "@/lib/admin/property-fields";
import { requireAdmin } from "@/lib/auth/admin";
import { isSlugAvailable } from "@/lib/queries/admin-properties";
import { withDbRetry } from "@/lib/with-db-retry";
import {
  propertyFormSchema,
  propertyQuickEditSchema,
  publishBlockers,
} from "@/lib/validation/admin-property";

export type PropertyActionResult =
  | { success: true; id: string; slug: string }
  | { success: false; error: string; blockers?: string[] };

export type SimpleResult =
  | { success: true }
  | { success: false; error: string; blockers?: string[] };

const GENERIC_ERROR = "Something went wrong. Please try again.";
const NOT_FOUND = "That listing no longer exists.";
const CONFLICT =
  "Someone else saved this listing while you were editing. Reload to see their changes — your text is still in the form.";

/** Loaded once per mutation so revalidation can clear the building page too. */
async function buildingSlugFor(buildingId: string | null): Promise<string | null> {
  if (!buildingId) return null;

  const [row] = await withDbRetry(() =>
    db
      .select({ slug: buildings.slug })
      .from(buildings)
      .where(eq(buildings.id, buildingId))
      .limit(1)
  );

  return row?.slug ?? null;
}

/**
 * The inline edits from the properties table.
 *
 * Kept separate from the full form on purpose: updating `amount_raised` is by
 * a wide margin the most frequent edit anyone makes here, and routing it
 * through a forty-field form is the difference between the funding bars being
 * current and being three weeks stale.
 */
export async function quickUpdateProperty(
  input: unknown
): Promise<SimpleResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = propertyQuickEditSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid edit." };

  const { id, ...changes } = parsed.data;

  try {
    const [existing] = await withDbRetry(() =>
      db.select().from(properties).where(eq(properties.id, id)).limit(1)
    );

    if (!existing) return { success: false, error: NOT_FOUND };

    const update: Partial<NewProperty> = {};

    if (changes.amountRaised !== undefined) {
      const value = changes.amountRaised.trim();
      const amount = Number(value);

      if (value === "" || Number.isNaN(amount) || amount < 0) {
        return { success: false, error: "Enter an amount of zero or more." };
      }

      const target = existing.fundingTarget ? Number(existing.fundingTarget) : null;
      if (target !== null && amount > target) {
        return {
          success: false,
          error: "That's more than the funding target. Raise the target first.",
        };
      }

      update.amountRaised = value;
    }

    if (changes.investorCount !== undefined) {
      const count = Number(changes.investorCount);
      if (!Number.isInteger(count) || count < 0) {
        return { success: false, error: "Investors must be a whole number." };
      }
      update.investorCount = count;
    }

    if (changes.status !== undefined) update.status = changes.status;
    if (changes.isFeatured !== undefined) update.isFeatured = changes.isFeatured;

    if (changes.isPublished !== undefined) {
      // Publishing from the table skips the form, so the same completeness
      // rules have to be enforced here — otherwise the quick toggle is a
      // hole straight through them.
      if (changes.isPublished) {
        const blockers = publishBlockers({
          listingType: existing.listingType,
          images: existing.images,
          description: existing.description,
          slug: existing.slug,
          fundingTarget: existing.fundingTarget,
          salePrice: existing.salePrice,
          monthlyRent: existing.monthlyRent,
        });

        if (blockers.length > 0) {
          return {
            success: false,
            error: "This listing isn't ready to publish.",
            blockers,
          };
        }

        if (!existing.publishedAt) update.publishedAt = new Date();
      }

      update.isPublished = changes.isPublished;
    }

    if (Object.keys(update).length === 0) return { success: true };

    await withDbRetry(() =>
      db.update(properties).set(update).where(eq(properties.id, id))
    );

    await logActivity({
      actor: guard.user,
      action:
        changes.isPublished === true
          ? "publish"
          : changes.isPublished === false
            ? "unpublish"
            : "update",
      entityType: "property",
      entityId: id,
      entityLabel: existing.title,
      changedFields: diffFields(existing as Record<string, unknown>, update),
    });

    revalidateProperty(existing.slug, {
      buildingSlug: await buildingSlugFor(existing.buildingId),
      affectsHome:
        changes.isFeatured !== undefined ||
        changes.status !== undefined ||
        changes.isPublished !== undefined ||
        changes.amountRaised !== undefined,
      affectsSitemap: changes.isPublished !== undefined,
    });
  } catch {
    // console.error("[admin] quick update failed", error);
    return { success: false, error: GENERIC_ERROR };
  }

  return { success: true };
}

/**
 * Integer columns, which the form necessarily sends as text.
 *
 * `numeric` columns are strings on both sides so they pass through untouched,
 * but `integer` ones are numbers in the database and Drizzle will not coerce
 * — a string reaching one is a runtime error at insert time, not a type error
 * anywhere useful.
 */
const INTEGER_FIELDS = [
  "bedrooms",
  "investorCount",
  "leaseTermMonths",
  "lockInMonths",
  "footfallMonthly",
  "seatingCapacity",
  "yearBuilt",
] as const;

/** Shapes validated form output into a database row. */
function toRow(values: Awaited<ReturnType<typeof parseForm>>): Partial<NewProperty> {
  const { id: _id, expectedUpdatedAt: _expected, ...rest } = values;

  const row: Record<string, unknown> = { ...rest };

  for (const field of INTEGER_FIELDS) {
    const value = row[field];
    row[field] = value === null || value === "" ? null : Number(value);
  }

  // investor_count is NOT NULL with a default of 0; an emptied field means
  // "none recorded", which is zero, not a constraint violation.
  if (row.investorCount === null) row.investorCount = 0;

  return row as Partial<NewProperty>;
}

async function parseForm(input: unknown) {
  const parsed = propertyFormSchema.safeParse(input);

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new Error(
      first ? `${first.path.join(".")}: ${first.message}` : "Invalid listing."
    );
  }

  return parsed.data;
}

export async function createProperty(
  input: unknown
): Promise<PropertyActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  let values: Awaited<ReturnType<typeof parseForm>>;
  try {
    values = await parseForm(input);
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }

  if (values.isPublished) {
    const blockers = publishBlockers(values);
    if (blockers.length > 0) {
      return { success: false, error: "Not ready to publish.", blockers };
    }
  }

  try {
    if (!(await isSlugAvailable(values.slug))) {
      return {
        success: false,
        error: `The slug "${values.slug}" is already taken.`,
      };
    }

    const row = toRow(values);
    if (values.isPublished) row.publishedAt = new Date();

    const [created] = await withDbRetry(() =>
      db
        .insert(properties)
        .values(row as NewProperty)
        .returning({ id: properties.id, slug: properties.slug })
    );

    await logActivity({
      actor: guard.user,
      action: "create",
      entityType: "property",
      entityId: created.id,
      entityLabel: values.title,
    });

    revalidateProperty(created.slug, {
      buildingSlug: await buildingSlugFor(values.buildingId),
      affectsHome: values.isPublished,
      affectsSitemap: values.isPublished,
    });

    return { success: true, id: created.id, slug: created.slug };
  } catch {
    // console.error("[admin] create property failed", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function updateProperty(
  input: unknown
): Promise<PropertyActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  let values: Awaited<ReturnType<typeof parseForm>>;
  try {
    values = await parseForm(input);
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }

  if (!values.id) return { success: false, error: "Missing listing id." };

  if (values.isPublished) {
    const blockers = publishBlockers(values);
    if (blockers.length > 0) {
      return { success: false, error: "Not ready to publish.", blockers };
    }
  }

  try {
    const [existing] = await withDbRetry(() =>
      db.select().from(properties).where(eq(properties.id, values.id!)).limit(1)
    );

    if (!existing) return { success: false, error: NOT_FOUND };

    /**
     * Optimistic concurrency.
     *
     * Two people editing the same listing otherwise silently overwrite each
     * other, and the loser never finds out — they just see their own change
     * disappear some time later. Comparing the timestamp the form was loaded
     * with costs one comparison and turns that into a message.
     */
    if (
      values.expectedUpdatedAt &&
      existing.updatedAt.toISOString() !== values.expectedUpdatedAt
    ) {
      return { success: false, error: CONFLICT };
    }

    if (
      values.slug !== existing.slug &&
      !(await isSlugAvailable(values.slug, existing.id))
    ) {
      return {
        success: false,
        error: `The slug "${values.slug}" is already taken.`,
      };
    }

    const row = toRow(values);

    // First publish stamps the date; unpublishing and republishing later
    // keeps the original, because "published_at" is when it first went live.
    if (values.isPublished && !existing.publishedAt) {
      row.publishedAt = new Date();
    }

    await withDbRetry(() =>
      db.update(properties).set(row).where(eq(properties.id, existing.id))
    );

    const changed = diffFields(
      existing as unknown as Record<string, unknown>,
      row as Record<string, unknown>
    );

    await logActivity({
      actor: guard.user,
      action:
        values.isPublished === existing.isPublished
          ? "update"
          : values.isPublished
            ? "publish"
            : "unpublish",
      entityType: "property",
      entityId: existing.id,
      entityLabel: values.title,
      changedFields: changed,
    });

    revalidateProperty(values.slug, {
      previousSlug: existing.slug,
      buildingSlug: await buildingSlugFor(values.buildingId),
      affectsHome: true,
      affectsSitemap:
        values.slug !== existing.slug ||
        values.isPublished !== existing.isPublished,
    });

    revalidatePath(`/admin/properties/${existing.id}`);

    return { success: true, id: existing.id, slug: values.slug };
  } catch {
    // console.error("[admin] update property failed", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

/**
 * Clone a listing.
 *
 * For a mall with twelve near-identical shops this is the difference between
 * twenty minutes and four hours, which makes it the highest-return feature in
 * the console. What is deliberately *not* copied: the slug (unique), the unit
 * number, and the funding progress — carrying those over would silently
 * publish one unit's raise under another unit's name.
 */
export async function duplicateProperty(
  input: unknown
): Promise<PropertyActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const id = typeof input === "object" && input !== null ? (input as { id?: string }).id : null;
  if (!id) return { success: false, error: "Missing listing id." };

  try {
    const [existing] = await withDbRetry(() =>
      db.select().from(properties).where(eq(properties.id, id)).limit(1)
    );

    if (!existing) return { success: false, error: NOT_FOUND };

    // Find a free slug rather than failing: "-copy", then "-copy-2", …
    const base = slugify(`${existing.slug}-copy`);
    let slug = base;
    for (let attempt = 2; attempt < 50; attempt++) {
      if (await isSlugAvailable(slug)) break;
      slug = `${base}-${attempt}`;
    }

    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      publishedAt: _publishedAt,
      ...rest
    } = existing;

    const [created] = await withDbRetry(() =>
      db
        .insert(properties)
        .values({
          ...rest,
          slug,
          title: `${existing.title} (copy)`,
          unitNumber: null,
          amountRaised: "0",
          investorCount: 0,
          // A copy is never live. Somebody has to look at it first.
          isPublished: false,
          isFeatured: false,
          publishedAt: null,
        })
        .returning({ id: properties.id, slug: properties.slug })
    );

    await logActivity({
      actor: guard.user,
      action: "create",
      entityType: "property",
      entityId: created.id,
      entityLabel: `${existing.title} (copy)`,
      changedFields: { duplicatedFrom: { from: null, to: existing.slug } },
    });

    revalidatePath("/admin/properties");

    return { success: true, id: created.id, slug: created.slug };
  } catch {
    // console.error("[admin] duplicate property failed", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

/**
 * Archive: off_market and unpublished, in one step.
 *
 * There is no hard delete. Deleting a property nulls `leads.property_id`
 * through the existing `onDelete: "set null"`, so every enquiry about it
 * loses the one piece of context that made it answerable — "the one in
 * Kurla" becomes a row with no listing attached.
 */
export async function archiveProperty(input: unknown): Promise<SimpleResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const id = typeof input === "object" && input !== null ? (input as { id?: string }).id : null;
  if (!id) return { success: false, error: "Missing listing id." };

  try {
    const [existing] = await withDbRetry(() =>
      db.select().from(properties).where(eq(properties.id, id)).limit(1)
    );

    if (!existing) return { success: false, error: NOT_FOUND };

    await withDbRetry(() =>
      db
        .update(properties)
        .set({ status: "off_market", isPublished: false, isFeatured: false })
        .where(eq(properties.id, id))
    );

    await logActivity({
      actor: guard.user,
      action: "archive",
      entityType: "property",
      entityId: id,
      entityLabel: existing.title,
      changedFields: {
        status: { from: existing.status, to: "off_market" },
        isPublished: { from: existing.isPublished, to: false },
      },
    });

    revalidateProperty(existing.slug, {
      buildingSlug: await buildingSlugFor(existing.buildingId),
      affectsHome: true,
      affectsSitemap: true,
    });
  } catch {
    // console.error("[admin] archive property failed", error);
    return { success: false, error: GENERIC_ERROR };
  }

  return { success: true };
}

/** Live slug availability for the form, as you type. */
export async function checkSlugAvailability(
  slug: string,
  excludeId?: string
): Promise<{ available: boolean }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { available: false };

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { available: false };

  return { available: await isSlugAvailable(slug, excludeId) };
}
