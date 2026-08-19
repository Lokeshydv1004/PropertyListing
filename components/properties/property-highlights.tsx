import { Check } from "lucide-react";
import type { Property } from "@/db/schema";

/**
 * Per-property selling points, from the `highlights` column.
 *
 * This used to render the same four generic claims — "Prime Location",
 * "Quality Construction — Premium specifications" — on every single listing.
 * A visitor who opened two properties saw identical highlights and correctly
 * read them as decoration. Renders nothing when a listing has none, which is
 * better than filler.
 */
export function PropertyHighlights({ property }: { property: Property }) {
  if (property.highlights.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="font-serif text-xl font-semibold text-navy">
        Key highlights
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {property.highlights.map((highlight) => (
          <li
            key={highlight}
            className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3"
          >
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-green-light text-brand-green">
              <Check className="size-3" aria-hidden="true" />
            </span>
            <span className="text-sm leading-relaxed text-foreground/85">
              {highlight}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
