import Script from "next/script";

/**
 * GA4, and only when it is actually configured.
 *
 * The site shipped with no analytics of any kind, which meant nobody could
 * answer how many people visit, which properties get looked at, where they
 * drop off, or which channel produces leads — the questions that decide where
 * the next rupee of marketing spend goes.
 *
 * Renders nothing at all when `NEXT_PUBLIC_GA_ID` is unset, so development
 * and preview builds stay clean and no third-party script loads without the
 * site owner having deliberately turned it on.
 *
 * `afterInteractive` rather than `beforeInteractive`: analytics must never sit
 * in front of the page paint on a site whose visitors are mostly on mobile
 * connections.
 *
 * Note on the privacy policy: the policy currently states that this site uses
 * only functional cookies and that consent will be sought before any tracking
 * cookie is set. GA4 sets one. Update /privacy and add a consent banner at
 * the same time you set NEXT_PUBLIC_GA_ID — the two changes go together.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
