import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

/**
 * Adds or updates a row in the admin allowlist.
 *
 *   npm run admin:add -- lokesh@example.com "Lokesh Yadav" owner
 *
 * This exists because of a chicken-and-egg problem: team management lives in
 * /admin/settings, which requires being signed in, which requires a row in
 * this table. The first owner has to be created from outside the console.
 * After that, use the settings page.
 *
 * Re-running for an existing address updates the name and role and
 * reactivates the account rather than failing on the unique constraint —
 * which makes this also the way to restore access if someone is locked out.
 */
async function main() {
  const [emailArg, nameArg, roleArg = "staff"] = process.argv.slice(2);

  if (!emailArg || !nameArg) {
    // console.error(
    //   'Usage: npm run admin:add -- <email> "<full name>" [owner|staff]'
    // );
    process.exit(1);
  }

  if (roleArg !== "owner" && roleArg !== "staff") {
    // console.error(`Role must be "owner" or "staff", got "${roleArg}".`);
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    // console.error(`"${emailArg}" is not an email address.`);
    process.exit(1);
  }

  // Imported after dotenv has run, or db/client.ts throws on a missing
  // DATABASE_URL at import time.
  const { db } = await import("../client");
  const { adminUsers } = await import("../schema");

  const existing = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (existing[0]) {
    await db
      .update(adminUsers)
      .set({ name: nameArg, role: roleArg, isActive: true })
      .where(eq(adminUsers.id, existing[0].id));

    // console.log(`Updated ${email} — ${nameArg}, ${roleArg}, active.`);
  } else {
    await db
      .insert(adminUsers)
      .values({ email, name: nameArg, role: roleArg });

    // console.log(`Added ${email} — ${nameArg}, ${roleArg}.`);
  }

  // console.log("They can now request a sign-in link at /admin/login.");
  process.exit(0);
}

main().catch((error) => {
  // console.error("Failed to update the admin allowlist:", error);
  process.exit(1);
});
