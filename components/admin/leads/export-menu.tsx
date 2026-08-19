"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Column keys must match the COLUMNS map in the export route — that route is
 * the authority on what each column contains, this is only the picker.
 */
const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "type", label: "Enquiry type" },
  { key: "source", label: "Source" },
  { key: "property", label: "Property" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  { key: "assignee", label: "Assigned to" },
  { key: "created", label: "Received" },
  { key: "contacted", label: "First contacted" },
] as const;

const DEFAULT_SELECTED = new Set([
  "name",
  "phone",
  "email",
  "type",
  "source",
  "property",
  "amount",
  "status",
  "created",
]);

/**
 * Exports whatever the current filters select, not the current page.
 *
 * `query` is the live filter string, so what lands in Sheets is exactly the
 * rows on screen — an export that quietly ignored the filters would be worse
 * than no export, because the difference isn't visible until someone acts on
 * the wrong list.
 */
export function ExportMenu({ query }: { query: string }) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(DEFAULT_SELECTED)
  );

  const cols = COLUMNS.filter((column) => selected.has(column.key)).map(
    (column) => column.key
  );

  const href = `/admin/leads/export${query || "?"}${query ? "&" : ""}cols=${cols.join(",")}`;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Download className="size-4" aria-hidden="true" />
            Export CSV
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Export this view</DialogTitle>
          <DialogDescription>
            Every lead matching the filters currently applied, with the columns
            you pick.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 px-4">
          {COLUMNS.map((column) => (
            <label
              key={column.key}
              className="flex items-center gap-2 text-sm text-navy"
            >
              <Checkbox
                checked={selected.has(column.key)}
                onCheckedChange={(checked) =>
                  setSelected((current) => {
                    const next = new Set(current);
                    if (checked) next.add(column.key);
                    else next.delete(column.key);
                    return next;
                  })
                }
              />
              {column.label}
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button
            nativeButton={false}
            disabled={cols.length === 0}
            className="bg-brand-green text-white hover:bg-brand-green/90"
            render={<a href={href} download />}
          >
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
