"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Property research in India spreads over WhatsApp.
 *
 * A listing with no way to send it to a spouse, a parent or a CA is a listing
 * that only ever reaches one person. This offers the native share sheet where
 * the browser has one (every mobile browser worth counting), and falls back
 * to an explicit WhatsApp link plus copy-to-clipboard on desktop.
 */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  function currentUrl() {
    return typeof window === "undefined" ? "" : window.location.href;
  }

  async function share() {
    const url = currentUrl();

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // The user dismissed the sheet, or the browser refused. Either way,
        // fall through to the explicit options rather than failing silently.
      }
    }

    setExpanded((open) => !open);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={share}
        className="h-9 gap-1.5 px-3 text-sm"
      >
        <Share2 className="size-4" aria-hidden="true" />
        Share
      </Button>

      {expanded && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${currentUrl()}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-navy"
          >
            <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
            Share on WhatsApp
          </a>
          <button
            type="button"
            onClick={copy}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-navy"
          >
            {copied ? (
              <Check
                className="size-4 shrink-0 text-brand-green"
                aria-hidden="true"
              />
            ) : (
              <Link2 className="size-4 shrink-0" aria-hidden="true" />
            )}
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
