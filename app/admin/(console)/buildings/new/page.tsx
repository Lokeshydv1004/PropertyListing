import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BuildingForm } from "@/components/admin/buildings/building-form";
import { getArrayFieldSuggestions } from "@/lib/queries/admin-properties";

export const metadata: Metadata = { title: "New building" };

export const dynamic = "force-dynamic";

export default async function NewBuildingPage() {
  const suggestions = await getArrayFieldSuggestions();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/buildings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All buildings
      </Link>

      <h1 className="mt-3 font-serif text-2xl font-semibold text-navy">
        New building
      </h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Create this first, then add its units — they inherit the address,
        city, coordinates and footfall from here.
      </p>

      <div className="mt-6">
        <BuildingForm
          mode="create"
          canDelete={false}
          amenitySuggestions={suggestions.amenities}
          defaultValues={{
            name: "",
            slug: "",
            buildingType: "mall",
            location: "",
            shortLocation: "",
            city: "",
            description: "",
            images: [],
            amenities: [],
            anchorTenants: [],
            totalUnits: "",
            footfallMonthly: "",
            yearBuilt: "",
            reraNumber: "",
            latitude: "",
            longitude: "",
          }}
        />
      </div>
    </div>
  );
}
