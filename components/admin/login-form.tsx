"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendAdminMagicLink } from "@/lib/actions/admin-auth";
import {
  adminLoginSchema,
  type AdminLoginValues,
} from "@/lib/validation/admin-auth";

export function AdminLoginForm({ next }: { next: string }) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", next },
  });

  async function onSubmit(values: AdminLoginValues) {
    setSubmitError(null);

    const result = await sendAdminMagicLink({ ...values, next });

    if (result.success) {
      setSentTo(values.email);
    } else {
      setSubmitError(result.error);
    }
  }

  if (sentTo) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <MailCheck
          className="mx-auto size-8 text-brand-green"
          aria-hidden="true"
        />
        <h2 className="mt-3 font-medium text-navy">Check your email</h2>
        {/*
          Says "if that address has access" rather than confirming it does.
          The form must not become a way to test which addresses work here.
        */}
        <p className="mt-2 text-sm text-muted-foreground">
          If <span className="font-medium text-navy">{sentTo}</span> has access,
          a sign-in link is on its way. It expires shortly, so use it soon.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => setSentTo(null)}
        >
          Use a different address
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-border bg-card p-6"
      noValidate
    >
      <Label htmlFor="admin-email">Work email</Label>
      <Input
        id="admin-email"
        type="email"
        autoComplete="email"
        autoFocus
        placeholder="you@gharshare.in"
        aria-invalid={Boolean(errors.email)}
        aria-describedby={errors.email ? "admin-email-error" : undefined}
        className="mt-1.5"
        {...register("email")}
      />
      {errors.email && (
        <p id="admin-email-error" className="mt-1.5 text-sm text-destructive">
          {errors.email.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full bg-brand-green text-white hover:bg-brand-green/90"
        size="lg"
      >
        {isSubmitting && (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        )}
        {isSubmitting ? "Sending link…" : "Email me a sign-in link"}
      </Button>

      {submitError && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        There is no password. Access is by invitation — ask an owner to add
        your address.
      </p>
    </form>
  );
}
