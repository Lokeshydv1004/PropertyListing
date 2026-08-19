import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "./env";

/**
 * Storage runs through a service-role client, held server-side only.
 *
 * Uploading with the publishable key would mean opening Storage RLS to
 * authenticated users and trusting the browser about what it writes and
 * where. Instead every upload goes through a Server Action that has already
 * called `requireAdmin()` — the browser never holds a key that can write to
 * the bucket, and the size and type limits are enforced somewhere the user
 * cannot edit.
 *
 * This key must never be prefixed NEXT_PUBLIC_. `server-only` above turns a
 * mistaken client import into a build error rather than a leak.
 */

export const IMAGE_BUCKET = "property-images";
export const DOCUMENT_BUCKET = "property-documents";

/** Newer Supabase projects call it a secret key; older ones service_role. */
function secretKey(): string | undefined {
  return (
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function storageConfigured(): boolean {
  return Boolean(secretKey() && process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export const STORAGE_SETUP_MESSAGE =
  "File storage isn't configured yet. Add SUPABASE_SECRET_KEY to .env.local and run `npm run storage:init`.";

export function createStorageClient() {
  const { url } = getSupabaseEnv();
  const key = secretKey();

  if (!key) throw new Error(STORAGE_SETUP_MESSAGE);

  return createClient(url, key, {
    // No session to persist and nothing to refresh: this client is created
    // per request, on the server, and authorises with the key alone.
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * What we accept, enforced server-side.
 *
 * The browser's file picker `accept` attribute is a convenience for the
 * person choosing, not a control — the action is a public endpoint and can be
 * handed anything at all.
 */
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** After the client-side resize an image should be far under this. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

/**
 * A storage path that cannot collide and cannot escape its folder.
 *
 * The original filename is never used as the path: "../" in a filename, or
 * two people uploading "photo.jpg" to the same listing, are both problems
 * that disappear if the name is generated rather than accepted.
 */
export function storagePath(
  propertyId: string,
  contentType: string,
  originalName: string
): string {
  const extension =
    EXTENSIONS[contentType] ??
    originalName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ??
    "bin";

  return `${propertyId}/${crypto.randomUUID()}.${extension}`;
}

export function publicUrlFor(bucket: string, path: string): string {
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Turns a public URL back into the object path, so deleting a file from a
 * listing can also remove it from the bucket instead of leaving an orphan
 * nobody will ever find again.
 *
 * Returns null for anything not in our own buckets — seeded picsum.photos
 * placeholders, or a URL someone pasted by hand.
 */
export function pathFromPublicUrl(
  url: string,
  bucket: string
): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;

  const path = url.slice(index + marker.length).split("?")[0];
  return path || null;
}
