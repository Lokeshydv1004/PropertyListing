import {
  listingStatusEnum,
  listingTypeEnum,
  propertyCategoryEnum,
} from "@/db/schema";
import type { PropertyFilters, PropertySort } from "./properties";

const VALID_LISTING_TYPES = new Set<string>(listingTypeEnum.enumValues);
const VALID_CATEGORIES = new Set<string>(propertyCategoryEnum.enumValues);
const VALID_STATUSES = new Set<string>(listingStatusEnum.enumValues);
const VALID_SORTS = new Set<PropertySort>([
  "newest",
  "most_funded",
  "closing_soon",
  "price_low",
  "price_high",
]);

type ParamBag =
  | Record<string, string | string[] | undefined>
  | URLSearchParams;

function read(params: ParamBag, key: string): string | undefined {
  if (params instanceof URLSearchParams) {
    return params.get(key) ?? undefined;
  }
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/**
 * Single source of truth for turning a query string into filters.
 *
 * The listing page and /api/properties previously each had their own copy of
 * this logic. Infinite scroll calls the API with the page's own query string,
 * so any drift between the two parsers means scrolling silently returns a
 * differently-filtered set than the first page.
 */
export function parsePropertyFilters(params: ParamBag): {
  filters: PropertyFilters;
  page: number;
} {
  const get = (key: string) => read(params, key);

  const listingType = get("listingType");
  const category = get("category");
  const status = get("status");
  const sort = get("sort");

  return {
    page: Math.max(1, parseNumber(get("page")) ?? 1),
    filters: {
      search: get("search")?.trim() || undefined,
      city: get("city") || undefined,
      listingType:
        listingType && VALID_LISTING_TYPES.has(listingType)
          ? (listingType as PropertyFilters["listingType"])
          : undefined,
      category:
        category && VALID_CATEGORIES.has(category)
          ? (category as PropertyFilters["category"])
          : undefined,
      status:
        status && VALID_STATUSES.has(status)
          ? (status as PropertyFilters["status"])
          : undefined,
      minPrice: parseNumber(get("minPrice")),
      maxPrice: parseNumber(get("maxPrice")),
      maxMinInvestment: parseNumber(get("maxMinInvestment")),
      maxMonthlyRent: parseNumber(get("maxMonthlyRent")),
      minFootfall: parseNumber(get("minFootfall")),
      kitchenOnly: get("kitchenOnly") === "1" ? true : undefined,
      sort:
        sort && VALID_SORTS.has(sort as PropertySort)
          ? (sort as PropertySort)
          : undefined,
    },
  };
}
