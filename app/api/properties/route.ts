import { NextRequest, NextResponse } from "next/server";
import { getProperties } from "@/lib/queries/properties";
import { parsePropertyFilters } from "@/lib/queries/parse-filters";

const PAGE_SIZE = 6;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Same parser the listing page uses, so infinite scroll can never return a
  // differently-filtered set than the server-rendered first page.
  const { filters, page } = parsePropertyFilters(searchParams);

  const results = await getProperties(filters, { page, pageSize: PAGE_SIZE });

  return NextResponse.json({ properties: results });
}
