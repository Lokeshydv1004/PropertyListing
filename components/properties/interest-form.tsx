"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitInterestLead } from "@/lib/actions/leads";
import { formatCompactINR, formatExactINR } from "@/lib/format";
import {
  interestFormSchema,
  type InterestFormValues,
} from "@/lib/validation/interest";
import { cn } from "@/lib/utils";
import type { ListingType } from "@/db/schema";

const COPY: Record<
  ListingType,
  { cta: string; amountLabel: string; amountHint: string }
> = {
  fractional: {
    cta: "Register interest",
    amountLabel: "Amount you're considering (₹)",
    amountHint: "Pre-filled with this property's minimum. Adjust as you like.",
  },
  sale: {
    cta: "Enquire to buy",
    amountLabel: "Your budget (₹)",
    amountHint: "Optional — helps us tell you if the price has room to move.",
  },
  rent: {
    cta: "Enquire to lease",
    amountLabel: "Your monthly budget (₹)",
    amountHint: "Optional — helps us shortlist other units in your range.",
  },
};

/** Multiples of the minimum ticket, for one-tap entry. */
const CHIP_MULTIPLES = [1, 2, 5];

export function InterestForm({
  propertyId,
  propertyTitle,
  listingType,
  minInvestment,
}: {
  propertyId: string;
  propertyTitle: string;
  listingType: ListingType;
  minInvestment: string | null;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const copy = COPY[listingType];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<InterestFormValues>({
    resolver: zodResolver(interestFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      amountInterested:
        listingType === "fractional" ? (minInvestment ?? "") : "",
      message: "",
      company: "",
    },
  });

  // A bare number field gives no feedback on what was typed, and a mistyped
  // zero is the difference between ₹2.5 L and ₹25 L. Echoing the figure back
  // in words catches it before it reaches us.
  const amountValue = useWatch({ control, name: "amountInterested" });
  const amountNumber = Number(amountValue);
  const amountPreview =
    amountValue && Number.isFinite(amountNumber) && amountNumber > 0
      ? `${formatExactINR(amountNumber)} · ${formatCompactINR(amountNumber)}`
      : null;

  const minTicket = minInvestment ? Number(minInvestment) : null;
  const chips =
    listingType === "fractional" && minTicket
      ? CHIP_MULTIPLES.map((multiple) => minTicket * multiple)
      : [];

  async function onSubmit(values: InterestFormValues) {
    setSubmitError(null);
    const result = await submitInterestLead(propertyId, values, {
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
    });

    if (result.success) {
      // A real URL, not an inline panel: without a navigation there is no
      // event for GA4 or an ad platform to attribute the conversion to, and
      // the sidebar has no room to say what actually happens next.
      router.push(
        `/thank-you?type=interest&property=${encodeURIComponent(propertyTitle)}`
      );
    } else {
      setSubmitError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Honeypot: humans never fill a field they cannot see. Positioned
          off-screen rather than display:none, which some bots skip. */}
      <input
        {...register("company")}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] size-0 opacity-0"
      />

      <div className="space-y-2">
        <Label htmlFor="interest-name">Full name</Label>
        <Input
          id="interest-name"
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
        <Label htmlFor="interest-phone">Phone number</Label>
        <Input
          id="interest-phone"
          // type=tel + inputMode brings up the numeric keypad on mobile;
          // this was a plain text field showing a full QWERTY keyboard.
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
        <Label htmlFor="interest-email">Email address</Label>
        <Input
          id="interest-email"
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

      <div className="space-y-2">
        <Label htmlFor="interest-amount">{copy.amountLabel}</Label>
        <Input
          id="interest-amount"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          suppressHydrationWarning
          placeholder="e.g. 250000"
          aria-invalid={!!errors.amountInterested}
          aria-describedby="interest-amount-hint"
          {...register("amountInterested")}
        />

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {chips.map((amount, index) => {
              const selected = Number(amountValue) === amount;
              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() =>
                    setValue("amountInterested", String(amount), {
                      shouldValidate: true,
                    })
                  }
                  aria-pressed={selected}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    selected
                      ? "border-brand-green bg-brand-green-light text-brand-green"
                      : "border-border bg-card text-foreground/75 hover:border-brand-green hover:text-navy"
                  )}
                >
                  {formatCompactINR(amount)}
                  {index === 0 && (
                    <span className="ml-1 text-muted-foreground">min</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <p
          id="interest-amount-hint"
          className="text-xs text-muted-foreground"
          aria-live="polite"
        >
          {amountPreview ?? copy.amountHint}
        </p>
        {errors.amountInterested && (
          <p className="text-sm text-destructive">
            {errors.amountInterested.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="interest-message">Message (optional)</Label>
        <Textarea
          id="interest-message"
          rows={3}
          placeholder="Any questions for our team?"
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}

      <Button
        type="submit"
        // Stays disabled through the redirect too — the navigation is not
        // instant, and a second submit here creates a duplicate lead.
        disabled={isSubmitting || isSubmitSuccessful}
        className="h-11 w-full bg-brand-green text-white hover:bg-brand-green/90"
      >
        {isSubmitting || isSubmitSuccessful ? "Submitting…" : copy.cta}
      </Button>

      {/* Replaces "Your data is safe with us" — a claim with nothing behind
          it — with the notice and consent the DPDP Act 2023 expects. */}
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        By submitting, you agree to be contacted about this property and to your
        details being handled as described in our{" "}
        <Link href="/privacy" className="underline hover:text-navy">
          Privacy Policy
        </Link>
        . We never sell your data.
      </p>
    </form>
  );
}
