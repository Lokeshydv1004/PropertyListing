"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Gauge,
  History,
  Inbox,
  Layers,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  isActiveNav,
  type AdminNavCounts,
  type AdminNavItem,
} from "@/lib/admin/nav";

const ICONS: Record<AdminNavItem["icon"], LucideIcon> = {
  gauge: Gauge,
  inbox: Inbox,
  "building-2": Building2,
  layers: Layers,
  history: History,
  settings: Settings,
};

/**
 * The console's section list, shared by the desktop sidebar and the mobile
 * sheet. `onNavigate` lets the sheet close itself on a tap; the sidebar
 * passes nothing.
 */
export function AdminNav({
  items,
  counts,
  onNavigate,
}: {
  items: AdminNavItem[];
  counts: AdminNavCounts;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Admin sections">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActiveNav(pathname, item.href);
        const badge = item.badge ? counts[item.badge] : 0;

        if (!item.ready) {
          return (
            <span
              key={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/35"
              // Not a link and not focusable: there is nothing there yet.
              aria-disabled="true"
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
              <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[0.65rem] font-medium tracking-wide text-white/50 uppercase">
                Soon
              </span>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/30",
              active
                ? "bg-white/15 font-medium text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
            {badge > 0 && (
              <span
                className="ml-auto rounded-full bg-gold px-1.5 py-0.5 text-[0.65rem] font-semibold text-navy tabular-nums"
                // Announced as words, since the number alone reads as
                // meaningless to a screen reader.
                aria-label={`${badge} unworked`}
              >
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
