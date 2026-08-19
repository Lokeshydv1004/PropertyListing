"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Check, ExternalLink, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/admin/properties/tag-input";
import { DocumentManager } from "@/components/admin/properties/document-manager";
import { ImageManager } from "@/components/admin/properties/image-manager";
import { cn } from "@/lib/utils";
import {
  checkSlugAvailability,
  createProperty,
  updateProperty,
} from "@/lib/actions/admin-properties";
import {
  FIELD_LABEL,
  adminStatusesFor,
  fieldsFor,
  slugify,
  type PropertyFieldName,
} from "@/lib/admin/property-fields";
import {
  propertyFormSchema,
  publishBlockers,
  type PropertyFormValues,
} from "@/lib/validation/admin-property";
import {
  CATEGORY_GROUPS,
  CATEGORY_LABEL,
  LISTING_TYPE_LABEL,
  STATUS_LABEL,
} from "@/lib/taxonomy";
import { listingTypeEnum } from "@/db/schema";

type Suggestions = { amenities: string[]; tags: string[] };
type BuildingOption = { id: string; name: string };

const TABS = ["Details", "Pricing", "Media", "Docs", "SEO"] as const;
type Tab = (typeof TABS)[number];

export function PropertyForm({
  defaultValues,
  suggestions,
  buildings,
  mode,
}: {
  defaultValues: PropertyFormValues;
  suggestions: Suggestions;
  buildings: BuildingOption[];
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>("Details");
  /** The last answer the server gave, tagged with the slug it was about. */
  const [slugCheck, setSlugCheck] = useState<{
    slug: string;
    available: boolean;
  } | null>(null);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema) as never,
    defaultValues,
    mode: "onBlur",
  });

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isDirty },
  } = form;

  /**
   * useWatch rather than watch(): watch() returns a fresh function on every
   * render, which makes the React Compiler skip memoising this component
   * entirely — and this is the largest client component in the app.
   */
  const listingType = useWatch({ control, name: "listingType" });
  const category = useWatch({ control, name: "category" });
  const slug = useWatch({ control, name: "slug" });
  const title = useWatch({ control, name: "title" });
  const isPublished = useWatch({ control, name: "isPublished" });
  const images = useWatch({ control, name: "images" });
  const description = useWatch({ control, name: "description" });
  const fundingTarget = useWatch({ control, name: "fundingTarget" });
  const salePrice = useWatch({ control, name: "salePrice" });
  const monthlyRent = useWatch({ control, name: "monthlyRent" });

  const visible = fieldsFor({ listingType, category });
  const shows = (field: PropertyFieldName) => visible.has(field);

  /**
   * Losing twenty minutes of typing to a stray Back button happens once and
   * is remembered forever. The browser's own dialog is the only thing that
   * can interrupt a real navigation away from the tab.
   */
  useEffect(() => {
    if (!isDirty) return;

    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  // Auto-slug from the title, but only while creating and only until someone
  // types their own. Rewriting a live listing's URL as you fix a typo in the
  // title would silently break every link to it.
  const slugTouched = useRef(mode === "edit");
  useEffect(() => {
    if (slugTouched.current || !title) return;
    setValue("slug", slugify(title), { shouldValidate: false });
  }, [title, setValue]);

  // Uniqueness is checked live, because the alternative is finding out at
  // save time, after the whole form has been filled in.
  useEffect(() => {
    if (!slug || slug === defaultValues.slug) return;

    const timer = setTimeout(async () => {
      const result = await checkSlugAvailability(slug, defaultValues.id);
      setSlugCheck({ slug, available: result.available });
    }, 400);

    return () => clearTimeout(timer);
  }, [slug, defaultValues.slug, defaultValues.id]);

  /**
   * Derived during render rather than stored: the state is entirely a
   * function of the current slug and the last answer, and keeping it in
   * useState meant setting it synchronously inside the effect — a cascading
   * render on every keystroke.
   */
  const slugState: "idle" | "checking" | "free" | "taken" =
    !slug || slug === defaultValues.slug
      ? "idle"
      : slugCheck?.slug === slug
        ? slugCheck.available
          ? "free"
          : "taken"
        : "checking";

  const currentBlockers = publishBlockers({
    listingType,
    images: images ?? [],
    description: description ?? "",
    slug: slug ?? "",
    fundingTarget,
    salePrice,
    monthlyRent,
  });

  function onSubmit(values: PropertyFormValues) {
    setSaveError(null);
    setBlockers([]);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProperty(values)
          : await updateProperty(values);

      if (!result.success) {
        setSaveError(result.error);
        setBlockers(result.blockers ?? []);
        return;
      }

      // Reset the dirty flag before navigating, or the unload guard fires on
      // a successful save.
      form.reset(values);
      router.push(`/admin/properties/${result.id}`);
      router.refresh();
    });
  }

  const field = (name: PropertyFieldName) => ({
    label: FIELD_LABEL[name] ?? name,
    error: (errors as Record<string, { message?: string } | undefined>)[name]
      ?.message,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="pb-24">
      <div className="flex gap-1 border-b border-border">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            aria-current={tab === name ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
              tab === name
                ? "border-brand-green font-medium text-navy"
                : "border-transparent text-muted-foreground hover:text-navy"
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {tab === "Details" && (
          <>
            <Section title="What it is">
              <Field {...field("title")}>
                <Input {...register("title")} />
              </Field>

              <Field {...field("propertyType")} hint="Shown on cards, e.g. “3 BHK Apartment”">
                <Input {...register("propertyType")} />
              </Field>

              <Field {...field("listingType")}>
                <select
                  {...register("listingType")}
                  onChange={(event) => {
                    const next = event.target
                      .value as (typeof listingTypeEnum.enumValues)[number];
                    setValue("listingType", next, { shouldDirty: true });
                    // The status vocabularies don't overlap, so a type change
                    // leaves an impossible status behind unless it is reset.
                    setValue("status", adminStatusesFor(next)[0], {
                      shouldDirty: true,
                    });
                  }}
                  className={selectClass}
                >
                  {listingTypeEnum.enumValues.map((type) => (
                    <option key={type} value={type}>
                      {LISTING_TYPE_LABEL[type]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field {...field("category")}>
                <select {...register("category")} className={selectClass}>
                  {CATEGORY_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.categories.map((option) => (
                        <option key={option} value={option}>
                          {CATEGORY_LABEL[option]}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>

              <Field {...field("status")}>
                <select {...register("status")} className={selectClass}>
                  {adminStatusesFor(listingType).map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </option>
                  ))}
                </select>
              </Field>
            </Section>

            <Section title="Where it is">
              <Field {...field("city")}>
                <Input {...register("city")} />
              </Field>
              <Field {...field("location")} hint="Full address line">
                <Input {...register("location")} />
              </Field>
              <Field {...field("shortLocation")} hint="e.g. “Bandra West”">
                <Input {...register("shortLocation")} />
              </Field>
              <Field {...field("latitude")}>
                <Input {...register("latitude")} inputMode="decimal" />
              </Field>
              <Field {...field("longitude")}>
                <Input {...register("longitude")} inputMode="decimal" />
              </Field>
            </Section>

            <Section title="Building and unit">
              <Field
                {...field("buildingId")}
                hint="Shared facts (footfall, anchors) come from the parent"
              >
                <select {...register("buildingId")} className={selectClass}>
                  <option value="">Standalone — no parent building</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field {...field("unitNumber")}>
                <Input {...register("unitNumber")} />
              </Field>
              <Field {...field("floorLabel")}>
                <Input {...register("floorLabel")} />
              </Field>
            </Section>

            <Section title="Size">
              <Field {...field("areaSqft")}>
                <Input {...register("areaSqft")} inputMode="numeric" />
              </Field>
              <Field {...field("carpetAreaSqft")}>
                <Input {...register("carpetAreaSqft")} inputMode="numeric" />
              </Field>
              {shows("bedrooms") && (
                <Field {...field("bedrooms")}>
                  <Input {...register("bedrooms")} inputMode="numeric" />
                </Field>
              )}
              {shows("frontageFt") && (
                <Field {...field("frontageFt")}>
                  <Input {...register("frontageFt")} inputMode="numeric" />
                </Field>
              )}
              {shows("footfallMonthly") && (
                <Field {...field("footfallMonthly")}>
                  <Input {...register("footfallMonthly")} inputMode="numeric" />
                </Field>
              )}
              {shows("powerLoadKva") && (
                <Field {...field("powerLoadKva")} hint="Sanctioned electrical load">
                  <Input {...register("powerLoadKva")} inputMode="decimal" />
                </Field>
              )}
            </Section>

            {shows("seatingCapacity") && (
              <Section title="Food & beverage">
                <Field {...field("seatingCapacity")}>
                  <Input {...register("seatingCapacity")} inputMode="numeric" />
                </Field>
                <Controller
                  control={control}
                  name="hasKitchenProvision"
                  render={({ field: control }) => (
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={control.value === true}
                        onCheckedChange={control.onChange}
                        id="has-kitchen"
                      />
                      <Label htmlFor="has-kitchen">
                        {FIELD_LABEL.hasKitchenProvision}
                      </Label>
                    </div>
                  )}
                />
              </Section>
            )}

            {shows("tenantName") && (
              <Section
                title="Tenant and lease in place"
                note="The lease the asset already has. For a tenanted listing this rent is what produces the yield, so it belongs on the listing even though nothing is being let. Leave blank if vacant."
              >
                <Field {...field("tenantName")}>
                  <Input {...register("tenantName")} />
                </Field>
                <Field {...field("leaseEndDate")}>
                  <Input type="date" {...register("leaseEndDate")} />
                </Field>
                <Field {...field("occupancyRate")}>
                  <Input {...register("occupancyRate")} inputMode="decimal" />
                </Field>
                <Field {...field("monthlyRent")} hint="Rent the asset currently earns">
                  <Input {...register("monthlyRent")} inputMode="numeric" />
                </Field>
                <Field {...field("leaseTermMonths")}>
                  <Input {...register("leaseTermMonths")} inputMode="numeric" />
                </Field>
                <Field {...field("lockInMonths")}>
                  <Input {...register("lockInMonths")} inputMode="numeric" />
                </Field>
                <Field {...field("rentEscalationPct")}>
                  <Input {...register("rentEscalationPct")} inputMode="decimal" />
                </Field>
                <Field {...field("camPerSqftMonthly")}>
                  <Input {...register("camPerSqftMonthly")} inputMode="decimal" />
                </Field>
              </Section>
            )}

            <Section title="Condition and compliance">
              <Field {...field("possessionStatus")}>
                <Input {...register("possessionStatus")} />
              </Field>
              <Field {...field("maintenanceMonthly")}>
                <Input {...register("maintenanceMonthly")} inputMode="numeric" />
              </Field>
              <Field {...field("reraNumber")}>
                <Input {...register("reraNumber")} />
              </Field>
              <Field {...field("yearBuilt")}>
                <Input {...register("yearBuilt")} inputMode="numeric" />
              </Field>
              <Field {...field("managedBy")}>
                <Input {...register("managedBy")} />
              </Field>
            </Section>
          </>
        )}

        {tab === "Pricing" && (
          <>
            {listingType === "fractional" && (
              <>
                <Section title="The raise">
                  <Field {...field("totalValuation")}>
                    <Input {...register("totalValuation")} inputMode="numeric" />
                  </Field>
                  <Field {...field("fundingTarget")}>
                    <Input {...register("fundingTarget")} inputMode="numeric" />
                  </Field>
                  <Field {...field("amountRaised")}>
                    <Input {...register("amountRaised")} inputMode="numeric" />
                  </Field>
                  <Field {...field("minInvestment")}>
                    <Input {...register("minInvestment")} inputMode="numeric" />
                  </Field>
                  <Field {...field("investorCount")}>
                    <Input {...register("investorCount")} inputMode="numeric" />
                  </Field>
                  <Field {...field("fundingDeadline")}>
                    <Input type="date" {...register("fundingDeadline")} />
                  </Field>
                </Section>

                <Section title="Returns">
                  <Field {...field("estAnnualYield")}>
                    <Input {...register("estAnnualYield")} inputMode="decimal" />
                  </Field>
                  <Field {...field("projectedAppreciation")}>
                    <Input
                      {...register("projectedAppreciation")}
                      inputMode="decimal"
                    />
                  </Field>
                  <Field {...field("investmentHorizon")} hint="e.g. “3–5 years”">
                    <Input {...register("investmentHorizon")} />
                  </Field>
                </Section>

                <Section
                  title="Fees"
                  note="Blank means “not stated”, which the public page renders as silence. Zero is a promise — only enter it if it's true."
                >
                  <Field {...field("platformFeePct")}>
                    <Input {...register("platformFeePct")} inputMode="decimal" />
                  </Field>
                  <Field {...field("managementFeePct")}>
                    <Input {...register("managementFeePct")} inputMode="decimal" />
                  </Field>
                  <Field {...field("exitFeePct")}>
                    <Input {...register("exitFeePct")} inputMode="decimal" />
                  </Field>
                </Section>
              </>
            )}

            {listingType === "sale" && (
              <Section title="Sale price">
                <Field {...field("salePrice")}>
                  <Input
                    {...register("salePrice")}
                    inputMode="numeric"
                    onBlur={(event) => {
                      // Derived, but editable: a quoted rate can legitimately
                      // differ from price ÷ area.
                      // getValues rather than watch: this is a one-shot read
                      // inside an event handler, and watch() returns a
                      // function the React Compiler refuses to memoize past.
                      const area = Number(getValues("areaSqft"));
                      const price = Number(event.target.value);
                      if (area > 0 && price > 0 && !getValues("pricePerSqft")) {
                        setValue("pricePerSqft", String(Math.round(price / area)), {
                          shouldDirty: true,
                        });
                      }
                    }}
                  />
                </Field>
                <Field {...field("pricePerSqft")} hint="Filled in from price ÷ area; override if quoted differently">
                  <Input {...register("pricePerSqft")} inputMode="numeric" />
                </Field>
              </Section>
            )}

            {listingType === "rent" && (
              <Section title="Lease terms">
                <Field {...field("monthlyRent")}>
                  <Input {...register("monthlyRent")} inputMode="numeric" />
                </Field>
                <Field {...field("securityDeposit")}>
                  <Input {...register("securityDeposit")} inputMode="numeric" />
                </Field>
                <Field {...field("leaseTermMonths")}>
                  <Input {...register("leaseTermMonths")} inputMode="numeric" />
                </Field>
                <Field {...field("lockInMonths")}>
                  <Input {...register("lockInMonths")} inputMode="numeric" />
                </Field>
                <Field {...field("rentEscalationPct")}>
                  <Input {...register("rentEscalationPct")} inputMode="decimal" />
                </Field>
                <Field {...field("camPerSqftMonthly")}>
                  <Input {...register("camPerSqftMonthly")} inputMode="decimal" />
                </Field>
                <Field {...field("availableFrom")}>
                  <Input type="date" {...register("availableFrom")} />
                </Field>
                <Field {...field("furnishingStatus")} hint="Bare Shell / Warm Shell / Furnished">
                  <Input {...register("furnishingStatus")} />
                </Field>
              </Section>
            )}
          </>
        )}

        {tab === "Media" && (
          <div className="space-y-6">
            <Controller
              control={control}
              name="images"
              render={({ field: control }) => (
                <ImageManager
                  value={control.value ?? []}
                  onChange={control.onChange}
                  propertyId={defaultValues.id}
                />
              )}
            />

            <Controller
              control={control}
              name="highlights"
              render={({ field: control }) => (
                <TagInput
                  label="Highlights"
                  description="Per-property selling points, read top to bottom."
                  value={control.value ?? []}
                  onChange={control.onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="amenities"
              render={({ field: control }) => (
                <TagInput
                  label="Amenities"
                  value={control.value ?? []}
                  onChange={control.onChange}
                  suggestions={suggestions.amenities}
                />
              )}
            />
          </div>
        )}

        {tab === "Docs" && (
          <div className="space-y-6">
            <Controller
              control={control}
              name="documents"
              render={({ field: control }) => (
                <DocumentManager
                  value={control.value ?? []}
                  onChange={control.onChange}
                  propertyId={defaultValues.id}
                />
              )}
            />

            <Controller
              control={control}
              name="propertyRisks"
              render={({ field: control }) => (
                <TagInput
                  label="Property risks"
                  description="Specific to this asset — “the lease expires in 2029”, not the generic FAQ text."
                  value={control.value ?? []}
                  onChange={control.onChange}
                />
              )}
            />
          </div>
        )}

        {tab === "SEO" && (
          <div className="space-y-6">
            <Field {...field("slug")} hint="The public URL: /properties/<slug>">
              <div>
                <Input
                  {...register("slug")}
                  onChange={(event) => {
                    slugTouched.current = true;
                    setValue("slug", event.target.value, { shouldDirty: true });
                  }}
                />
                <SlugStatus
                  state={slugState}
                  slug={slug}
                  changed={mode === "edit" && slug !== defaultValues.slug}
                />
              </div>
            </Field>

            <Field {...field("summary")} hint="Short blurb for cards and the detail intro">
              <Textarea {...register("summary")} rows={3} />
            </Field>

            <Field {...field("description")}>
              <Textarea {...register("description")} rows={12} />
            </Field>

            <Controller
              control={control}
              name="tags"
              render={({ field: control }) => (
                <TagInput
                  label="Tags"
                  value={control.value ?? []}
                  onChange={control.onChange}
                  suggestions={suggestions.tags}
                />
              )}
            />
          </div>
        )}
      </div>

      {/* The save bar stays put: the form is long, and a save button at the
          bottom of a forty-field page is a scroll every single time. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3">
          <Controller
            control={control}
            name="isPublished"
            render={({ field: control }) => (
              <div className="flex items-center gap-2">
                <Switch
                  id="is-published"
                  checked={control.value}
                  disabled={currentBlockers.length > 0 && !control.value}
                  onCheckedChange={control.onChange}
                />
                <Label htmlFor="is-published">Published</Label>
              </div>
            )}
          />

          <Controller
            control={control}
            name="isFeatured"
            render={({ field: control }) => (
              <div className="flex items-center gap-2">
                <Switch
                  id="is-featured"
                  checked={control.value}
                  onCheckedChange={control.onChange}
                />
                <Label htmlFor="is-featured">Featured</Label>
              </div>
            )}
          />

          <div className="flex-1" />

          {isDirty && (
            <span className="text-xs text-muted-foreground">
              Unsaved changes
            </span>
          )}

          <Button
            type="button"
            variant="ghost"
            nativeButton={false}
            render={<Link href="/admin/properties" />}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={pending}
            className="bg-brand-green text-white hover:bg-brand-green/90"
          >
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {mode === "create" ? "Create listing" : "Save changes"}
          </Button>
        </div>

        {(saveError || blockers.length > 0 || (!isPublished && currentBlockers.length > 0)) && (
          <div className="mx-auto mt-2 max-w-4xl text-sm">
            {saveError && (
              <p role="alert" className="font-medium text-destructive">
                {saveError}
              </p>
            )}
            {(blockers.length > 0 ? blockers : !isPublished ? currentBlockers : []).length > 0 && (
              <ul className="mt-1 flex flex-wrap gap-x-4 text-muted-foreground">
                {(blockers.length > 0 ? blockers : currentBlockers).map((blocker) => (
                  <li key={blocker} className="flex items-center gap-1">
                    <AlertTriangle className="size-3 text-gold-700" aria-hidden="true" />
                    {blocker}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-navy focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="font-medium text-navy">{title}</h2>
      {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
      {hint && !error && (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function SlugStatus({
  state,
  slug,
  changed,
}: {
  state: "idle" | "checking" | "free" | "taken";
  slug: string | undefined;
  changed: boolean;
}) {
  return (
    <div className="mt-1 space-y-1 text-xs">
      {state === "checking" && (
        <p className="flex items-center gap-1 text-muted-foreground">
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          Checking…
        </p>
      )}
      {state === "free" && (
        <p className="flex items-center gap-1 text-brand-green">
          <Check className="size-3" aria-hidden="true" />
          /properties/{slug} is free
        </p>
      )}
      {state === "taken" && (
        <p className="flex items-center gap-1 text-destructive" role="alert">
          <X className="size-3" aria-hidden="true" />
          Another listing already uses that slug
        </p>
      )}
      {/* Changing a live listing's slug breaks every existing link to it and
          drops whatever search ranking the old URL had. */}
      {changed && (
        <p className="flex items-center gap-1 text-gold-700">
          <ExternalLink className="size-3" aria-hidden="true" />
          Changing the slug breaks existing links and search results for the
          old URL.
        </p>
      )}
    </div>
  );
}
