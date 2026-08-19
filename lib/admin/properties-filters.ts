/**
 * Property list filters, kept out of lib/queries/admin-properties.ts.
 *
 * That module is `server-only` because it touches the database; this one is
 * imported by the client filter bar as well as by the page, and pulling
 * server-only into a client component is a build error rather than a runtime
 * one — which is the good outcome, but it still has to be split.
 */

export const PROPERTIES_PAGE_SIZE = 40;

export type AdminPropertyFilters = {
  q: string;
  listingType: string;
  category: string;
  status: string;
  city: string;
  published: string;
  featured: string;
  building: string;
  page: number;
};

export function parsePropertyFilters(
  params: Record<string, string | string[] | undefined>
): AdminPropertyFilters {
  const one = (value: string | string[] | undefined) =>
    Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

  return {
    q: one(params.q).trim().slice(0, 100),
    listingType: one(params.type),
    category: one(params.category),
    status: one(params.status),
    city: one(params.city),
    published: one(params.published),
    featured: one(params.featured),
    building: one(params.building),
    page: Math.max(1, Number(one(params.page)) || 1),
  };
}

export function propertyFiltersToQuery(
  filters: AdminPropertyFilters,
  overrides: Partial<AdminPropertyFilters> = {}
): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (merged.q) params.set("q", merged.q);
  if (merged.listingType) params.set("type", merged.listingType);
  if (merged.category) params.set("category", merged.category);
  if (merged.status) params.set("status", merged.status);
  if (merged.city) params.set("city", merged.city);
  if (merged.published) params.set("published", merged.published);
  if (merged.featured) params.set("featured", merged.featured);
  if (merged.building) params.set("building", merged.building);
  if (merged.page > 1) params.set("page", String(merged.page));

  const query = params.toString();
  return query ? `?${query}` : "";
}
