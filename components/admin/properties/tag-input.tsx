"use client";

import { useId, useState } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * A repeater for the `text[]` columns — amenities, highlights, tags, risks.
 *
 * Not a comma-separated text box, for two reasons. Order is meaningful in
 * some of these (highlights are read top to bottom, and `images[0]` is the
 * cover), and a free-text box is how you end up with "Parking", "parking"
 * and "Car Parking" as three separate filter options on the public site —
 * the same class of bug the category enum was introduced to fix. Hence the
 * suggestions: existing values are one click away, so the natural path is
 * reuse rather than retyping.
 */
export function TagInput({
  label,
  description,
  value,
  onChange,
  suggestions = [],
  placeholder,
  /** Labels the first entry, for ordered fields like images. */
  firstLabel,
}: {
  label: string;
  description?: string;
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  firstLabel?: string;
}) {
  const [draft, setDraft] = useState("");
  const listId = useId();

  function add(entry: string) {
    const trimmed = entry.trim();
    if (!trimmed) return;
    // Case-insensitive, because "Parking" and "parking" are the same amenity
    // to a reader and two different filters to the database.
    if (value.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  const unused = suggestions
    .filter(
      (suggestion) =>
        !value.some((item) => item.toLowerCase() === suggestion.toLowerCase())
    )
    .slice(0, 12);

  return (
    <div>
      <Label htmlFor={`${listId}-input`}>{label}</Label>
      {description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      )}

      {value.length > 0 && (
        <ul className="mt-2 space-y-1">
          {value.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1"
            >
              {firstLabel && index === 0 && (
                <span className="rounded bg-brand-green-light px-1.5 py-0.5 text-xs font-medium text-brand-green">
                  {firstLabel}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-sm text-navy">
                {item}
              </span>

              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                title="Move up"
              >
                <ChevronUp className="size-3" aria-hidden="true" />
                <span className="sr-only">Move {item} up</span>
              </Button>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                disabled={index === value.length - 1}
                onClick={() => move(index, 1)}
                title="Move down"
              >
                <ChevronDown className="size-3" aria-hidden="true" />
                <span className="sr-only">Move {item} down</span>
              </Button>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                className="text-destructive"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                title="Remove"
              >
                <X className="size-3" aria-hidden="true" />
                <span className="sr-only">Remove {item}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex gap-1.5">
        <Input
          id={`${listId}-input`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            // Enter adds an entry; it must not submit the whole form, which
            // is the default for a single-input row and loses the entry.
            if (event.key === "Enter") {
              event.preventDefault();
              add(draft);
            }
          }}
          placeholder={placeholder}
          list={suggestions.length ? listId : undefined}
        />
        {suggestions.length > 0 && (
          <datalist id={listId}>
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        )}
        <Button type="button" variant="outline" onClick={() => add(draft)}>
          <Plus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </div>

      {unused.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {unused.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => add(suggestion)}
              className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-brand-green hover:text-navy"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
