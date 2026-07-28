"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactLead } from "@/lib/actions/leads";
import {
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
    defaultValues: { name: "", phone: "", email: "", message: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    setSubmitError(null);
    const result = await submitContactLead(values);
    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-brand-green-light px-6 py-12 text-center">
        <CheckCircle2 className="size-10 text-brand-green" />
        <h3 className="text-lg font-semibold text-navy">
          Thanks for reaching out
        </h3>
        <p className="max-w-sm text-muted-foreground">
          We&apos;ve received your enquiry and a member of our team will get
          back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" placeholder="Your name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" placeholder="+91 98765 43210" {...register("phone")} />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
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
        className="w-full bg-brand-green text-white hover:bg-brand-green/90 sm:w-auto"
      >
        {isSubmitting ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
