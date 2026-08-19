import Link from "next/link";

import { ADMIN_ACTIONS } from "@/db/schema";

export type ActivityEntry = {
  id: string;
  actorEmail: string;
  actorName: string | null;
  action: string;
  entityType?: string;
  entityId?: string | null;
  entityLabel?: string | null;
  changedFields: unknown;
  createdAt: string;
};

/** Past-tense phrasing, so a row reads as a sentence rather than a token. */
const ACTION_VERB: Record<string, string> = {
  sign_in: "signed in",
  create: "created",
  update: "updated",
  publish: "published",
  unpublish: "unpublished",
  archive: "archived",
  delete: "removed",
  lead_status: "changed the status of",
  lead_note: "added a note to",
};

export const ACTION_OPTIONS = ADMIN_ACTIONS.map((action) => ({
  value: action,
  label: ACTION_VERB[action] ?? action,
}));

function formatWhen(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

/** Where a log entry's subject lives now, when it still exists. */
function hrefFor(entry: ActivityEntry): string | null {
  if (!entry.entityId) return null;

  switch (entry.entityType) {
    case "property":
      return `/admin/properties/${entry.entityId}`;
    case "lead":
      return `/admin/leads/${entry.entityId}`;
    case "building":
      return `/admin/buildings/${entry.entityId}`;
    default:
      return null;
  }
}

function summarise(changed: unknown): string[] {
  if (!changed || typeof changed !== "object") return [];

  return Object.entries(changed as Record<string, { from: unknown; to: unknown }>)
    .slice(0, 6)
    .map(([field, change]) => {
      const from = format(change?.from);
      const to = format(change?.to);
      return `${field}: ${from} → ${to}`;
    });
}

function format(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (typeof value === "boolean") return value ? "yes" : "no";

  const text = String(value);
  return text.length > 40 ? `${text.slice(0, 40)}…` : text;
}

export function ActivityList({
  entries,
  showEntity = true,
}: {
  entries: ActivityEntry[];
  /** Off on a per-entity History tab, where it would repeat every row. */
  showEntity?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Nothing recorded yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {entries.map((entry) => {
        const href = showEntity ? hrefFor(entry) : null;
        const changes = summarise(entry.changedFields);

        return (
          <li key={entry.id} className="px-4 py-3">
            <p className="text-sm text-navy">
              <span className="font-medium">
                {entry.actorName ?? entry.actorEmail}
              </span>{" "}
              {ACTION_VERB[entry.action] ?? entry.action}
              {showEntity && entry.entityLabel && (
                <>
                  {" "}
                  {href ? (
                    <Link
                      href={href}
                      className="underline-offset-2 hover:underline"
                    >
                      {entry.entityLabel}
                    </Link>
                  ) : (
                    <span>{entry.entityLabel}</span>
                  )}
                </>
              )}
            </p>

            {changes.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {changes.map((change) => (
                  <li
                    key={change}
                    className="font-mono text-xs text-muted-foreground"
                  >
                    {change}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-1 text-xs text-muted-foreground">
              {formatWhen(entry.createdAt)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
