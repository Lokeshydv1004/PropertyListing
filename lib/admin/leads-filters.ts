import { ENQUIRY_TYPES } from "@/lib/validation/contact";

/**
 * Every filter lives in the URL.
 *
 * The team works this queue together — "the three Pune rent enquiries from
 * last week" has to be something you can paste into WhatsApp and have the
 * other person see the same rows. Filters held in component state cannot be
 * shared, cannot be bookmarked, and are lost on a refresh mid-call.
 */

export const LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
] as const;

/**
 * Which surface produced the lead. Distinct from enquiry type, and the
 * distinction matters: a `managed_plan` enquiry type arrives both from the
 * contact form's dropdown and from /invest-with-us. Only `source` tells you
 * which, so both are filterable and both are shown as columns.
 */
export const LEAD_SOURCES = [
  { value: "interest", label: "Listing interest" },
  { value: "contact", label: "Contact form" },
  { value: "managed_plan", label: "Invest with us" },
  { value: "list_property", label: "List your property" },
  { value: "notify", label: "New-listing alerts" },
] as const;

/**
 * Short labels for the same values the public form writes.
 *
 * ENQUIRY_TYPES is worded for a visitor choosing from a dropdown ("I can't
 * choose a property — tell me about the managed portfolio"). That does not
 * fit in a table cell, and the values must stay identical, so this maps them
 * rather than redefining them.
 */
const SHORT_ENQUIRY_LABELS: Record<string, string> = {
  investor: "Investor",
  managed_plan: "Managed plan",
  buy: "Buyer",
  rent: "Tenant",
  list_property: "Owner listing",
  partnership: "Partnership",
  other: "Other",
};

export const LEAD_ENQUIRY_TYPES = ENQUIRY_TYPES.map((type) => ({
  value: type.value,
  label: SHORT_ENQUIRY_LABELS[type.value] ?? type.label,
}));

/**
 * `notify` rows are not leads in the sense the rest of this page means.
 * lib/actions/leads.ts writes them with name "(new-listing alerts)" and phone
 * "(not provided)" because the columns are NOT NULL — they are email
 * subscribers, and leaving them in the queue means they turn up in every call
 * list forever. They get their own tab instead.
 */
export type LeadTab = "queue" | "alerts";

export type LeadFilters = {
  tab: LeadTab;
  /** Free text across name, phone and email. */
  q: string;
  /** "all" means no status filter; absent means the default view. */
  status: string;
  source: string;
  enquiryType: string;
  city: string;
  assigned: string;
  hasProperty: string;
  from: string;
  to: string;
  page: number;
};

export const LEADS_PAGE_SIZE = 50;

/**
 * The landing view is "new, newest first" — which is the job, not a
 * preference. An absent `status` therefore means new, and seeing everything
 * is the explicit `status=all`. The header states which view is active so
 * this is never a silent filter.
 */
export const DEFAULT_STATUS = "new";

function one(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function parseLeadFilters(
  params: Record<string, string | string[] | undefined>
): LeadFilters {
  const tab = one(params.tab) === "alerts" ? "alerts" : "queue";
  const page = Math.max(1, Number(one(params.page)) || 1);

  return {
    tab,
    q: one(params.q).trim().slice(0, 100),
    // The alerts tab has no workflow, so a status filter there is noise.
    status: tab === "alerts" ? "all" : one(params.status) || DEFAULT_STATUS,
    source: one(params.source),
    enquiryType: one(params.type),
    city: one(params.city),
    assigned: one(params.assigned),
    hasProperty: one(params.property),
    from: one(params.from),
    to: one(params.to),
    page,
  };
}

/** Rebuilds the query string, dropping defaults so URLs stay readable. */
export function leadFiltersToQuery(
  filters: Partial<LeadFilters>,
  overrides: Partial<LeadFilters> = {}
): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (merged.tab === "alerts") params.set("tab", "alerts");
  if (merged.q) params.set("q", merged.q);
  if (merged.status && merged.status !== DEFAULT_STATUS && merged.tab !== "alerts") {
    params.set("status", merged.status);
  }
  if (merged.source) params.set("source", merged.source);
  if (merged.enquiryType) params.set("type", merged.enquiryType);
  if (merged.city) params.set("city", merged.city);
  if (merged.assigned) params.set("assigned", merged.assigned);
  if (merged.hasProperty) params.set("property", merged.hasProperty);
  if (merged.from) params.set("from", merged.from);
  if (merged.to) params.set("to", merged.to);
  if (merged.page && merged.page > 1) params.set("page", String(merged.page));

  const query = params.toString();
  return query ? `?${query}` : "";
}

/** True when anything beyond the default view is applied. */
export function hasActiveFilters(filters: LeadFilters): boolean {
  return Boolean(
    filters.q ||
      (filters.status !== DEFAULT_STATUS && filters.tab === "queue") ||
      filters.source ||
      filters.enquiryType ||
      filters.city ||
      filters.assigned ||
      filters.hasProperty ||
      filters.from ||
      filters.to
  );
}

export function labelForSource(value: string | null): string {
  if (!value) return "—";
  return LEAD_SOURCES.find((s) => s.value === value)?.label ?? value;
}

export function labelForEnquiryType(value: string | null): string {
  if (!value) return "—";
  return LEAD_ENQUIRY_TYPES.find((t) => t.value === value)?.label ?? value;
}
