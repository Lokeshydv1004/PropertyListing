import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Eye } from "lucide-react";

import { PropertyForm } from "@/components/admin/properties/property-form";
import { Button } from "@/components/ui/button";
import { propertyToFormValues } from "@/lib/admin/property-form-values";
import {
  getArrayFieldSuggestions,
  getPropertyFilterChoices,
  getPropertyForEdit,
} from "@/lib/queries/admin-properties";

export const metadata: Metadata = { title: "Edit listing" };

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyForEdit(id);

  if (!property) notFound();

  const [suggestions, choices] = await Promise.all([
    getArrayFieldSuggestions(),
    getPropertyFilterChoices(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/properties"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All listings
        </Link>

        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <a
              href={
                property.isPublished
                  ? `/properties/${property.slug}`
                  : `/admin/properties/preview?slug=${property.slug}`
              }
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          {property.isPublished ? (
            <ExternalLink className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
          {property.isPublished ? "View live" : "Preview draft"}
        </Button>
      </div>

      <h1 className="mt-3 font-serif text-2xl font-semibold text-navy">
        {property.title}
      </h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {property.isPublished ? "Live" : "Draft"} · last saved{" "}
        {property.updatedAt.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Kolkata",
        })}
      </p>

      <div className="mt-6">
        <PropertyForm
          mode="edit"
          defaultValues={propertyToFormValues(property)}
          suggestions={suggestions}
          buildings={choices.buildings}
        />
      </div>
    </div>
  );
}
