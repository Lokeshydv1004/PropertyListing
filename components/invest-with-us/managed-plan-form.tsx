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
import { submitManagedPlanLead } from "@/lib/actions/leads";
import {
  PLAN_AMOUNT_BANDS,
  PLAN_HORIZONS,
  PLAN_PRIORITIES,
  managedPlanFormSchema,
  type ManagedPlanFormValues,
} from "@/lib/validation/managed-plan";

const SELECT_CLASS =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-invalid:border-destructive";

/**
 * Deliberately asks for a *band*, not a figure.
 *
 * The per-listing interest form asks for an exact amount because the visitor
 * has already chosen an asset and knows what they want to put in. Someone on
 * this page has not chosen anything yet — that is the entire reason they are
 * here — and asking them for a precise number is asking them to make the
 * decision the form is meant to help with.
 */
export function ManagedPlanForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ManagedPlanFormValues>({
    resolver: zodResolver(managedPlanFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: "",
      amountBand: "5l_25l",
      horizon: "2_4y",
      priority: "income",
      message: "",
      company: "",
    },
  });

  async function onSubmit(values: ManagedPlanFormValues) {
    setSubmitError(null);
    const result = await submitManagedPlanLead(values, {
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
    });

    if (result.success) {
      router.push("/thank-you?type=managed_plan");
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mp-name">Your name</Label>
          <Input
            id="mp-name"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="mp-city">
            City{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="mp-city"
            autoComplete="address-level2"
            placeholder="e.g. Pune"
            aria-invalid={!!errors.city}
            {...register("city")}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mp-phone">Phone number</Label>
          <Input
            id="mp-phone"
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
          <Label htmlFor="mp-email">Email address</Label>
          <Input
            id="mp-email"
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
          <Label htmlFor="mp-amount">Amount you have in mind</Label>
          <select
            id="mp-amount"
            className={SELECT_CLASS}
            aria-invalid={!!errors.amountBand}
            {...register("amountBand")}
          >
            {PLAN_AMOUNT_BANDS.map((band) => (
              <option key={band.value} value={band.value}>
                {band.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mp-horizon">How long you can stay invested</Label>
          <select
            id="mp-horizon"
            className={SELECT_CLASS}
            aria-invalid={!!errors.horizon}
            {...register("horizon")}
          >
            {PLAN_HORIZONS.map((horizon) => (
              <option key={horizon.value} value={horizon.value}>
                {horizon.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mp-priority">What matters more to you</Label>
        <select
          id="mp-priority"
          className={SELECT_CLASS}
          aria-invalid={!!errors.priority}
          {...register("priority")}
        >
          {PLAN_PRIORITIES.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mp-message">
          Anything you want us to know{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="mp-message"
          rows={4}
          placeholder="Questions, constraints, or what has put you off deciding so far."
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
        {isSubmitting || isSubmitSuccessful
          ? "Sending…"
          : "Request the portfolio pack"}
      </Button>

      <p className="text-xs leading-relaxed text-muted-foreground">
        This is an expression of interest, not an application, and nothing is
        payable now. Returns are targeted, not guaranteed, and your capital is
        at risk — read the{" "}
        <Link href="/risk-disclosure" className="underline hover:text-navy">
          risk disclosure
        </Link>
        . By submitting, you agree to your details being handled as described
        in our{" "}
        <Link href="/privacy" className="underline hover:text-navy">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
