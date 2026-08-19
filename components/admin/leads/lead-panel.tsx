"use client";

import { useRouter } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * The sheet the intercepted lead route renders into.
 *
 * Closing goes Back rather than to a fixed URL, so the queue reappears with
 * its filters, scroll position and page number exactly as they were — which
 * is the entire reason to open a panel instead of navigating away.
 */
export function LeadPanel({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <Sheet
      defaultOpen
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle className="text-navy">Lead</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
