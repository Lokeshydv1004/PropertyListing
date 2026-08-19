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
import { submitContactLead } from "@/lib/actions/leads";
import {
  ENQUIRY_TYPES,
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validation/contact";

export function ContactForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      enquiryType: "investor",
      message: "",
      company: "",
    },
  });

  async function onSubmit(values: ContactFormValues) {
    setSubmitError(null);
    const result = await submitContactLead(values, {
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
    });
    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-brand-green-light px-6 py-12 text-center">
        <CheckCircle2 className="size-10 text-brand-green" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-navy">
          Thanks for reaching out
        </h3>
        <p className="max-w-sm text-muted-foreground">
          We&apos;ve received your enquiry. A member of our team will get back to
          you within one business day.
        </p>
      </div>
    );
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
        <Label htmlFor="enquiryType">What can we help with?</Label>
        <select
          id="enquiryType"
          aria-invalid={!!errors.enquiryType}
          className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-invalid:border-destructive"
          {...register("enquiryType")}
        >
          {ENQUIRY_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.enquiryType && (
          <p className="text-sm text-destructive">
            {errors.enquiryType.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
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
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
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
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
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

      <div className="space-y-2">
        <Label htmlFor="message">Message (optional)</Label>
        <Textarea
          id="message"
          rows={4}
          placeholder="Tell us what you're looking for..."
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

      {/* Full-size and full-width on mobile. This was the default h-8 button —
          the smallest on the site, on the page's only conversion point. */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full bg-brand-green px-8 text-white hover:bg-brand-green/90 sm:w-auto"
      >
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>

      <p className="text-xs leading-relaxed text-muted-foreground">
        By submitting, you agree to your details being handled as described in
        our{" "}
        <Link href="/privacy" className="underline hover:text-navy">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
