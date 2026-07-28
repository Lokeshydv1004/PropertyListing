"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/properties", label: "Properties" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-navy"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-sm font-bold text-white">
            G
          </span>
          GharShare
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button
            render={<Link href="/properties" />}
            nativeButton={false}
            className="bg-brand-green text-white hover:bg-brand-green/90"
          >
            Browse Properties
          </Button>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-3/4 sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>GharShare</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <SheetClose
                  key={link.href}
                  nativeButton={false}
                  render={
                    <Link
                      href={link.href}
                      className="rounded-md px-3 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-navy"
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
            </nav>
            <div className="mt-2 px-4">
              <SheetClose
                nativeButton={false}
                render={
                  <Button
                    render={<Link href="/properties" />}
                    nativeButton={false}
                    className="w-full bg-brand-green text-white hover:bg-brand-green/90"
                  />
                }
              >
                Browse Properties
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
