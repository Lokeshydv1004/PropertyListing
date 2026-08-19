import { config } from "dotenv";

config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

/**
 * Creates the two Storage buckets, idempotently.
 *
 * Run once per environment: `npm run storage:init`. Buckets are project
 * configuration rather than schema, so they are not part of the Drizzle
 * migrations — but leaving them as a manual dashboard step is how staging
 * ends up subtly different from production.
 */

const IMAGE_BUCKET = "property-images";
const DOCUMENT_BUCKET = "property-documents";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // console.error(
    //   "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.\n" +
    //     "The secret key is at Project Settings → API Keys. It must NOT be prefixed NEXT_PUBLIC_."
    // );
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const buckets = [
    {
      id: IMAGE_BUCKET,
      // Public: these are property photographs on a marketing site, and
      // signing every one of them would break Next's image optimiser for no
      // benefit.
      public: true,
      fileSizeLimit: 8 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    },
    {
      id: DOCUMENT_BUCKET,
      // Also public, by decision: these are the title report and valuation
      // that the listing page invites people to read. If anything genuinely
      // confidential is ever stored here, flip this to private and switch
      // the public page to signed URLs.
      public: true,
      fileSizeLimit: 25 * 1024 * 1024,
      allowedMimeTypes: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    },
  ];

  for (const bucket of buckets) {
    const { error } = await supabase.storage.createBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes,
    });

    if (!error) {
      // console.log(`Created ${bucket.id}.`);
      continue;
    }

    // Already there is the expected outcome on every run after the first.
    if (/already exists/i.test(error.message)) {
      const { error: updateError } = await supabase.storage.updateBucket(
        bucket.id,
        {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit,
          allowedMimeTypes: bucket.allowedMimeTypes,
        }
      );

      // console.log(
      //   updateError
      //     ? `${bucket.id} exists; could not update its limits: ${updateError.message}`
      //     : `${bucket.id} already existed — limits refreshed.`
      // );
      continue;
    }

    // console.error(`Failed to create ${bucket.id}: ${error.message}`);
    process.exit(1);
  }

  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    // console.error("Could not list buckets:", error.message);
    process.exit(1);
  }

  // console.log(
  //   "\nBuckets now present:",
  //   data.map((bucket) => `${bucket.name}${bucket.public ? " (public)" : ""}`).join(", ")
  // );
}

main().catch((error) => {
  // console.error(error);
  process.exit(1);
});
