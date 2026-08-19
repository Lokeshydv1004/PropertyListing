"use server";

import { requireAdmin } from "@/lib/auth/admin";
import {
  DOCUMENT_BUCKET,
  DOCUMENT_TYPES,
  IMAGE_BUCKET,
  IMAGE_TYPES,
  MAX_DOCUMENT_BYTES,
  MAX_IMAGE_BYTES,
  STORAGE_SETUP_MESSAGE,
  createStorageClient,
  pathFromPublicUrl,
  publicUrlFor,
  storageConfigured,
  storagePath,
} from "@/lib/supabase/storage";

export type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

export type MediaKind = "image" | "document";

/**
 * Uploads one file and returns its public URL.
 *
 * One file per call rather than a batch: the client shows per-file progress,
 * and one oversized file in a selection of twelve should not fail the other
 * eleven.
 *
 * Everything about the file is re-checked here. The picker's `accept`, the
 * client-side resize and the disabled button are all conveniences for the
 * person uploading — this action is a public endpoint that can be handed a
 * 400MB executable by anyone who reads one network request.
 */
export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  if (!storageConfigured()) {
    return { success: false, error: STORAGE_SETUP_MESSAGE };
  }

  const file = formData.get("file");
  const kind = formData.get("kind") === "document" ? "document" : "image";
  const propertyId = String(formData.get("propertyId") ?? "").trim();

  if (!(file instanceof File)) {
    return { success: false, error: "No file received." };
  }

  // Uploads can happen before a new listing has an id, so they land in a
  // "drafts" folder rather than being blocked until after the first save.
  const folder = /^[0-9a-f-]{36}$/i.test(propertyId) ? propertyId : "drafts";

  const allowedTypes = kind === "image" ? IMAGE_TYPES : DOCUMENT_TYPES;
  const maxBytes = kind === "image" ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;

  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error:
        kind === "image"
          ? "Images must be JPEG, PNG, WebP or AVIF."
          : "Documents must be PDF, Word or an image.",
    };
  }

  if (file.size > maxBytes) {
    return {
      success: false,
      error: `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is ${maxBytes / 1024 / 1024}MB.`,
    };
  }

  if (file.size === 0) {
    return { success: false, error: "That file is empty." };
  }

  const bucket = kind === "image" ? IMAGE_BUCKET : DOCUMENT_BUCKET;
  const path = storagePath(folder, file.type, file.name);

  try {
    const supabase = createStorageClient();

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        // Paths carry a UUID, so an overwrite would mean a collision that
        // cannot happen — failing loudly is better than silently replacing.
        upsert: false,
        cacheControl: "31536000",
      });

    if (error) {
      // console.error("[admin] upload failed", error);
      return {
        success: false,
        error: /bucket not found/i.test(error.message)
          ? "The storage bucket doesn't exist yet. Run `npm run storage:init`."
          : "Upload failed. Please try again.",
      };
    }

    return { success: true, url: publicUrlFor(bucket, path) };
  } catch {
    // console.error("[admin] upload threw", error);
    return { success: false, error: STORAGE_SETUP_MESSAGE };
  }
}

/**
 * Removes a file from its bucket.
 *
 * Called when a file is taken off a listing, so the bucket doesn't
 * accumulate objects nothing references — those are invisible, unbilled
 * until they aren't, and impossible to audit later.
 *
 * A URL we don't own (the seeded picsum.photos placeholders, or something
 * pasted by hand) is a no-op rather than an error: removing it from the
 * listing is still the right outcome.
 */
export async function deleteMedia(
  url: string,
  kind: MediaKind
): Promise<{ success: boolean; error?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  if (!storageConfigured()) return { success: true };

  const bucket = kind === "image" ? IMAGE_BUCKET : DOCUMENT_BUCKET;
  const path = pathFromPublicUrl(url, bucket);

  if (!path) return { success: true };

  try {
    const supabase = createStorageClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      // console.error("[admin] delete failed", error);
      // The listing still drops the reference; a leftover object is a tidiness
      // problem, not a reason to block the edit.
      return { success: true };
    }
  } catch {
    // console.error("[admin] delete threw", error);
  }

  return { success: true };
}
