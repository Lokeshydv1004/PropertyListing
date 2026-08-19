"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  Copy,
  ExternalLink,
  Eye,
  ImageOff,
  Loader2,
  Pencil,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  archiveProperty,
  duplicateProperty,
  quickUpdateProperty,
} from "@/lib/actions/admin-properties";
import { adminStatusesFor } from "@/lib/admin/property-fields";
import { formatCompactINR } from "@/lib/format";
import {
  CATEGORY_LABEL,
  LISTING_TYPE_SHORT,
  STATUS_LABEL,
} from "@/lib/taxonomy";
import type { ListingStatus, ListingType, PropertyCategory } from "@/db/schema";

export type AdminPropertyRow = {
  id: string;
  title: string;
  slug: string;
  listingType: ListingType;
  category: PropertyCategory;
  status: ListingStatus;
  city: string;
  unitNumber: string | null;
  images: string[];
  isFeatured: boolean;
  isPublished: boolean;
  fundingTarget: string | null;
  amountRaised: string | null;
  investorCount: number;
  salePrice: string | null;
  monthlyRent: string | null;
  minInvestment: string | null;
  updatedAt: string;
  buildingName: string | null;
};

export function PropertiesTable({ rows }: { rows: AdminPropertyRow[] }) {
  const [error, setError] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<string[]>([]);

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No listings match this view.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm">
          <p className="font-medium text-destructive">{error}</p>
          {blockers.length > 0 && (
            <ul className="mt-1.5 list-disc pl-5 text-destructive/90">
              {blockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead>Listing</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="min-w-[12rem]">Progress / price</TableHead>
              <TableHead className="text-center">Live</TableHead>
              <TableHead className="text-center">Featured</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <PropertyRow
                key={row.id}
                row={row}
                onError={(message, list) => {
                  setError(message);
                  setBlockers(list ?? []);
                }}
                onSuccess={() => {
                  setError(null);
                  setBlockers([]);
                }}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function PropertyRow({
  row,
  onError,
  onSuccess,
}: {
  row: AdminPropertyRow;
  onError: (message: string, blockers?: string[]) => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ success: boolean; error?: string; blockers?: string[] }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        onError(result.error ?? "Something went wrong.", result.blockers);
        // Re-render from the server so an optimistic-looking toggle doesn't
        // sit there showing a state the database rejected.
        router.refresh();
        return;
      }
      onSuccess();
      router.refresh();
    });
  }

  const cover = row.images[0];

  return (
    <TableRow className={cn(!row.isPublished && "bg-muted/40")}>
      <TableCell>
        {cover ? (
          <Image
            src={cover}
            alt=""
            width={48}
            height={36}
            className="h-9 w-12 rounded object-cover"
          />
        ) : (
          <span
            className="flex h-9 w-12 items-center justify-center rounded bg-muted text-muted-foreground"
            title="No images — this listing can't be published"
          >
            <ImageOff className="size-4" aria-hidden="true" />
          </span>
        )}
      </TableCell>

      <TableCell>
        <Link
          href={`/admin/properties/${row.id}`}
          className="font-medium text-navy underline-offset-2 hover:underline"
        >
          {row.title}
        </Link>
        <span className="block text-xs text-muted-foreground">
          {[row.buildingName, row.unitNumber && `Unit ${row.unitNumber}`]
            .filter(Boolean)
            .join(" · ") || row.slug}
        </span>
      </TableCell>

      <TableCell>
        <Badge className="border-transparent bg-secondary text-secondary-foreground">
          {LISTING_TYPE_SHORT[row.listingType]}
        </Badge>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {CATEGORY_LABEL[row.category]}
        </span>
      </TableCell>

      <TableCell className="text-muted-foreground">{row.city || "—"}</TableCell>

      <TableCell>
        {/* Statuses are filtered by listing type: "fundraising" must not be
            offerable on a shop to let. */}
        <select
          value={row.status}
          disabled={pending}
          onChange={(event) =>
            run(() =>
              quickUpdateProperty({
                id: row.id,
                status: event.target.value as ListingStatus,
              })
            )
          }
          className="h-8 rounded-lg border border-input bg-background px-1.5 text-sm text-navy"
          aria-label={`Status for ${row.title}`}
        >
          {adminStatusesFor(row.listingType).map((status) => (
            <option key={status} value={status}>
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>
      </TableCell>

      <TableCell>
        {row.listingType === "fractional" ? (
          <FundingCell row={row} pending={pending} run={run} />
        ) : (
          <span className="tabular-nums text-navy">
            {row.listingType === "sale"
              ? row.salePrice
                ? formatCompactINR(Number(row.salePrice))
                : "No price"
              : row.monthlyRent
                ? `${formatCompactINR(Number(row.monthlyRent))}/mo`
                : "No rent"}
          </span>
        )}
      </TableCell>

      <TableCell className="text-center">
        <Switch
          checked={row.isPublished}
          disabled={pending}
          onCheckedChange={(checked) =>
            run(() => quickUpdateProperty({ id: row.id, isPublished: checked }))
          }
          aria-label={`${row.isPublished ? "Unpublish" : "Publish"} ${row.title}`}
        />
      </TableCell>

      <TableCell className="text-center">
        <Switch
          checked={row.isFeatured}
          disabled={pending}
          onCheckedChange={(checked) =>
            run(() => quickUpdateProperty({ id: row.id, isFeatured: checked }))
          }
          aria-label={`${row.isFeatured ? "Unfeature" : "Feature"} ${row.title}`}
        />
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-0.5">
          {pending && (
            <Loader2
              className="size-4 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          )}

          <Button
            size="icon-sm"
            variant="ghost"
            title="Edit"
            nativeButton={false}
            render={<Link href={`/admin/properties/${row.id}`} />}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Edit {row.title}</span>
          </Button>

          <Button
            size="icon-sm"
            variant="ghost"
            title={row.isPublished ? "View live" : "Preview draft"}
            nativeButton={false}
            render={
              <a
                href={
                  row.isPublished
                    ? `/properties/${row.slug}`
                    : // Enables draft mode for this browser, then lands on
                      // the real page — see properties/preview/route.ts.
                      `/admin/properties/preview?slug=${row.slug}`
                }
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            {row.isPublished ? (
              <ExternalLink className="size-3.5" aria-hidden="true" />
            ) : (
              <Eye className="size-3.5" aria-hidden="true" />
            )}
            <span className="sr-only">
              {row.isPublished ? "View" : "Preview"} {row.title}
            </span>
          </Button>

          <Button
            size="icon-sm"
            variant="ghost"
            title="Duplicate"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await duplicateProperty({ id: row.id });
                if (result.success) router.push(`/admin/properties/${result.id}`);
                else onError(result.error);
              })
            }
          >
            <Copy className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Duplicate {row.title}</span>
          </Button>

          <Button
            size="icon-sm"
            variant="ghost"
            title="Archive"
            disabled={pending}
            onClick={() => {
              if (
                !confirm(
                  `Archive "${row.title}"? It goes off-market and off the site. Nothing is deleted, and enquiries stay linked to it.`
                )
              ) {
                return;
              }
              run(() => archiveProperty({ id: row.id }));
            }}
          >
            <Archive className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Archive {row.title}</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

/**
 * The funding bar, editable in place.
 *
 * This is the highest-frequency edit in the whole console — the number moves
 * every time somebody commits — so it is two inputs and a blur, not a
 * navigation to a form and back.
 */
function FundingCell({
  row,
  pending,
  run,
}: {
  row: AdminPropertyRow;
  pending: boolean;
  run: (action: () => Promise<{ success: boolean; error?: string; blockers?: string[] }>) => void;
}) {
  const [raised, setRaised] = useState(row.amountRaised ?? "0");
  const [investors, setInvestors] = useState(String(row.investorCount));

  const target = row.fundingTarget ? Number(row.fundingTarget) : 0;
  const progress = target > 0 ? Math.min(100, (Number(raised) / target) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <input
          value={raised}
          onChange={(event) => setRaised(event.target.value)}
          onBlur={() => {
            if ((row.amountRaised ?? "0") === raised) return;
            run(() => quickUpdateProperty({ id: row.id, amountRaised: raised }));
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") setRaised(row.amountRaised ?? "0");
          }}
          disabled={pending}
          inputMode="numeric"
          className="h-7 w-24 rounded border border-input bg-background px-1.5 text-sm tabular-nums"
          aria-label={`Amount raised for ${row.title}`}
        />
        <span className="text-xs text-muted-foreground">
          / {target > 0 ? formatCompactINR(target) : "no target"}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand-green"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <input
          value={investors}
          onChange={(event) => setInvestors(event.target.value)}
          onBlur={() => {
            if (String(row.investorCount) === investors) return;
            run(() =>
              quickUpdateProperty({ id: row.id, investorCount: investors })
            );
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") setInvestors(String(row.investorCount));
          }}
          disabled={pending}
          inputMode="numeric"
          className="h-6 w-14 rounded border border-input bg-background px-1 text-xs tabular-nums"
          aria-label={`Investor count for ${row.title}`}
        />
        <span className="text-xs text-muted-foreground">investors</span>
      </div>
    </div>
  );
}
