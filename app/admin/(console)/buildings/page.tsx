import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { listBuildings } from "@/lib/queries/admin-buildings";

export const metadata: Metadata = { title: "Buildings" };

export const dynamic = "force-dynamic";

const BUILDING_TYPE_LABEL: Record<string, string> = {
  mall: "Mall",
  high_street: "High street",
  office_park: "Office park",
  mixed_use: "Mixed use",
  residential_complex: "Residential complex",
  food_court: "Food court",
  warehouse_park: "Warehouse park",
};

export default async function BuildingsPage() {
  const buildings = await listBuildings();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy">
            Buildings
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Shared facts stored once, so a mall&apos;s footfall is the same
            number on all twelve of its shops.
          </p>
        </div>

        <Button
          size="sm"
          className="bg-brand-green text-white hover:bg-brand-green/90"
          nativeButton={false}
          render={<Link href="/admin/buildings/new" />}
        >
          <Plus className="size-4" aria-hidden="true" />
          New building
        </Button>
      </div>

      {buildings.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No buildings yet. A standalone villa or a whole-floor office
          doesn&apos;t need one — this is for malls and towers with several
          listings inside them.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((building) => {
            const listed = Number(building.listedUnits);
            const published = Number(building.publishedUnits);

            return (
              <li key={building.id}>
                <Link
                  href={`/admin/buildings/${building.id}`}
                  className="flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand-green"
                >
                  <span className="font-medium text-navy">{building.name}</span>
                  <span className="mt-0.5 text-sm text-muted-foreground">
                    {BUILDING_TYPE_LABEL[building.buildingType] ??
                      building.buildingType}{" "}
                    · {building.shortLocation}
                  </span>

                  {/* "3 of 40 listed" is what says whether there is work left
                      in this building. A bare unit count doesn't. */}
                  <span className="mt-3 text-sm text-navy">
                    {building.totalUnits
                      ? `${listed} of ${building.totalUnits} listed`
                      : `${listed} listed`}
                    {listed > 0 && (
                      <span className="text-muted-foreground">
                        {" "}
                        · {published} live
                      </span>
                    )}
                  </span>

                  {building.footfallMonthly && (
                    <span className="mt-1 text-xs text-muted-foreground">
                      {Number(building.footfallMonthly).toLocaleString("en-IN")}{" "}
                      monthly footfall
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
