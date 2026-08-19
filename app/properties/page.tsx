import { PropertyListCard } from "@/components/properties/property-list-card";
import { getProperties } from "@/lib/queries/properties";

export default async function PropertiesPage() {
  const results = await getProperties({}, { page: 1, pageSize: 6 });
  return (
    <div className="p-10">
      <h1>PROBE4 — {results.length} cards</h1>
      {results.map((p) => <PropertyListCard key={p.id} property={p} />)}
    </div>
  );
}
