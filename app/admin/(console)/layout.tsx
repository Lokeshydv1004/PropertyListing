import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/auth/admin";
import { navFor } from "@/lib/admin/nav";
import { getLeadCounts } from "@/lib/queries/admin-leads";

/**
 * Layer two of the three-layer guard.
 *
 * proxy.ts has already bounced anyone without a session, but it only read a
 * cookie. This resolves the actual admin row server-side, which is what
 * catches an account deactivated after its session was issued — and because
 * it runs before any child renders, a signed-out visitor never sees a flash
 * of console chrome.
 *
 * Layer three is `requireAdmin()` inside every Server Action. Neither of the
 * first two protects those: an action is a public endpoint with a guessable
 * id, reachable without ever loading a page.
 */
export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminPage();
  // One count for the whole shell. It is the number the team steers by, so
  // it belongs where they can see it from every page.
  const counts = await getLeadCounts();

  return (
    <AdminShell
      items={navFor(admin.role)}
      counts={{ newLeads: counts.newLeads }}
      name={admin.name}
      email={admin.email}
      role={admin.role}
    >
      {children}
    </AdminShell>
  );
}
