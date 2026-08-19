"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { whatsappHref } from "@/lib/site-config";

/**
 * The "Login" button was a link to /contact.
 *
 * There is no authentication in this project, by design. A visitor who clicks
 * Login expecting an account and lands on a lead form reads it as a
 * bait-and-switch, assumes their session broke, and starts asking "where is
 * my dashboard?" — a question the site cannot answer. Replaced with the
 * highest-converting honest alternative: a direct line to a human.
 */
const ADVISOR_MESSAGE =
  "Hi GharShare — I'd like to speak to an advisor about investing.";

const NAV_LINKS = [
  { href: "/properties", label: "Properties" },
  // Second, not buried at the end: it is the answer to "which one do I
  // choose?", and that question is asked while the visitor is looking at
  // Properties — the link next to it.
  { href: "/invest-with-us", label: "Managed Portfolio" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
];
// "Why GharShare" and "FAQ" are deliberately absent from the header. Both are
// still reachable — Why GharShare from the home page section itself, FAQ from
// the footer and the home-page FAQ teaser — but with the managed portfolio
// added, seven top-level links crowded the bar and pushed the two links that
// actually convert (Properties, Managed Portfolio) into the noise.

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled;
  const ctaLabel = pathname?.startsWith("/properties")
    ? "Explore Investments"
    : "Explore Properties";

  return (
    <header
      className={cn(
        "fixed top-0 z-40 w-full transition-colors duration-300",
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border bg-cream/95 backdrop-blur supports-backdrop-filter:bg-cream/80"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1340px] items-center justify-between px-6 sm:px-8 lg:px-10">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 text-[24px] font-bold transition-colors",
            transparent ? "text-white" : "text-navy"
          )}
        >
          <Home
            className={cn(
              "size-6",
              transparent ? "text-gold" : "text-gold-700"
            )}
            strokeWidth={2.25}
            aria-hidden="true"
          />
          GharShare
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-[30px]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[15px] font-medium transition-colors",
                transparent
                  ? "text-white/90 hover:text-white"
                  : "text-foreground/70 hover:text-navy"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            render={
              <Link
                href={whatsappHref(ADVISOR_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
            variant="outline"
            className={cn(
              "h-10 rounded-[12px] px-4 text-sm",
              transparent
                ? "border-white/35 bg-transparent text-white hover:bg-white/10"
                : "border-border bg-background text-foreground"
            )}
          >
            Talk to an advisor
          </Button>
          <Button
            render={<Link href="/properties" />}
            nativeButton={false}
            className="h-[42px] rounded-[12px] bg-gold px-4 text-sm text-navy hover:bg-gold/90"
          >
            {ctaLabel}
          </Button>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "md:hidden",
                  transparent && "text-white hover:bg-white/10 hover:text-white"
                )}
                aria-label="Open menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-3/4 sm:max-w-sm">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-navy">
                <Home
                  className="size-5 text-gold-700"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
                GharShare
              </SheetTitle>
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
            <div className="mt-2 flex flex-col gap-2 px-4">
              <SheetClose
                nativeButton={false}
                render={
                  <Button
                    render={
                      <Link
                        href={whatsappHref(ADVISOR_MESSAGE)}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    nativeButton={false}
                    variant="outline"
                    className="w-full"
                  />
                }
              >
                Talk to an advisor
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Button
                    render={<Link href="/properties" />}
                    nativeButton={false}
                    className="w-full bg-gold text-navy hover:bg-gold/90"
                  />
                }
              >
                {ctaLabel}
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
