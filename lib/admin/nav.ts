import type { AdminRole } from "@/db/schema";

/**
 * The console's navigation, in the order the work actually happens: leads
 * first, because answering them is the time-critical job; settings last,
 * because it is touched twice a year.
 *
 * `phase` records which build phase ships each section. Anything not yet
 * built renders as a disabled row rather than being hidden — the shape of the
 * console is useful information for the team, and a nav item that silently
 * appears one week is more confusing than one that says "soon".
 */
export type AdminNavItem = {
  href: string;
  label: string;
  /** lucide icon name, resolved in the client component. */
  icon: "gauge" | "inbox" | "building-2" | "layers" | "history" | "settings";
  /** Owner-only sections are hidden entirely from staff. */
  ownerOnly?: boolean;
  /** False until the module lands. */
  ready?: boolean;
  /**
   * Which count from `AdminNavCounts` to show as a badge, if any. Only the
   * lead queue has one: a number next to a section you cannot act on is
   * decoration, and a number that is always there stops being read.
   */
  badge?: keyof AdminNavCounts;
};

/** Counts resolved once in the console layout and passed down. */
export type AdminNavCounts = {
  newLeads: number;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: "gauge", ready: true },
  { href: "/admin/leads", label: "Leads", icon: "inbox", ready: true, badge: "newLeads" },
  { href: "/admin/properties", label: "Properties", icon: "building-2", ready: true },
  { href: "/admin/buildings", label: "Buildings", icon: "layers", ready: true },
  { href: "/admin/activity", label: "Activity", icon: "history", ready: true },
  { href: "/admin/settings", label: "Settings", icon: "settings", ownerOnly: true, ready: true },
];

export function navFor(role: AdminRole): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => !item.ownerOnly || role === "owner");
}

/**
 * Longest-prefix match, so /admin/leads/<id> keeps "Leads" highlighted while
 * "/admin" doesn't light up for every route beneath it.
 */
export function isActiveNav(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
