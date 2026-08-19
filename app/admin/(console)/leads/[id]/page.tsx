import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LeadDetailServer } from "@/components/admin/leads/lead-detail-server";

export const metadata: Metadata = { title: "Lead" };

export const dynamic = "force-dynamic";

/**
 * The full page, reached by opening a lead link directly or refreshing on
 * one. From inside the queue the same URL is intercepted into a side panel.
 */
export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to leads
      </Link>

      <div className="mt-4">
        <LeadDetailServer id={id} onDeletedHref="/admin/leads" />
      </div>
    </div>
  );
}
