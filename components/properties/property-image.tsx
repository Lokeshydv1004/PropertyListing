import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A listing photo, or an honest placeholder when there isn't one.
 *
 * Deliberately does NOT fall back to stock photography. On a page that
 * represents a real asset, a random photograph is a misrepresentation, not a
 * neutral placeholder — a visitor reading "Powai Lakeview Towers" over a
 * picture of a forest track concludes the listing is fake.
 */
export function PropertyImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-navy-light text-muted-foreground">
        <ImageOff className="size-5" aria-hidden="true" />
        <span className="text-[11px] font-medium">Photos coming soon</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
