"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { deleteMedia, uploadMedia } from "@/lib/actions/admin-media";
import { encodeDocument, parseDocument } from "@/lib/documents";

/**
 * Documents, with the label the public page shows.
 *
 * Stored as "Label|url" in the flat `text[]` — see lib/documents.ts for why
 * that rather than a JSONB migration. The label is editable inline because
 * the alternative, deriving it from the filename, produces "F3a91b2c" now
 * that uploads generate UUID names.
 */
export function DocumentManager({
  value,
  onChange,
  propertyId,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  propertyId?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function addFiles(files: FileList | File[]) {
    setError(null);
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      setBusy(file.name);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "document");
      if (propertyId) formData.append("propertyId", propertyId);

      const result = await uploadMedia(formData);

      if (result.success) {
        // Seed the label from the original filename — it is usually right
        // ("title-report.pdf" → "Title report") and always editable.
        const label = file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ")
          .replace(/^./, (character) => character.toUpperCase());

        uploaded.push(encodeDocument(label, result.url));
      } else {
        setError(`${file.name}: ${result.error}`);
      }
    }

    setBusy(null);
    if (uploaded.length > 0) onChange([...value, ...uploaded]);
  }

  function relabel(index: number, label: string) {
    const { url } = parseDocument(value[index]);
    onChange(value.map((entry, i) => (i === index ? encodeDocument(label, url) : entry)));
  }

  function remove(index: number) {
    const { url } = parseDocument(value[index]);
    onChange(value.filter((_, i) => i !== index));
    void deleteMedia(url, "document");
  }

  return (
    <div>
      <Label>Documents</Label>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Title report, valuation, legal summary. Downloadable documents are the
        strongest trust signal the listing page has — the label here is what
        visitors see.
      </p>

      {value.length > 0 && (
        <ul className="mt-3 space-y-2">
          {value.map((entry, index) => {
            const { label, url } = parseDocument(entry);

            return (
              <li
                key={url}
                className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
              >
                <FileText
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />

                <Input
                  value={label}
                  onChange={(event) => relabel(index, event.target.value)}
                  aria-label={`Label for document ${index + 1}`}
                  className="h-8 flex-1"
                />

                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs text-muted-foreground underline-offset-2 hover:text-navy hover:underline"
                >
                  Open
                </a>

                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => remove(index)}
                >
                  <X className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Remove {label}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "mt-3 rounded-xl border-2 border-dashed p-5 text-center transition-colors",
          dragOver ? "border-brand-green bg-brand-green-light" : "border-border"
        )}
      >
        <Upload
          className="mx-auto size-5 text-muted-foreground"
          aria-hidden="true"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={Boolean(busy)}
          onClick={() => inputRef.current?.click()}
        >
          {busy && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
          {busy ? `Uploading ${busy}…` : "Add documents"}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          PDF, Word or an image, up to 25MB.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,.doc,.docx"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
