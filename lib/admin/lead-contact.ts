/**
 * Turning what someone typed into a form into something you can tap.
 *
 * The phone field is validated for shape on the public form but stored as
 * entered — "+91 98••• •••••", "098•••", "98••• •••••" are all in the table.
 * Every one of those has to produce a working tel: and wa.me link, because
 * this is the button the team presses fifty times a day.
 */

/** Sentinels written by the notify signup, which asks for no phone at all. */
const NOT_A_PHONE = new Set(["(not provided)", ""]);

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function isCallable(phone: string | null | undefined): boolean {
  if (!phone || NOT_A_PHONE.has(phone.trim())) return false;
  return digitsOnly(phone).length >= 10;
}

/** `tel:` keeps the leading +, which is what dialers want. */
export function telHrefFor(phone: string): string {
  const digits = digitsOnly(phone);
  return `tel:${phone.trim().startsWith("+") ? "+" : ""}${digits}`;
}

/**
 * wa.me needs a country code and no punctuation. A bare 10-digit Indian
 * mobile gets 91 prefixed; an 11-digit number starting 0 has the trunk
 * prefix stripped first. Anything already carrying a country code is left
 * alone — guessing twice would produce 9191…
 */
export function whatsappHrefFor(phone: string, message?: string): string {
  let digits = digitsOnly(phone);

  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;

  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}

export function mailtoHrefFor(email: string, subject?: string): string {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${email}${query}`;
}

/**
 * Splits the folded `message` back into the fields it was built from.
 *
 * The managed-plan and list-property forms fold their structured answers into
 * `message` as "Label: value" lines (lib/actions/leads.ts) rather than adding
 * six columns used by one form. That is the right storage decision and the
 * wrong reading experience — as a wall of text the amount band and the city
 * are no easier to find than in a paragraph. This puts them back into pairs.
 *
 * A line without a colon, or free text after "Notes:", is returned as prose
 * so nothing is ever dropped on the floor.
 */
export type ParsedMessage = {
  fields: { label: string; value: string }[];
  prose: string[];
};

export function parseFoldedMessage(
  message: string | null | undefined
): ParsedMessage {
  if (!message) return { fields: [], prose: [] };

  const fields: { label: string; value: string }[] = [];
  const prose: string[] = [];

  for (const line of message.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = /^([A-Za-z][A-Za-z ]{1,24}):\s*(.+)$/.exec(trimmed);

    // "Notes: …" is the visitor's own words — a label, but its value is
    // prose and reads better as a paragraph than as a table cell.
    if (match && match[1].toLowerCase() !== "notes") {
      fields.push({ label: match[1], value: match[2] });
    } else if (match) {
      prose.push(match[2]);
    } else {
      prose.push(trimmed);
    }
  }

  return { fields, prose };
}
