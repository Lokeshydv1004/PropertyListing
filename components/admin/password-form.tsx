"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setAdminPassword } from "@/lib/actions/admin-auth";
import {
  adminSetPasswordSchema,
  type AdminSetPasswordValues,
} from "@/lib/validation/admin-auth";

/**
 * Set or replace your own password.
 *
 * No "current password" field: reaching this page at all required a live
 * session, which means a magic link or an existing password was used minutes
 * ago. Asking again would be theatre.
 */
export function PasswordForm() {
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminSetPasswordValues>({
    resolver: zodResolver(adminSetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit(values: AdminSetPasswordValues) {
    setSubmitError(null);
    setDone(false);

    const result = await setAdminPassword(values);

    if (result.success) {
      setDone(true);
      reset({ password: "", confirm: "" });
    } else {
      setSubmitError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Label htmlFor="new-password">New password</Label>
      <Input
        id="new-password"
        type="password"
        autoComplete="new-password"
        aria-invalid={Boolean(errors.password)}
        className="mt-1.5"
        {...register("password")}
      />
      {errors.password && (
        <p className="mt-1.5 text-sm text-destructive">
          {errors.password.message}
        </p>
      )}

      <Label htmlFor="confirm-password" className="mt-4 block">
        Type it again
      </Label>
      <Input
        id="confirm-password"
        type="password"
        autoComplete="new-password"
        aria-invalid={Boolean(errors.confirm)}
        className="mt-1.5"
        {...register("confirm")}
      />
      {errors.confirm && (
        <p className="mt-1.5 text-sm text-destructive">
          {errors.confirm.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 bg-brand-green text-white hover:bg-brand-green/90"
      >
        {isSubmitting && (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        )}
        Save password
      </Button>

      {done && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-brand-green">
          <Check className="size-4" aria-hidden="true" />
          Saved. You can sign in with it from now on.
        </p>
      )}

      {submitError && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {submitError}
        </p>
      )}
    </form>
  );
}
