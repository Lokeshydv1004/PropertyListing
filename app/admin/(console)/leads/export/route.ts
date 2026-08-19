import type { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/auth/admin";
import { logActivity } from "@/lib/admin/activity";
import {
  labelForEnquiryType,
  labelForSource,
  parseLeadFilters,
} from "@/lib/admin/leads-filters";
import { listLeads } from "@/lib/queries/admin-leads";

/**
 * The current filtered view, as a CSV.
 *
 * A route handler, not a Server Action, because the browser has to receive a
 * file — and like every other admin endpoint it is publicly reachable, so it
 * guards itself. Skipping that here would make the whole lead database
 * downloadable by anyone who guessed the URL, which is a worse leak than any
 * single page in the console.
 */

const COLUMNS = {
  name: { header: "Name", value: (row: Row) => row.name },
  phone: { header: "Phone", value: (row: Row) => row.phone },
  email: { header: "Email", value: (row: Row) => row.email },
  type: {
    header: "Enquiry type",
    value: (row: Row) => labelForEnquiryType(row.enquiryType),
  },
  source: { header: "Source", value: (row: Row) => labelForSource(row.source) },
  property: { header: "Property", value: (row: Row) => row.propertyTitle ?? "" },
  amount: {
    header: "Amount interested",
    value: (row: Row) => row.amountInterested ?? "",
  },
  status: { header: "Status", value: (row: Row) => row.status },
  assignee: { header: "Assigned to", value: (row: Row) => row.assigneeName ?? "" },
  created: {
    header: "Received",
    value: (row: Row) =>
      row.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  },
  contacted: {
    header: "First contacted",
    value: (row: Row) =>
      row.contactedAt?.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) ?? "",
  },
} as const;

type Row = Awaited<ReturnType<typeof listLeads>>["rows"][number];
type ColumnKey = keyof typeof COLUMNS;

const DEFAULT_COLUMNS: ColumnKey[] = [
  "name",
  "phone",
  "email",
  "type",
  "source",
  "property",
  "amount",
  "status",
  "created",
];

/**
 * Excel and Google Sheets both treat a leading =, +, - or @ as a formula.
 * A lead whose name is "=cmd|..." is a real attack on whoever opens the
 * export, and the person opening it is us.
 */
function csvCell(value: string): string {
  const escaped = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${escaped.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return new Response(guard.error, { status: 403 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const filters = parseLeadFilters(params);

  const requested = (params.cols ?? "")
    .split(",")
    .filter((key): key is ColumnKey => key in COLUMNS);
  const columns = requested.length > 0 ? requested : DEFAULT_COLUMNS;

  // Export means the whole filtered set, not the page you happen to be on.
  // 5000 is a ceiling rather than a target — it exists so a runaway filter
  // cannot try to stream the entire table into a serverless function.
  const all: Row[] = [];
  for (let page = 1; page <= 100; page++) {
    const { rows, hasNext } = await listLeads({ ...filters, page });
    all.push(...rows);
    if (!hasNext || all.length >= 5000) break;
  }

  const lines = [
    columns.map((key) => csvCell(COLUMNS[key].header)).join(","),
    ...all.map((row) =>
      columns.map((key) => csvCell(String(COLUMNS[key].value(row)))).join(",")
    ),
  ];

  await logActivity({
    actor: guard.user,
    action: "update",
    entityType: "lead",
    entityLabel: `Exported ${all.length} leads`,
  });

  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(`﻿${lines.join("\r\n")}`, {
    headers: {
      // The BOM above is what makes Excel read it as UTF-8 rather than
      // mangling every name with an accent in it.
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="leads-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
