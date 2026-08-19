/**
 * Formats a rupee amount using Indian Lakh/Crore short-form ("₹5.2 Cr", "₹75 L").
 *
 * Rounds toward zero, not to nearest. A minimum ticket of ₹2,49,999 rendered
 * as "₹2.5 L" under round-to-nearest, which overstates the entry price: a
 * visitor reads that as the number they must have. Truncating means the
 * displayed figure is never higher than the real one, so "from ₹2.4 L" is
 * always a promise we can keep. Use `formatExactINR` where the precise figure
 * matters, such as the amount somebody is committing.
 */
export function formatCompactINR(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 1_00_00_000) {
    return `₹${trimDecimal(value / 1_00_00_000)} Cr`;
  }
  if (abs >= 1_00_000) {
    return `₹${trimDecimal(value / 1_00_000)} L`;
  }
  if (abs >= 1_000) {
    return `₹${trimDecimal(value / 1_000)} K`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

/** Full rupee amount with Indian digit grouping, e.g. "₹2,50,000". */
export function formatExactINR(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

/**
 * Monthly rent. Rents sit in the ₹40 K – ₹15 L band where the compact form
 * loses meaningful precision, so this keeps thousands readable and always
 * carries the period — "₹85 K" and "₹85 K/mo" are very different numbers.
 */
export function formatRent(value: number): string {
  return `${formatCompactINR(value)}/mo`;
}

/** Visitor counts, e.g. "8.5 L visitors/mo". */
export function formatFootfall(value: number): string {
  if (value >= 1_00_00_000) return `${trimDecimal(value / 1_00_00_000)} Cr`;
  if (value >= 1_00_000) return `${trimDecimal(value / 1_00_000)} L`;
  if (value >= 1_000) return `${trimDecimal(value / 1_000)} K`;
  return value.toLocaleString("en-IN");
}

/** Area with thousands separators, e.g. "1,850 sq.ft.". */
export function formatArea(value: number | string): string {
  return `${Number(value).toLocaleString("en-IN")} sq.ft.`;
}

/** Lease terms are stored in months but read better in years past 12. */
export function formatMonths(months: number): string {
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = months / 12;
  if (Number.isInteger(years)) return `${years} year${years === 1 ? "" : "s"}`;
  return `${trimDecimal(years)} years`;
}

function trimDecimal(value: number): string {
  if (value % 1 === 0) return value.toFixed(0);
  // Truncate the second decimal rather than rounding it up — see
  // formatCompactINR. Math.trunc keeps negatives moving toward zero too.
  const truncated = Math.trunc(value * 10) / 10;
  return truncated % 1 === 0 ? truncated.toFixed(0) : truncated.toFixed(1);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** Truncates text to a max length on a word boundary, appending an ellipsis. */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}
