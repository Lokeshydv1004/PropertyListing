"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The gallery previously showed four thumbnails and stamped "+N More" over the
 * fourth — but clicking it just selected image four. Every photo beyond the
 * fourth was unreachable by any means. On a page whose job is to convince
 * somebody to commit six figures to a building, hiding photographs of the
 * building is a direct conversion cost.
 *
 * Now: all thumbnails are reachable (the strip scrolls), the "+N more" control
 * opens a lightbox containing every image, and both the main image and the
 * lightbox respond to arrow keys.
 */
const VISIBLE_THUMBNAILS = 4;

export function PropertyGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const count = images.length;

  const showPrev = useCallback(() => {
    setActiveIndex((index) => (index === 0 ? count - 1 : index - 1));
  }, [count]);

  const showNext = useCallback(() => {
    setActiveIndex((index) => (index === count - 1 ? 0 : index + 1));
  }, [count]);

  // Arrow keys drive the gallery whenever the lightbox is open; Escape closes
  // it. Without the lightbox open we deliberately don't hijack arrow keys,
  // which belong to page scrolling.
  useEffect(() => {
    if (!lightboxOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    }

    document.addEventListener("keydown", onKeyDown);
    // Stop the page behind the overlay scrolling under the user's fingers.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen, showPrev, showNext]);

  if (count === 0) {
    return <div className="aspect-[16/10] w-full rounded-2xl bg-navy-light" />;
  }

  const activeImage = images[activeIndex];
  const hiddenCount = count - VISIBLE_THUMBNAILS;
  const thumbnails = images.slice(0, VISIBLE_THUMBNAILS);

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-navy-light">
        <Image
          src={activeImage}
          alt={`${title} — photo ${activeIndex + 1} of ${count}`}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority
          className="object-cover"
        />

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="View all photos full screen"
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-navy shadow-md transition-transform hover:scale-105"
        >
          <Expand className="size-3.5" aria-hidden="true" />
          {count} photo{count === 1 ? "" : "s"}
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous photo"
              className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-md transition-transform hover:scale-105"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next photo"
              className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-md transition-transform hover:scale-105"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {thumbnails.map((image, index) => {
            const isLastVisible = index === VISIBLE_THUMBNAILS - 1;
            const showMoreOverlay = isLastVisible && hiddenCount > 0;

            return (
              <button
                key={image}
                type="button"
                // The overflow thumbnail now opens the lightbox rather than
                // selecting image four and stranding the rest.
                onClick={() =>
                  showMoreOverlay ? setLightboxOpen(true) : setActiveIndex(index)
                }
                aria-label={
                  showMoreOverlay
                    ? `View all ${count} photos`
                    : `Show photo ${index + 1}`
                }
                aria-current={!showMoreOverlay && index === activeIndex}
                className={cn(
                  "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                  index === activeIndex && !showMoreOverlay
                    ? "border-brand-green"
                    : "border-transparent"
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                {showMoreOverlay && (
                  <span className="absolute inset-0 flex items-center justify-center bg-navy/70 text-sm font-semibold text-white">
                    +{hiddenCount} more
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — photo gallery`}
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <p className="text-sm">
              {activeIndex + 1} / {count}
            </p>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close gallery"
              autoFocus
              className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex-1">
            <Image
              src={activeImage}
              alt={`${title} — photo ${activeIndex + 1} of ${count}`}
              fill
              sizes="100vw"
              className="object-contain"
            />

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Previous photo"
                  className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy transition-transform hover:scale-105"
                >
                  <ChevronLeft className="size-6" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next photo"
                  className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy transition-transform hover:scale-105"
                >
                  <ChevronRight className="size-6" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          {/* Every image, not the first four. */}
          <div className="flex gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activeIndex}
                className={cn(
                  "relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-opacity",
                  index === activeIndex
                    ? "border-white"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
