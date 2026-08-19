"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Phone, Users } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  isCallable,
  telHrefFor,
  whatsappHrefFor,
} from "@/lib/admin/lead-contact";
import {
  labelForEnquiryType,
  labelForSource,
} from "@/lib/admin/leads-filters";
import { formatCompactINR } from "@/lib/format";

export type LeadTableRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  amountInterested: string | null;
  status: string;
  enquiryType: string;
  source: string | null;
  createdAt: string;
  propertySlug: string | null;
  propertyTitle: string | null;
  assigneeName: string | null;
  duplicateCount: number;
  noteCount: number;
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-brand-green-light text-brand-green",
  contacted: "bg-gold-light text-gold-700",
  closed: "bg-muted text-muted-foreground",
};

/**
 * "2h ago" beats a timestamp here.
 *
 * The only question being asked of this column is "how long has this person
 * been waiting", and a clock time makes you do the subtraction yourself on
 * every row.
 */
function relativeTime(value: string): string {
  const then = new Date(value).getTime();
  const minutes = Math.round((Date.now() - then) / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}

/** Older than 48h and still untouched is the thing worth noticing. */
function isStale(row: LeadTableRow): boolean {
  if (row.status !== "new") return false;
  return Date.now() - new Date(row.createdAt).getTime() > 48 * 60 * 60 * 1000;
}

export function LeadsTable({ rows }: { rows: LeadTableRow[] }) {
  const router = useRouter();
  const [cursor, setCursor] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const open = useCallback(
    (id: string) => router.push(`/admin/leads/${id}`),
    [router]
  );

  /**
   * j/k/Enter, and "/" to jump to search.
   *
   * This queue is worked fast and repetitively — down, read, call, down. Any
   * of it that requires the mouse is paid for on every single lead.
   */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (event.key === "/" && !typing) {
        event.preventDefault();
        document.getElementById("lead-search")?.focus();
        return;
      }

      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (rows.length === 0) return;

      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        setCursor((current) => Math.min(current + 1, rows.length - 1));
      } else if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        setCursor((current) => Math.max(current - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const row = rows[cursor];
        if (row) open(row.id);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [rows, cursor, open]);

  // Keep the highlighted row on screen when moving through a long page.
  useEffect(() => {
    containerRef.current
      ?.querySelector(`[data-row-index="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Nothing matches this view.
      </p>
    );
  }

  return (
    <div ref={containerRef}>
      {/* Phone layout. The team answers leads on their phones, so this is a
          first-class view rather than a squeezed table. */}
      <ul className="space-y-2 md:hidden">
        {rows.map((row, index) => (
          <li
            key={row.id}
            data-row-index={index}
            className="rounded-xl border border-border bg-card p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/admin/leads/${row.id}`}
                className="font-medium text-navy underline-offset-2 hover:underline"
              >
                {row.name}
              </Link>
              <StatusBadge status={row.status} stale={isStale(row)} />
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {labelForEnquiryType(row.enquiryType)} ·{" "}
              {labelForSource(row.source)} · {relativeTime(row.createdAt)}
            </p>

            {row.propertyTitle && (
              <p className="mt-1 text-sm text-navy">{row.propertyTitle}</p>
            )}

            {isCallable(row.phone) && (
              <div className="mt-3 flex gap-2">
                <a
                  href={telHrefFor(row.phone)}
                  className="flex-1 rounded-lg bg-brand-green py-2 text-center text-sm font-medium text-white"
                >
                  Call
                </a>
                <a
                  href={whatsappHrefFor(row.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg border border-border py-2 text-center text-sm font-medium text-navy"
                >
                  WhatsApp
                </a>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="hidden rounded-xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Property</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={row.id}
                data-row-index={index}
                onClick={() => {
                  setCursor(index);
                  open(row.id);
                }}
                className={cn(
                  "cursor-pointer",
                  index === cursor && "bg-brand-green-light/50"
                )}
              >
                <TableCell className="font-medium text-navy">
                  <span className="flex items-center gap-1.5">
                    {row.name}
                    {row.duplicateCount > 0 && (
                      <span
                        className="inline-flex items-center gap-0.5 rounded bg-gold-light px-1 text-xs text-gold-700"
                        title={`${row.duplicateCount} other enquiries from this number`}
                      >
                        <Users className="size-3" aria-hidden="true" />
                        {row.duplicateCount}
                      </span>
                    )}
                    {row.noteCount > 0 && (
                      <span
                        className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"
                        title={`${row.noteCount} notes`}
                      >
                        <MessageSquare className="size-3" aria-hidden="true" />
                        {row.noteCount}
                      </span>
                    )}
                  </span>
                  {row.assigneeName && (
                    <span className="block text-xs font-normal text-muted-foreground">
                      {row.assigneeName}
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  {isCallable(row.phone) ? (
                    <a
                      href={telHrefFor(row.phone)}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-1 text-navy underline-offset-2 hover:underline"
                    >
                      <Phone className="size-3" aria-hidden="true" />
                      {row.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{row.phone}</span>
                  )}
                </TableCell>

                <TableCell>{labelForEnquiryType(row.enquiryType)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {labelForSource(row.source)}
                </TableCell>

                <TableCell className="max-w-[16rem] truncate">
                  {row.propertyTitle ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {row.amountInterested
                    ? formatCompactINR(Number(row.amountInterested))
                    : "—"}
                </TableCell>

                <TableCell
                  className="whitespace-nowrap text-muted-foreground"
                  title={new Date(row.createdAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}
                >
                  {relativeTime(row.createdAt)}
                </TableCell>

                <TableCell>
                  <StatusBadge status={row.status} stale={isStale(row)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="mt-3 hidden text-xs text-muted-foreground md:block">
        <kbd className="rounded border border-border px-1">j</kbd>{" "}
        <kbd className="rounded border border-border px-1">k</kbd> to move,{" "}
        <kbd className="rounded border border-border px-1">Enter</kbd> to open,{" "}
        <kbd className="rounded border border-border px-1">/</kbd> to search.
      </p>
    </div>
  );
}

function StatusBadge({ status, stale }: { status: string; stale: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Badge
        className={cn(
          "border-transparent capitalize",
          STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
        )}
      >
        {status}
      </Badge>
      {/* Text, not colour alone — "48h+" is legible to everyone. */}
      {stale && (
        <span className="rounded bg-destructive/10 px-1 text-xs font-medium text-destructive">
          48h+
        </span>
      )}
    </span>
  );
}
