"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PropertyListCard } from "@/components/properties/property-list-card";
import { PropertyListCardSkeleton } from "@/components/properties/property-list-card-skeleton";
import type { Property } from "@/db/schema";

export function PropertyInfiniteList({
  initialProperties,
  totalCount,
}: {
  initialProperties: Property[];
  totalCount: number;
}) {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState(initialProperties);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMore = properties.length < totalCount;

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(pageRef.current + 1));

      const res = await fetch(`/api/properties?${params.toString()}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data: { properties: Property[] } = await res.json();
      pageRef.current += 1;

      // Guard against repeats. The ordering now carries a unique tiebreaker
      // so pages shouldn't overlap, but a card rendering twice is a visible
      // credibility problem and this is cheap insurance.
      setProperties((prev) => {
        const seen = new Set(prev.map((property) => property.id));
        const fresh = data.properties.filter(
          (property) => !seen.has(property.id)
        );
        return fresh.length ? [...prev, ...fresh] : prev;
      });
    } catch {
      // Previously this threw an unhandled rejection, leaving loadingRef stuck
      // at true — infinite scroll froze permanently with no message.
      setError("Couldn't load more properties.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!hasMore || error) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, error, loadMore]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-col sm:gap-6">
        {properties.map((property) => (
          <PropertyListCard key={property.id} property={property} />
        ))}
      </div>

      {hasMore && !error && (
        <div
          ref={sentinelRef}
          className="mt-3 grid grid-cols-2 gap-3 sm:mt-6 sm:flex sm:flex-col sm:gap-6"
        >
          {loading && <PropertyListCardSkeleton />}
        </div>
      )}

      {error && (
        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Retrying…" : "Try again"}
          </Button>
        </div>
      )}

      {!hasMore && properties.length > 6 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          That&apos;s all {totalCount} properties.{" "}
          <Link
            href="/contact"
            className="font-medium text-navy underline underline-offset-2"
          >
            Get notified when new ones list
          </Link>
        </p>
      )}
    </>
  );
}
