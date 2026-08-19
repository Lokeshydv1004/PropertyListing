/**
 * `properties.documents` is a flat `text[]`, which can only hold one string
 * per document — so a label has to travel inside that string.
 *
 * The public page previously derived a name from the filename, which gives
 * you "Titlereport Final V2" for `title-report-final-v2.pdf` and nothing at
 * all for a URL ending in a UUID. Since uploads now generate UUID filenames,
 * that fallback stopped working entirely — hence the encoding.
 *
 * Format: `Label|https://…`. A pipe cannot appear in a URL unescaped, so it
 * is unambiguous, and any entry without one is treated as a bare URL exactly
 * as before. That backward compatibility is the reason for a separator rather
 * than a JSONB migration: every existing row keeps working untouched.
 */

export type PropertyDocument = { label: string; url: string };

const SEPARATOR = "|";

export function encodeDocument(label: string, url: string): string {
  const clean = label.trim().replace(/\|/g, "-");
  return clean ? `${clean}${SEPARATOR}${url}` : url;
}

export function parseDocument(entry: string): PropertyDocument {
  const index = entry.indexOf(SEPARATOR);

  if (index > 0) {
    return {
      label: entry.slice(0, index).trim(),
      url: entry.slice(index + 1).trim(),
    };
  }

  return { label: labelFromUrl(entry), url: entry };
}

export function parseDocuments(entries: string[]): PropertyDocument[] {
  return entries.map(parseDocument).filter((document) => document.url);
}

/**
 * Last-resort label for a legacy entry with no label of its own.
 *
 * A generated UUID filename produces nothing readable, so those fall back to
 * "Document" rather than printing 32 hex characters at a prospective
 * investor.
 */
function labelFromUrl(url: string): string {
  const filename = decodeURIComponent(url.split("/").pop() ?? "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

  if (!filename) return "Document";

  // A UUID, or a hex blob, says nothing to a reader.
  if (/^[0-9a-f]{8}[- ][0-9a-f]{4}/i.test(filename)) return "Document";
  if (/^[0-9a-f\s]{16,}$/i.test(filename)) return "Document";

  return filename;
}
