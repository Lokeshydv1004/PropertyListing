"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Home, LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminNav } from "@/components/admin/admin-nav";
import { signOutAdmin } from "@/lib/actions/admin-auth";
import type { AdminNavCounts, AdminNavItem } from "@/lib/admin/nav";

/**
 * The console frame: a dark sidebar that stays put, a header carrying
 * identity and the escape hatch back to the public site, and the content
 * area.
 *
 * On mobile the sidebar collapses into the same Sheet the marketing navbar
 * uses. Reusing it is deliberate — a second drawer implementation is a second
 * set of focus-trap and scroll-lock bugs.
 */
export function AdminShell({
  items,
  counts,
  name,
  email,
  role,
  children,
}: {
  items: AdminNavItem[];
  counts: AdminNavCounts;
  name: string;
  email: string;
  role: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const brand = (
    <Link
      href="/admin"
      className="flex items-center gap-2 text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/30 rounded-md"
    >
      <Home className="size-5 text-gold" strokeWidth={2.25} aria-hidden="true" />
      <span className="font-medium">GharShare</span>
      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[0.65rem] font-medium tracking-wide text-white/70 uppercase">
        Admin
      </span>
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-1 bg-muted/40">
      {/*
        Pinned to the viewport, exactly one screen tall.

        `sticky` rather than `fixed`: sticky stays in the flex row, so the
        column keeps its 15rem of width and the content area needs no matching
        margin to avoid sliding underneath it. `h-screen` is what makes the
        navy panel reach the bottom of the window instead of ending wherever
        the nav items happen to stop — without it the sidebar is only as tall
        as its contents on a short page, and as tall as the whole document on
        a long one, scrolling away with it.

        `overflow-y-auto` only bites if the sections ever outgrow a short
        laptop screen; it scrolls the nav within its own column rather than
        letting the last item fall off the bottom.
      */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 overflow-y-auto bg-navy px-3 py-4 md:flex">
        <div className="px-2">{brand}</div>
        <AdminNav items={items} counts={counts} />

        <div className="mt-auto px-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-1 py-2 text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/30"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            View public site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-5" aria-hidden="true" />
                  <span className="sr-only">Open admin menu</span>
                </Button>
              }
            />
            <SheetContent side="left" className="w-3/4 bg-navy sm:max-w-xs">
              <SheetHeader>
                <SheetTitle className="text-white">{brand}</SheetTitle>
              </SheetHeader>
              <div className="px-3">
                <AdminNav
                  items={items}
                  counts={counts}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-navy">{name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {email} · {role}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link href="/" />}
            nativeButton={false}
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Public site
          </Button>

          {/* A form rather than an onClick: sign-out is a mutation, and it
              keeps working if the JS bundle hasn't loaded yet. */}
          <form action={signOutAdmin}>
            <Button variant="outline" size="sm" type="submit">
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </Button>
          </form>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
