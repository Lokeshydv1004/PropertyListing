"use client";

import { useState } from "react";
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

export function InterestForm({
  propertyId,
  minInvestment,
}: {
  propertyId: string;
  minInvestment: string;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
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
      amountInterested: minInvestment,
      message: "",
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
        <CheckCircle2 className="size-10 text-brand-green" />
        <h3 className="text-lg font-semibold text-navy">
          Interest submitted
        </h3>
        <p className="text-sm text-muted-foreground">
          Thanks for your interest. A member of our team will reach out to
          walk you through the next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="interest-name">Full name</Label>
        <Input id="interest-name" placeholder="Your name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="interest-phone">Phone number</Label>
        <Input
          id="interest-phone"
          placeholder="+91 98765 43210"
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
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="interest-amount">Amount interested (₹)</Label>
        <Input
          id="interest-amount"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          suppressHydrationWarning
          placeholder="e.g. 250000"
          {...register("amountInterested")}
        />
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
          {...register("message")}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-destructive">{submitError}</p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand-green text-white hover:bg-brand-green/90"
      >
        {isSubmitting ? "Submitting..." : "Submit Interest"}
      </Button>
    </form>
  );
}
