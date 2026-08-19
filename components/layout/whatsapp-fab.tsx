import { MessageCircle } from "lucide-react";
import { hasRealWhatsapp, whatsappHref } from "@/lib/site-config";

/**
 * A persistent line to a human, sitewide.
 *
 * For Indian property lead generation this is close to standard, and it
 * reaches a group no form ever will: plenty of people will send a WhatsApp
 * message who would never fill in five fields and wait for a call back.
 *
 * Renders nothing while the WhatsApp number is still a placeholder — a
 * floating button that opens a chat with a number nobody watches is worse
 * than no button.
 *
 * `bottom-20 lg:bottom-6` keeps it clear of the property detail page's sticky
 * mobile CTA bar, which occupies the bottom of the viewport below `lg`.
 */
export function WhatsAppFab() {
  if (!hasRealWhatsapp) return null;

  return (
    <a
      href={whatsappHref("Hi GharShare — I'd like to know more.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-20 z-40 flex size-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:right-6 lg:bottom-6"
    >
      <MessageCircle className="size-6" aria-hidden="true" />
    </a>
  );
}
