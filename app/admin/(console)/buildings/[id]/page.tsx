import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

import { BuildingForm } from "@/components/admin/buildings/building-form";
import { UnitsPanel } from "@/components/admin/buildings/units-panel";
import { Button } from "@/components/ui/button";
import { requireAdminPage } from "@/lib/auth/admin";
import {
  getBuilding,
  getBuildingUnits,
} from "@/lib/queries/admin-buildings";
import { getArrayFieldSuggestions } from "@/lib/queries/admin-properties";

export const metadata: Metadata = { title: "Edit building" };

export const dynamic = "force-dynamic";

export default async function BuildingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const admin = await requireAdminPage();
  const building = await getBuilding(id);

  if (!building) notFound();

  const [units, suggestions] = await Promise.all([
    getBuildingUnits(id),
    getArrayFieldSuggestions(),
  ]);

  const text = (value: string | number | null) =>
    value === null ? "" : String(value);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/buildings"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All buildings
        </Link>

        {/*
          The reason this table exists. Creating the twelfth shop in a mall
          should not mean retyping the address, city, coordinates and footfall
          for the twelfth time — this carries them across.
        */}
        <Button
          size="sm"
          className="bg-brand-green text-white hover:bg-brand-green/90"
          nativeButton={false}
          render={<Link href={`/admin/properties/new?building=${building.id}`} />}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add unit here
        </Button>
      </div>

      <h1 className="mt-3 font-serif text-2xl font-semibold text-navy">
        {building.name}
      </h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {building.totalUnits
          ? `${units.length} of ${building.totalUnits} units listed`
          : `${units.length} units listed`}
      </p>

      <div className="mt-6">
        <UnitsPanel buildingId={building.id} units={units.map((unit) => ({
          ...unit,
          updatedAt: unit.updatedAt.toISOString(),
        }))} />
      </div>

      <div className="mt-8">
        <BuildingForm
          mode="edit"
          canDelete={admin.role === "owner"}
          unitCount={units.length}
          amenitySuggestions={suggestions.amenities}
          defaultValues={{
            id: building.id,
            name: building.name,
            slug: building.slug,
            buildingType: building.buildingType,
            location: building.location,
            shortLocation: building.shortLocation,
            city: building.city,
            description: building.description,
            images: building.images,
            amenities: building.amenities,
            anchorTenants: building.anchorTenants,
            totalUnits: text(building.totalUnits),
            footfallMonthly: text(building.footfallMonthly),
            yearBuilt: text(building.yearBuilt),
            reraNumber: text(building.reraNumber),
            latitude: text(building.latitude),
            longitude: text(building.longitude),
          }}
        />
      </div>
    </div>
  );
}
