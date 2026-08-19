import { Skeleton } from "@/components/ui/skeleton";

export function PropertyListCardSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 sm:hidden">
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-1.5 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>

      <div className="hidden gap-5 rounded-2xl border border-border bg-card p-4 sm:flex sm:flex-row">
        <Skeleton className="aspect-[4/3] w-full shrink-0 rounded-xl sm:w-[300px] md:w-[320px]" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="grid grid-cols-3 gap-3 border-y border-border py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-6 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </>
  );
}
