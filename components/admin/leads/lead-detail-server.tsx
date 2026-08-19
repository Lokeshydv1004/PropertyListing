import { notFound } from "next/navigation";

import { LeadDetail } from "@/components/admin/leads/lead-detail";
import {
  getLead,
  getLeadFilterOptions,
  getLeadNotes,
  getRelatedLeads,
} from "@/lib/queries/admin-leads";
import { requireAdminPage } from "@/lib/auth/admin";

/**
 * Loads one lead and renders the shared detail UI.
 *
 * Used by both the side panel (an intercepting route) and the full page, so
 * the two can never drift — the panel is the same component, not a reduced
 * copy of it that quietly lacks the notes box.
 *
 * Dates are serialised here rather than in the client component: a Date
 * crossing the server/client boundary is fine, but the formatting is
 * timezone-pinned to IST and doing it in one place keeps it that way.
 */
export async function LeadDetailServer({
  id,
  onDeletedHref,
}: {
  id: string;
  /** Where the panel/page should go once the lead is removed. */
  onDeletedHref?: string;
}) {
  const admin = await requireAdminPage();
  const row = await getLead(id);

  if (!row) notFound();

  const [notes, related, options] = await Promise.all([
    getLeadNotes(id),
    getRelatedLeads(id, row.lead.phone),
    getLeadFilterOptions(),
  ]);

  return (
    <LeadDetail
      canDelete={admin.role === "owner"}
      deletedHref={onDeletedHref}
      team={options.team}
      lead={{
        id: row.lead.id,
        name: row.lead.name,
        phone: row.lead.phone,
        email: row.lead.email,
        message: row.lead.message,
        amountInterested: row.lead.amountInterested,
        status: row.lead.status,
        enquiryType: row.lead.enquiryType,
        source: row.lead.source,
        pageUrl: row.lead.pageUrl,
        utmSource: row.lead.utmSource,
        utmMedium: row.lead.utmMedium,
        utmCampaign: row.lead.utmCampaign,
        createdAt: row.lead.createdAt.toISOString(),
        contactedAt: row.lead.contactedAt?.toISOString() ?? null,
        assignedTo: row.lead.assignedTo,
        assigneeName: row.assigneeName,
        legacyNotes: row.lead.notes,
        propertyTitle: row.propertyTitle,
        propertySlug: row.propertySlug,
        propertyCity: row.propertyCity,
      }}
      notes={notes.map((note) => ({
        id: note.id,
        authorName: note.authorName,
        body: note.body,
        createdAt: note.createdAt.toISOString(),
      }))}
      related={related.map((item) => ({
        id: item.id,
        createdAt: item.createdAt.toISOString(),
        status: item.status,
        source: item.source,
        enquiryType: item.enquiryType,
        propertyTitle: item.propertyTitle,
      }))}
    />
  );
}
