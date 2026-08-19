"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitInterestLead } from "@/lib/actions/leads";
import {
  interestFormSchema,
  type InterestFormValues,
} from "@/lib/validation/interest";
import type { ListingType } from "@/db/schema";

const COPY: Record<
  ListingType,
  { cta: string; amountLabel: string; amountHint: string; success: string }
> = {
  fractional: {
    cta: "Register interest",
    amountLabel: "Amount you're considering (₹)",
    amountHint: "Pre-filled with this property's minimum. Adjust as you like.",
    success:
      "An investment advisor will call you within 1 business day with the full documentation. There is no obligation at this stage.",
  },
  sale: {
    cta: "Enquire to buy",
    amountLabel: "Your budget (₹)",
    amountHint: "Optional — helps us tell you if the price has room to move.",
    success:
      "A property advisor will call you within 1 business day to arrange a site visit and share the title documents.",
  },
  rent: {
    cta: "Enquire to lease",
    amountLabel: "Your monthly budget (₹)",
    amountHint: "Optional — helps us shortlist other units in your range.",
    success:
      "A leasing advisor will call you within 1 business day to arrange a site visit and share the draft lease terms.",
  },
};

export function InterestForm({
  propertyId,
  listingType,
  minInvestment,
}: {
  propertyId: string;
  listingType: ListingType;
  minInvestment: string | null;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const copy = COPY[listingType];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  async function onSubmit(values: InterestFormValues) {
    setSubmitError(null);
    const result = await submitInterestLead(propertyId, values);
    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-brand-green-light px-6 py-10 text-center">
        <CheckCircle2 className="size-10 text-brand-green" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-navy">Enquiry received</h3>
        {/* Says when and how, not just "our team will reach out". */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {copy.success}
        </p>
      </div>
    );
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
          placeholder="98765 43210"
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
        <p id="interest-amount-hint" className="text-xs text-muted-foreground">
          {copy.amountHint}
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
        disabled={isSubmitting}
        className="h-11 w-full bg-brand-green text-white hover:bg-brand-green/90"
      >
        {isSubmitting ? "Submitting…" : copy.cta}
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
