import { PropertyCardSkeleton } from "@/components/properties/property-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-2 h-5 w-64" />

      <Skeleton className="mt-8 h-64 w-full rounded-2xl" />

      <Skeleton className="mt-6 h-5 w-40" />

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
