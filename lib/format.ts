/** Formats a rupee amount using Indian Lakh/Crore short-form (e.g. "₹5.2 Cr", "₹75 L"). */
export function formatCompactINR(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 1_00_00_000) {
    return `₹${trimDecimal(value / 1_00_00_000)} Cr`;
  }
  if (abs >= 1_00_000) {
    return `₹${trimDecimal(value / 1_00_000)} L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

function trimDecimal(value: number): string {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
