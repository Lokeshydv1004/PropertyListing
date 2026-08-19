import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 3 });

async function time(label, fn) {
  const t = Date.now();
  try { const r = await fn(); console.log(label.padEnd(28), (Date.now()-t)+"ms", Array.isArray(r)?`(${r.length} rows)`:""); }
  catch (e) { console.log(label.padEnd(28), "ERROR", e.message.slice(0,90)); }
}

await time("count(*)", () => sql`select count(*)::int from properties`);
await time("listing type counts", () => sql`select listing_type, count(*)::int from properties group by listing_type`);
await time("distinct city", () => sql`select distinct city from properties order by city`);
await time("distinct category", () => sql`select distinct category from properties order by category`);
await time("distinct listing_type", () => sql`select distinct listing_type from properties order by listing_type`);
await time("page query", () => sql`select * from properties order by created_at desc, id asc limit 6 offset 0`);

console.log("\n-- all 4 in parallel, like the page does --");
const t = Date.now();
await Promise.all([
  sql`select distinct city from properties order by city`,
  sql`select distinct category from properties order by category`,
  sql`select distinct listing_type from properties order by listing_type`,
  sql`select listing_type, count(*)::int from properties group by listing_type`,
  sql`select count(*)::int from properties`,
  sql`select * from properties order by created_at desc, id asc limit 6 offset 0`,
]);
console.log("parallel total:", (Date.now()-t)+"ms");
await sql.end();
