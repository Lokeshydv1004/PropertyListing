"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const VISIBLE_THUMBNAILS = 4;

export function PropertyGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] w-full rounded-2xl bg-navy-light" />
    );
  }

  const activeImage = images[activeIndex];
  const hiddenCount = images.length - VISIBLE_THUMBNAILS;
  const thumbnails = images.slice(0, VISIBLE_THUMBNAILS);

  function showPrev() {
    setActiveIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  }

  function showNext() {
    setActiveIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  }

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-navy-light">
        <Image
          src={activeImage}
          alt={`${title} — photo ${activeIndex + 1}`}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority
          className="object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous photo"
              className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-md transition-transform hover:scale-105"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next photo"
              className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-md transition-transform hover:scale-105"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {thumbnails.map((image, index) => {
            const isLastVisible = index === VISIBLE_THUMBNAILS - 1;
            const showMoreOverlay = isLastVisible && hiddenCount > 0;

            return (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={
                  showMoreOverlay
                    ? `Show ${hiddenCount} more photos`
                    : `Show photo ${index + 1}`
                }
                aria-current={index === activeIndex}
                className={cn(
                  "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                  index === activeIndex ? "border-brand-green" : "border-transparent"
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
                    +{hiddenCount} More
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
