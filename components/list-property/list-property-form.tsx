"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitListPropertyLead } from "@/lib/actions/leads";
import {
  LISTING_GOALS,
  OCCUPANCY_STATUSES,
  PROPERTY_KINDS,
  listPropertyFormSchema,
  type ListPropertyFormValues,
} from "@/lib/validation/list-property";

const SELECT_CLASS =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-invalid:border-destructive";

export function ListPropertyForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ListPropertyFormValues>({
    resolver: zodResolver(listPropertyFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: "",
      propertyKind: "office",
      occupancy: "leased",
      goal: "fractional",
      valuation: "",
      monthlyRent: "",
      message: "",
      company: "",
    },
  });

  async function onSubmit(values: ListPropertyFormValues) {
    setSubmitError(null);
    const result = await submitListPropertyLead(values, {
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
    });

    if (result.success) {
      router.push("/thank-you?type=list_property");
    } else {
      setSubmitError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Honeypot — see interest-form for the rationale. */}
      <input
        {...register("company")}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] size-0 opacity-0"
      />

      <div className="space-y-2">
        <Label htmlFor="lp-name">Your name</Label>
        <Input
          id="lp-name"
          autoComplete="name"
          placeholder="Your name"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lp-phone">Phone number</Label>
          <Input
            id="lp-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit mobile number"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lp-email">Email address</Label>
          <Input
            id="lp-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lp-city">City</Label>
          <Input
            id="lp-city"
            autoComplete="address-level2"
            placeholder="e.g. Pune"
            aria-invalid={!!errors.city}
            {...register("city")}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lp-kind">Property type</Label>
          <select
            id="lp-kind"
            className={SELECT_CLASS}
            aria-invalid={!!errors.propertyKind}
            {...register("propertyKind")}
          >
            {PROPERTY_KINDS.map((kind) => (
              <option key={kind.value} value={kind.value}>
                {kind.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lp-occupancy">Current status</Label>
          <select
            id="lp-occupancy"
            className={SELECT_CLASS}
            aria-invalid={!!errors.occupancy}
            {...register("occupancy")}
          >
            {OCCUPANCY_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lp-goal">What you want to do</Label>
          <select
            id="lp-goal"
            className={SELECT_CLASS}
            aria-invalid={!!errors.goal}
            {...register("goal")}
          >
            {LISTING_GOALS.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lp-valuation">
            Indicative value{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          {/* Free text, not a number field: owners answer this in ranges
              ("around 4–5 crore") and forcing a single figure loses that. */}
          <Input
            id="lp-valuation"
            placeholder="e.g. ₹4–5 crore"
            aria-invalid={!!errors.valuation}
            {...register("valuation")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lp-rent">
            Current monthly rent{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="lp-rent"
            placeholder="e.g. ₹3.2 lakh"
            aria-invalid={!!errors.monthlyRent}
            {...register("monthlyRent")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lp-message">
          Anything else{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="lp-message"
          rows={4}
          placeholder="Tenant, lease term, area, or anything else worth knowing."
          aria-invalid={!!errors.message}
          {...register("message")}
        />
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || isSubmitSuccessful}
        className="h-11 w-full bg-brand-green px-8 text-white hover:bg-brand-green/90 sm:w-auto"
      >
        {isSubmitting || isSubmitSuccessful ? "Sending…" : "Submit property"}
      </Button>

      <p className="text-xs leading-relaxed text-muted-foreground">
        No exclusivity, no listing fee, and no obligation. By submitting, you
        agree to your details being handled as described in our{" "}
        <Link href="/privacy" className="underline hover:text-navy">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
