/**
 * Structured data, so Google can render rich results.
 *
 * The site published none, which means it competed for search listings using
 * only a blue link while competitors show breadcrumb trails, expandable FAQ
 * answers and price/location detail directly in the result.
 *
 * `dangerouslySetInnerHTML` is the standard way to emit JSON-LD in React —
 * the alternative (children) would escape the quotes and produce invalid
 * JSON. The input is our own serialised object, never user content, so there
 * is no injection surface. `JSON.stringify` is additionally guarded below
 * against the one sequence that can break out of a <script> block.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
