import type { Metadata } from "next";
import Link from "next/link";

import {
  ACTION_OPTIONS,
  ActivityList,
} from "@/components/admin/activity-list";
import {
  ACTIVITY_PAGE_SIZE,
  activityFiltersToQuery,
  getActivityActors,
  listActivity,
  parseActivityFilters,
} from "@/lib/queries/admin-activity";

export const metadata: Metadata = { title: "Activity" };

export const dynamic = "force-dynamic";

const ENTITY_OPTIONS = [
  { value: "property", label: "Listings" },
  { value: "lead", label: "Leads" },
  { value: "building", label: "Buildings" },
  { value: "admin_user", label: "Team" },
];

/**
 * Read-only, by design.
 *
 * An audit log you can edit answers nothing. There is no delete, no bulk
 * clear and no filter that hides entries permanently — the whole value is
 * that it says what happened even when that is inconvenient.
 */
export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseActivityFilters(await searchParams);

  const [{ rows, hasNext }, actors] = await Promise.all([
    listActivity(filters),
    getActivityActors(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-navy">Activity</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Who changed what, and what it said before. Read-only.
        </p>
      </div>

      {/* Plain links, not a client component: this page has three filters and
          no interactivity beyond them. */}
      <div className="flex flex-wrap gap-2 text-sm">
        <FilterGroup
          label="Everyone"
          active={!filters.actor}
          href={`/admin/activity${activityFiltersToQuery(filters, { actor: "", page: 1 })}`}
          options={actors
            .filter((actor) => actor.id)
            .map((actor) => ({
              label: actor.name ?? actor.email,
              value: actor.id!,
              active: filters.actor === actor.id,
              href: `/admin/activity${activityFiltersToQuery(filters, { actor: actor.id!, page: 1 })}`,
            }))}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <FilterGroup
          label="Everything"
          active={!filters.entityType}
          href={`/admin/activity${activityFiltersToQuery(filters, { entityType: "", page: 1 })}`}
          options={ENTITY_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value,
            active: filters.entityType === option.value,
            href: `/admin/activity${activityFiltersToQuery(filters, { entityType: option.value, page: 1 })}`,
          }))}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <FilterGroup
          label="Any action"
          active={!filters.action}
          href={`/admin/activity${activityFiltersToQuery(filters, { action: "", page: 1 })}`}
          options={ACTION_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value,
            active: filters.action === option.value,
            href: `/admin/activity${activityFiltersToQuery(filters, { action: option.value, page: 1 })}`,
          }))}
        />
      </div>

      <ActivityList
        entries={rows.map((row) => ({
          id: row.id,
          actorEmail: row.actorEmail,
          actorName: row.actorName,
          action: row.action,
          entityType: row.entityType,
          entityId: row.entityId,
          entityLabel: row.entityLabel,
          changedFields: row.changedFields,
          createdAt: row.createdAt.toISOString(),
        }))}
      />

      {(filters.page > 1 || hasNext) && (
        <div className="flex items-center justify-between text-sm">
          {filters.page > 1 ? (
            <Link
              href={`/admin/activity${activityFiltersToQuery(filters, { page: filters.page - 1 })}`}
              className="text-navy hover:underline"
            >
              ← Newer
            </Link>
          ) : (
            <span className="text-muted-foreground/50">← Newer</span>
          )}

          <span className="text-muted-foreground">
            Page {filters.page} · {ACTIVITY_PAGE_SIZE} per page
          </span>

          {hasNext ? (
            <Link
              href={`/admin/activity${activityFiltersToQuery(filters, { page: filters.page + 1 })}`}
              className="text-navy hover:underline"
            >
              Older →
            </Link>
          ) : (
            <span className="text-muted-foreground/50">Older →</span>
          )}
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  active,
  href,
  options,
}: {
  label: string;
  active: boolean;
  href: string;
  options: { label: string; value: string; active: boolean; href: string }[];
}) {
  return (
    <>
      <Chip label={label} active={active} href={href} />
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          active={option.active}
          href={option.href}
        />
      ))}
    </>
  );
}

function Chip({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={
        active
          ? "rounded-full bg-navy px-2.5 py-0.5 text-white"
          : "rounded-full border border-border px-2.5 py-0.5 text-navy transition-colors hover:border-brand-green"
      }
    >
      {label}
    </Link>
  );
}
