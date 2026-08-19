"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageManager } from "@/components/admin/properties/image-manager";
import { TagInput } from "@/components/admin/properties/tag-input";
import { deleteBuilding, saveBuilding } from "@/lib/actions/admin-buildings";
import { slugify } from "@/lib/admin/property-fields";
import {
  buildingFormSchema,
  type BuildingFormValues,
} from "@/lib/validation/admin-building";
import { buildingTypeEnum } from "@/db/schema";

const BUILDING_TYPE_LABEL: Record<string, string> = {
  mall: "Mall",
  high_street: "High street",
  office_park: "Office park",
  mixed_use: "Mixed use",
  residential_complex: "Residential complex",
  food_court: "Food court",
  warehouse_park: "Warehouse park",
};

export function BuildingForm({
  defaultValues,
  mode,
  canDelete,
  unitCount = 0,
  amenitySuggestions = [],
}: {
  defaultValues: BuildingFormValues;
  mode: "create" | "edit";
  canDelete: boolean;
  unitCount?: number;
  amenitySuggestions?: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingFormSchema) as never,
    defaultValues,
    mode: "onBlur",
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = form;

  const name = useWatch({ control, name: "name" });

  const slugTouched = useRef(mode === "edit");
  useEffect(() => {
    if (slugTouched.current || !name) return;
    setValue("slug", slugify(name));
  }, [name, setValue]);

  useEffect(() => {
    if (!isDirty) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  function onSubmit(values: BuildingFormValues) {
    setError(null);
    startTransition(async () => {
      const result = await saveBuilding(values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      form.reset(values);
      router.push(`/admin/buildings/${result.id}`);
      router.refresh();
    });
  }

  const fieldError = (key: keyof BuildingFormValues) =>
    (errors as Record<string, { message?: string } | undefined>)[key]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-medium text-navy">The building</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Name" error={fieldError("name")}>
            <Input {...register("name")} />
          </Field>

          <Field label="Slug" error={fieldError("slug")}>
            <Input
              {...register("slug")}
              onChange={(event) => {
                slugTouched.current = true;
                setValue("slug", event.target.value, { shouldDirty: true });
              }}
            />
          </Field>

          <Field label="Type" error={fieldError("buildingType")}>
            <select
              {...register("buildingType")}
              className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-navy"
            >
              {buildingTypeEnum.enumValues.map((type) => (
                <option key={type} value={type}>
                  {BUILDING_TYPE_LABEL[type] ?? type}
                </option>
              ))}
            </select>
          </Field>

          <Field label="City" error={fieldError("city")}>
            <Input {...register("city")} />
          </Field>

          <Field label="Full location" error={fieldError("location")}>
            <Input {...register("location")} />
          </Field>

          <Field label="Short location" error={fieldError("shortLocation")}>
            <Input {...register("shortLocation")} />
          </Field>

          <Field
            label="Total units"
            error={fieldError("totalUnits")}
            hint="How many the building has, not how many we list"
          >
            <Input {...register("totalUnits")} inputMode="numeric" />
          </Field>

          <Field label="Monthly footfall" error={fieldError("footfallMonthly")}>
            <Input {...register("footfallMonthly")} inputMode="numeric" />
          </Field>

          <Field label="Year built" error={fieldError("yearBuilt")}>
            <Input {...register("yearBuilt")} inputMode="numeric" />
          </Field>

          <Field label="RERA number" error={fieldError("reraNumber")}>
            <Input {...register("reraNumber")} />
          </Field>

          <Field label="Latitude" error={fieldError("latitude")}>
            <Input {...register("latitude")} inputMode="decimal" />
          </Field>

          <Field label="Longitude" error={fieldError("longitude")}>
            <Input {...register("longitude")} inputMode="decimal" />
          </Field>
        </div>

        <div className="mt-4">
          <Label>Description</Label>
          <Textarea {...register("description")} rows={5} className="mt-1" />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <ImageManager
              value={field.value ?? []}
              onChange={field.onChange}
              propertyId={defaultValues.id}
            />
          )}
        />
      </section>

      <section className="grid gap-6 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="anchorTenants"
          render={({ field }) => (
            <TagInput
              label="Anchor tenants"
              description="The names that draw traffic — Zara, PVR, Lifestyle."
              value={field.value ?? []}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="amenities"
          render={({ field }) => (
            <TagInput
              label="Amenities"
              description="Shared across every unit — they inherit these as defaults."
              value={field.value ?? []}
              onChange={field.onChange}
              suggestions={amenitySuggestions}
            />
          )}
        />
      </section>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-green text-white hover:bg-brand-green/90"
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {mode === "create" ? "Create building" : "Save changes"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          nativeButton={false}
          render={<Link href="/admin/buildings" />}
        >
          Cancel
        </Button>

        {isDirty && (
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
        )}

        <div className="flex-1" />

        {canDelete && mode === "edit" && defaultValues.id && (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            disabled={pending}
            onClick={() => {
              // The count is in the question, because "are you sure?" tells
              // nobody that twelve shops are about to lose their address.
              const message =
                unitCount > 0
                  ? `Delete this building? ${unitCount} listing${unitCount === 1 ? "" : "s"} will stay, but lose their shared address, footfall and anchor tenants.`
                  : "Delete this building? Nothing is listed under it.";

              if (!confirm(message)) return;

              startTransition(async () => {
                const result = await deleteBuilding({ id: defaultValues.id });
                if (!result.success) setError(result.error);
                else router.push("/admin/buildings");
              });
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete building
          </Button>
        )}
      </div>
    </form>
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
