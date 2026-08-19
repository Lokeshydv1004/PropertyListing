/**
 * Shrinks a photograph in the browser before it is uploaded.
 *
 * A modern phone camera produces 4000×3000 at 6MB. The largest that image is
 * ever displayed at is roughly 1600px wide, so uploading the original costs
 * the person on the other end their data allowance and costs us storage, for
 * pixels nobody will see. Resizing here also means the slow part — the upload
 * — is 10× shorter over a phone connection.
 *
 * Falls back to the original file whenever anything is unusual (a format the
 * canvas can't decode, an image already small enough, a browser without
 * OffscreenCanvas). An unresized upload is a much better outcome than a
 * failed one.
 */

const MAX_EDGE = 2000;
const QUALITY = 0.82;

export async function resizeImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  // Vector and animated formats must not be flattened into a JPEG.
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);

    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));

    // Already small enough, and re-encoding would only lose quality.
    if (scale === 1 && file.size < 1_500_000) {
      bitmap.close();
      return file;
    }

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY)
    );

    if (!blob || blob.size >= file.size) return file;

    return new File([blob], replaceExtension(file.name, "jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

function replaceExtension(name: string, extension: string): string {
  return `${name.replace(/\.[^.]+$/, "")}.${extension}`;
}
