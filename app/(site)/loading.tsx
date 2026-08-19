import { Loader2 } from "lucide-react";

// This is the root-level Suspense fallback, shown briefly (Next.js
// streaming) at the very start of *any* route's cold load — not just
// "/" — so it must stay route-agnostic. Route-specific skeletons live
// in each segment's own loading.tsx (e.g. app/properties/loading.tsx).
export default function RootLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-32">
      <Loader2 className="size-8 animate-spin text-brand-green" />
    </div>
  );
}
