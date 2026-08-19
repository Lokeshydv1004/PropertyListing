"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/client";
import { buildings, properties, type NewBuilding } from "@/db/schema";
import { diffFields, logActivity } from "@/lib/admin/activity";
import { requireAdmin, requireOwner } from "@/lib/auth/admin";
import {
  countBuildingUnits,
  isBuildingSlugAvailable,
} from "@/lib/queries/admin-buildings";
import { withDbRetry } from "@/lib/with-db-retry";
import { buildingFormSchema } from "@/lib/validation/admin-building";

export type BuildingActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";
const NOT_FOUND = "That building no longer exists.";

const INTEGER_FIELDS = ["totalUnits", "footfallMonthly", "yearBuilt"] as const;

function toRow(values: Record<string, unknown>): Partial<NewBuilding> {
  const row = { ...values };
  delete row.id;

  for (const field of INTEGER_FIELDS) {
    const value = row[field];
    row[field] = value === null || value === "" ? null : Number(value);
  }

  return row as Partial<NewBuilding>;
}

export async function saveBuilding(
  input: unknown
): Promise<BuildingActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = buildingFormSchema.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false,
      error: issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid building.",
    };
  }

  const values = parsed.data;

  try {
    if (!(await isBuildingSlugAvailable(values.slug, values.id))) {
      return { success: false, error: `The slug "${values.slug}" is taken.` };
    }

    if (values.id) {
      const [existing] = await withDbRetry(() =>
        db.select().from(buildings).where(eq(buildings.id, values.id!)).limit(1)
      );

      if (!existing) return { success: false, error: NOT_FOUND };

      const row = toRow(values);

      await withDbRetry(() =>
        db.update(buildings).set(row).where(eq(buildings.id, existing.id))
      );

      await logActivity({
        actor: guard.user,
        action: "update",
        entityType: "building",
        entityId: existing.id,
        entityLabel: values.name,
        changedFields: diffFields(
          existing as unknown as Record<string, unknown>,
          row as Record<string, unknown>
        ),
      });

      revalidatePath("/admin/buildings");
      revalidatePath(`/admin/buildings/${existing.id}`);

      return { success: true, id: existing.id };
    }

    const [created] = await withDbRetry(() =>
      db
        .insert(buildings)
        .values(toRow(values) as NewBuilding)
        .returning({ id: buildings.id })
    );

    await logActivity({
      actor: guard.user,
      action: "create",
      entityType: "building",
      entityId: created.id,
      entityLabel: values.name,
    });

    revalidatePath("/admin/buildings");

    return { success: true, id: created.id };
  } catch {
    // console.error("[admin] save building failed", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

/**
 * Deleting a building nulls `building_id` on every unit in it, through the
 * existing `onDelete: "set null"` — the units survive but lose their shared
 * address, footfall and anchor tenants, with nothing to say where they went.
 *
 * Owner-only, and the count is reported back so the confirmation can say what
 * is about to happen rather than asking "are you sure?" about nothing.
 */
export async function deleteBuilding(
  input: unknown
): Promise<BuildingActionResult> {
  const guard = await requireOwner();
  if (!guard.ok) return { success: false, error: guard.error };

  const id =
    typeof input === "object" && input !== null
      ? (input as { id?: string }).id
      : null;

  if (!id) return { success: false, error: "Missing building id." };

  try {
    const [existing] = await withDbRetry(() =>
      db.select().from(buildings).where(eq(buildings.id, id)).limit(1)
    );

    if (!existing) return { success: false, error: NOT_FOUND };

    const units = await countBuildingUnits(id);

    await withDbRetry(() => db.delete(buildings).where(eq(buildings.id, id)));

    await logActivity({
      actor: guard.user,
      action: "delete",
      entityType: "building",
      entityId: id,
      entityLabel: existing.name,
      changedFields: { unitsOrphaned: { from: units, to: 0 } },
    });

    revalidatePath("/admin/buildings");
    revalidatePath("/admin/properties");

    return { success: true, id };
  } catch {
    // console.error("[admin] delete building failed", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

/**
 * Pre-fills a new listing from its parent building.
 *
 * This is the whole reason the buildings table exists (db/schema/buildings.ts
 * says as much): creating the twelfth shop in a mall should not mean retyping
 * the address, city, coordinates and footfall for the twelfth time.
 */
export async function newUnitDefaults(buildingId: string): Promise<{
  location: string;
  shortLocation: string;
  city: string;
  footfallMonthly: string;
  latitude: string;
  longitude: string;
  amenities: string[];
} | null> {
  const guard = await requireAdmin();
  if (!guard.ok) return null;

  const [building] = await withDbRetry(() =>
    db.select().from(buildings).where(eq(buildings.id, buildingId)).limit(1)
  );

  if (!building) return null;

  return {
    location: building.location,
    shortLocation: building.shortLocation,
    city: building.city,
    footfallMonthly: building.footfallMonthly
      ? String(building.footfallMonthly)
      : "",
    latitude: building.latitude ?? "",
    longitude: building.longitude ?? "",
    amenities: building.amenities,
  };
}

/** Detaches a unit from its building without touching either row's data. */
export async function detachUnit(input: unknown): Promise<BuildingActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const id =
    typeof input === "object" && input !== null
      ? (input as { id?: string }).id
      : null;

  if (!id) return { success: false, error: "Missing listing id." };

  try {
    const [existing] = await withDbRetry(() =>
      db
        .select({ title: properties.title, buildingId: properties.buildingId })
        .from(properties)
        .where(eq(properties.id, id))
        .limit(1)
    );

    if (!existing) return { success: false, error: "That listing is gone." };

    await withDbRetry(() =>
      db.update(properties).set({ buildingId: null }).where(eq(properties.id, id))
    );

    await logActivity({
      actor: guard.user,
      action: "update",
      entityType: "property",
      entityId: id,
      entityLabel: existing.title,
      changedFields: { buildingId: { from: existing.buildingId, to: null } },
    });

    revalidatePath("/admin/buildings");

    return { success: true, id };
  } catch {
    // console.error("[admin] detach unit failed", error);
    return { success: false, error: GENERIC_ERROR };
  }
}
