"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  sendAdminMagicLink,
  signInWithAdminPassword,
} from "@/lib/actions/admin-auth";
import {
  adminLoginSchema,
  adminPasswordLoginSchema,
  type AdminLoginValues,
  type AdminPasswordLoginValues,
} from "@/lib/validation/admin-auth";

type Mode = "password" | "link";

/**
 * Two ways in, sharing one allowlist.
 *
 * Password is the default because it is the one you use every day; the link
 * is one tap away for a new team member who has no password yet, and for
 * anyone who has forgotten theirs. That second case is why there is no
 * separate password-reset flow — the link already is one.
 */
export function AdminLoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>("password");

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div
        role="tablist"
        aria-label="How to sign in"
        className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
      >
        <Tab
          active={mode === "password"}
          onClick={() => setMode("password")}
          label="Password"
        />
        <Tab
          active={mode === "link"}
          onClick={() => setMode("link")}
          label="Email a link"
        />
      </div>

      {mode === "password" ? (
        <PasswordForm next={next} onNoPassword={() => setMode("link")} />
      ) : (
        <MagicLinkForm next={next} />
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-background font-medium text-navy shadow-sm"
          : "text-muted-foreground hover:text-navy"
      )}
    >
      {label}
    </button>
  );
}

function PasswordForm({
  next,
  onNoPassword,
}: {
  next: string;
  onNoPassword: () => void;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminPasswordLoginValues>({
    resolver: zodResolver(adminPasswordLoginSchema),
    defaultValues: { email: "", password: "", next },
  });

  async function onSubmit(values: AdminPasswordLoginValues) {
    setSubmitError(null);

    const result = await signInWithAdminPassword({ ...values, next });

    if (result.success) {
      // A full navigation, not router.push: the session cookie was set by the
      // action, and the layout's guard has to run against it server-side.
      router.push(next);
      router.refresh();
    } else {
      setSubmitError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Label htmlFor="admin-email">Work email</Label>
      <Input
        id="admin-email"
        type="email"
        autoComplete="username"
        placeholder="you@gharshare.in"
        aria-invalid={Boolean(errors.email)}
        className="mt-1.5"
        {...register("email")}
      />
      {errors.email && (
        <p className="mt-1.5 text-sm text-destructive">{errors.email.message}</p>
      )}

      <Label htmlFor="admin-password" className="mt-4 block">
        Password
      </Label>
      <Input
        id="admin-password"
        type="password"
        autoComplete="current-password"
        aria-invalid={Boolean(errors.password)}
        className="mt-1.5"
        {...register("password")}
      />
      {errors.password && (
        <p className="mt-1.5 text-sm text-destructive">
          {errors.password.message}
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
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>

      {submitError && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {submitError}
        </p>
      )}

      {/* No password yet, or forgotten: the link is the answer to both. */}
      <p className="mt-4 text-xs text-muted-foreground">
        No password yet, or forgotten it?{" "}
        <button
          type="button"
          onClick={onNoPassword}
          className="text-navy underline underline-offset-2"
        >
          Email me a link instead
        </button>{" "}
        — you can set a password once you&apos;re in.
      </p>
    </form>
  );
}

function MagicLinkForm({ next }: { next: string }) {
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
      <div className="text-center">
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
          a sign-in link is on its way. It expires shortly, so use it soon —
          and open it in this browser.
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Label htmlFor="admin-link-email">Work email</Label>
      <Input
        id="admin-link-email"
        type="email"
        autoComplete="email"
        placeholder="you@gharshare.in"
        aria-invalid={Boolean(errors.email)}
        className="mt-1.5"
        {...register("email")}
      />
      {errors.email && (
        <p className="mt-1.5 text-sm text-destructive">{errors.email.message}</p>
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
        No password needed. Access is by invitation — ask an owner to add your
        address.
      </p>
    </form>
  );
}
