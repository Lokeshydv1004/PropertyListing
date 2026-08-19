"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitNotifySignup } from "@/lib/actions/leads";
import {
  notifyFormSchema,
  type NotifyFormValues,
} from "@/lib/validation/notify";
import { cn } from "@/lib/utils";

/**
 * One input, one button, inline success.
 *
 * "Notify Me" used to be a link to /contact, where an email alert cost the
 * visitor a name, a phone number, an enquiry type and a message box. That is
 * far more friction than the action is worth to them, and the completion rate
 * reflected it. Nothing here leaves the page.
 */
export function NotifyForm({
  variant = "dark",
  className,
}: {
  /** "dark" sits on the navy panel; "light" on the mobile bar. */
  variant?: "dark" | "light";
  className?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NotifyFormValues>({
    resolver: zodResolver(notifyFormSchema),
    defaultValues: { email: "", company: "" },
  });

  async function onSubmit(values: NotifyFormValues) {
    setSubmitError(null);
    const result = await submitNotifySignup(values, {
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
    });
    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error);
    }
  }

  const onDark = variant === "dark";

  if (submitted) {
    return (
      <p
        className={cn(
          "flex items-center gap-2 text-sm",
          onDark ? "text-white" : "text-brand-green",
          className
        )}
      >
        <Check className="size-4 shrink-0" aria-hidden="true" />
        You&apos;re on the list. We&apos;ll email you when new properties list.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("w-full", className)}
      noValidate
    >
      {/* Honeypot — see interest-form for the rationale. */}
      <input
        {...register("company")}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] size-0 opacity-0"
      />

      <div className="flex gap-2">
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-label="Email address for new property alerts"
          aria-invalid={!!errors.email}
          className={cn(
            "h-11 min-w-0 flex-1",
            onDark &&
              "border-white/20 bg-white/10 text-white placeholder:text-white/50"
          )}
          {...register("email")}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "h-11 shrink-0 px-4",
            onDark
              ? "bg-gold text-navy hover:bg-gold/90"
              : "bg-brand-green text-white hover:bg-brand-green/90"
          )}
        >
          {isSubmitting ? "…" : "Notify me"}
        </Button>
      </div>

      {(errors.email || submitError) && (
        <p
          role="alert"
          className={cn(
            "mt-2 text-xs",
            onDark ? "text-gold" : "text-destructive"
          )}
        >
          {errors.email?.message ?? submitError}
        </p>
      )}
    </form>
  );
}
