import { PropertyListCardSkeleton } from "@/components/properties/property-list-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Skeleton className="h-9 w-72" />
          <Skeleton className="mt-1 h-9 w-56" />
          <Skeleton className="mt-2 h-5 w-96" />
        </div>
        <Skeleton className="h-14 w-full lg:w-96" />
      </div>

      <Skeleton className="mt-8 h-20 w-full rounded-2xl" />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-col sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyListCardSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
