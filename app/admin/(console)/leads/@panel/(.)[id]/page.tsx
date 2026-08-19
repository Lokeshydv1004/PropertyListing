import { LeadDetailServer } from "@/components/admin/leads/lead-detail-server";
import { LeadPanel } from "@/components/admin/leads/lead-panel";

/**
 * The side panel. Same data, same component as the full page — it is the
 * detail rendered inside a sheet, not a second implementation of it.
 */
export default async function InterceptedLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <LeadPanel>
      <LeadDetailServer id={id} onDeletedHref="/admin/leads" />
    </LeadPanel>
  );
}
