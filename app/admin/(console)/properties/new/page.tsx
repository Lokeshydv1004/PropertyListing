import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PropertyForm } from "@/components/admin/properties/property-form";
import { emptyFormValues } from "@/lib/admin/property-form-values";
import { getBuilding } from "@/lib/queries/admin-buildings";
import {
  getArrayFieldSuggestions,
  getPropertyFilterChoices,
} from "@/lib/queries/admin-properties";
import {
  CATEGORY_GROUPS,
  CATEGORY_LABEL,
  LISTING_TYPE_LABEL,
} from "@/lib/taxonomy";
import { listingTypeEnum, propertyCategoryEnum } from "@/db/schema";
import type { ListingType, PropertyCategory } from "@/db/schema";

export const metadata: Metadata = { title: "New listing" };

export const dynamic = "force-dynamic";

/**
 * Type first, then the form.
 *
 * Which of the ~70 columns matter depends entirely on these two answers, so
 * asking them first is what makes the form afterwards a short one. The
 * alternative — every field on screen with most of them irrelevant — is how a
 * rent listing ends up with a funding deadline in it.
 */
export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    category?: string;
    building?: string;
  }>;
}) {
  const params = await searchParams;

  const listingType = listingTypeEnum.enumValues.includes(
    params.type as ListingType
  )
    ? (params.type as ListingType)
    : null;

  const category = propertyCategoryEnum.enumValues.includes(
    params.category as PropertyCategory
  )
    ? (params.category as PropertyCategory)
    : null;

  if (!listingType || !category) {
    return <TypePicker listingType={listingType} building={params.building} />;
  }

  const [suggestions, choices, parent] = await Promise.all([
    getArrayFieldSuggestions(),
    getPropertyFilterChoices(),
    params.building ? getBuilding(params.building) : null,
  ]);

  const defaults = emptyFormValues({ listingType, category });

  /**
   * Arriving from "Add unit here" carries the parent's shared facts across.
   *
   * This is the entire justification for the buildings table: creating the
   * twelfth shop in a mall should not mean retyping the address, city,
   * coordinates and footfall for the twelfth time — and retyping is exactly
   * how one building ends up with three different footfall numbers.
   */
  if (parent) {
    defaults.buildingId = parent.id;
    defaults.location = parent.location;
    defaults.shortLocation = parent.shortLocation;
    defaults.city = parent.city;
    defaults.latitude = parent.latitude ?? "";
    defaults.longitude = parent.longitude ?? "";
    defaults.amenities = parent.amenities;

    if (parent.footfallMonthly) {
      defaults.footfallMonthly = String(parent.footfallMonthly);
    }
    if (parent.yearBuilt) defaults.yearBuilt = String(parent.yearBuilt);
    if (parent.reraNumber) defaults.reraNumber = parent.reraNumber;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={
          parent
            ? `/admin/buildings/${parent.id}`
            : "/admin/properties/new"
        }
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {parent ? `Back to ${parent.name}` : "Change type"}
      </Link>

      <h1 className="mt-3 font-serif text-2xl font-semibold text-navy">
        New {LISTING_TYPE_LABEL[listingType].toLowerCase()} listing
      </h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {CATEGORY_LABEL[category]} · saved as a draft until you publish it
        {parent ? ` · in ${parent.name}, pre-filled from it` : ""}
      </p>

      <div className="mt-6">
        <PropertyForm
          mode="create"
          defaultValues={defaults}
          suggestions={suggestions}
          buildings={choices.buildings}
        />
      </div>
    </div>
  );
}

function TypePicker({
  listingType,
  building,
}: {
  listingType: ListingType | null;
  /** Carried through both steps, or the pre-fill is lost on the way. */
  building?: string;
}) {
  const carry = building ? `&building=${building}` : "";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold text-navy">
        New listing
      </h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {listingType
          ? "Now pick what kind of property it is."
          : "What kind of listing is this? It decides which fields you are asked for."}
      </p>

      {!listingType ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {listingTypeEnum.enumValues.map((type) => (
            <li key={type}>
              <Link
                href={`/admin/properties/new?type=${type}${carry}`}
                className="flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand-green"
              >
                <span className="font-medium text-navy">
                  {LISTING_TYPE_LABEL[type]}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">
                  {type === "fractional"
                    ? "A raise: valuation, target, minimum ticket, fees."
                    : type === "sale"
                      ? "An outright sale: asking price and rate per sq.ft."
                      : "A lease: rent, deposit, term, lock-in, escalation."}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 space-y-5">
          {CATEGORY_GROUPS.map((group) => (
            <div key={group.label}>
              <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {group.label}
              </h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {group.categories.map((category) => (
                  <li key={category}>
                    <Link
                      href={`/admin/properties/new?type=${listingType}&category=${category}${carry}`}
                      className="block rounded-lg border border-border bg-card px-3 py-2 text-sm text-navy transition-colors hover:border-brand-green"
                    >
                      {CATEGORY_LABEL[category]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
