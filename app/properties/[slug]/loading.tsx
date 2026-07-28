import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-64" />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          <div className="mt-3 flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-24 rounded-lg" />
            ))}
          </div>

          <div className="mt-8 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>

          <Skeleton className="mt-5 h-2 w-full" />

          <Skeleton className="mt-8 h-24 w-full rounded-2xl" />

          <div className="mt-8 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  );
}
