"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Link2Off, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detachUnit } from "@/lib/actions/admin-buildings";
import { CATEGORY_LABEL, LISTING_TYPE_SHORT, STATUS_LABEL } from "@/lib/taxonomy";
import type { ListingStatus, ListingType, PropertyCategory } from "@/db/schema";

export type UnitRow = {
  id: string;
  title: string;
  slug: string;
  unitNumber: string | null;
  floorLabel: string | null;
  listingType: ListingType;
  category: PropertyCategory;
  status: ListingStatus;
  isPublished: boolean;
  updatedAt: string;
};

/** Everything listed inside this building, in floor and unit order. */
export function UnitsPanel({
  buildingId,
  units,
}: {
  buildingId: string;
  units: UnitRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (units.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Nothing is listed in this building yet.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          nativeButton={false}
          render={<Link href={`/admin/properties/new?building=${buildingId}`} />}
        >
          Add the first unit
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <h2 className="border-b border-border px-4 py-3 font-medium text-navy">
        Units
      </h2>

      <ul className="divide-y divide-border">
        {units.map((unit) => (
          <li key={unit.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/properties/${unit.id}`}
                className="font-medium text-navy underline-offset-2 hover:underline"
              >
                {unit.unitNumber ? `${unit.unitNumber} — ` : ""}
                {unit.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {[
                  unit.floorLabel,
                  CATEGORY_LABEL[unit.category],
                  STATUS_LABEL[unit.status],
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>

            <Badge className="border-transparent bg-secondary text-secondary-foreground">
              {LISTING_TYPE_SHORT[unit.listingType]}
            </Badge>

            {!unit.isPublished && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                Draft
              </span>
            )}

            <Button
              size="icon-sm"
              variant="ghost"
              title="Detach from this building"
              disabled={pending}
              onClick={() => {
                if (
                  !confirm(
                    `Detach "${unit.title}" from this building? The listing stays, but stops inheriting the shared address and footfall.`
                  )
                ) {
                  return;
                }
                startTransition(async () => {
                  await detachUnit({ id: unit.id });
                  router.refresh();
                });
              }}
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Link2Off className="size-3.5" aria-hidden="true" />
              )}
              <span className="sr-only">Detach {unit.title}</span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
