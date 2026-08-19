"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Star,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { deleteMedia, uploadMedia } from "@/lib/actions/admin-media";
import { resizeImage } from "@/lib/admin/resize-image";

type Upload = {
  name: string;
  state: "resizing" | "uploading" | "failed";
  error?: string;
};

/**
 * The images on a listing: upload, order, cover, remove.
 *
 * `images` is an ordered `text[]` with no separate cover column, so position
 * zero *is* the cover — which is invisible unless the UI says so. Hence the
 * explicit "Cover" badge rather than leaving people to infer it.
 */
export function ImageManager({
  value,
  onChange,
  propertyId,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  /** Groups uploads by listing in the bucket. Absent while creating. */
  propertyId?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploads(list.map((file) => ({ name: file.name, state: "resizing" })));

    // Sequential, not parallel. Ten phone photos at once saturates an Indian
    // mobile uplink and every one of them slows the others down; one at a
    // time means the first pictures are usable while the rest arrive.
    const uploaded: string[] = [];

    for (const [index, file] of list.entries()) {
      const resized = await resizeImage(file);

      setUploads((current) =>
        current.map((item, i) =>
          i === index ? { ...item, state: "uploading" } : item
        )
      );

      const formData = new FormData();
      formData.append("file", resized);
      formData.append("kind", "image");
      if (propertyId) formData.append("propertyId", propertyId);

      const result = await uploadMedia(formData);

      if (result.success) {
        uploaded.push(result.url);
        setUploads((current) => current.filter((_, i) => i !== index));
      } else {
        setUploads((current) =>
          current.map((item, i) =>
            i === index ? { ...item, state: "failed", error: result.error } : item
          )
        );
      }
    }

    if (uploaded.length > 0) onChange([...value, ...uploaded]);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  async function remove(index: number) {
    const url = value[index];
    onChange(value.filter((_, i) => i !== index));
    // Fire and forget: the listing has already dropped it, and a failed
    // bucket delete must not put the image back on screen.
    void deleteMedia(url, "image");
  }

  return (
    <div>
      <Label>Images</Label>
      <p className="mt-0.5 text-xs text-muted-foreground">
        The first image is the cover — it is what appears on cards, in search
        results and on WhatsApp previews. Drag to reorder.
      </p>

      {value.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((url, index) => (
            <li
              key={url}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (dragIndex !== null) move(dragIndex, index);
                setDragIndex(null);
              }}
              className={cn(
                "group relative overflow-hidden rounded-lg border border-border bg-muted",
                dragIndex === index && "opacity-40"
              )}
            >
              <Image
                src={url}
                alt=""
                width={320}
                height={200}
                className="aspect-[16/10] w-full object-cover"
                unoptimized
              />

              {index === 0 && (
                <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded bg-brand-green px-1.5 py-0.5 text-xs font-medium text-white">
                  <Star className="size-3" aria-hidden="true" />
                  Cover
                </span>
              )}

              {/* Arrows as well as drag: dragging is fiddly on a laptop
                  trackpad and impossible with a keyboard. */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-1 py-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ChevronLeft className="size-3" aria-hidden="true" />
                  <span className="sr-only">Move image {index + 1} earlier</span>
                </Button>

                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => remove(index)}
                >
                  <X className="size-3" aria-hidden="true" />
                  <span className="sr-only">Remove image {index + 1}</span>
                </Button>

                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  disabled={index === value.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ChevronRight className="size-3" aria-hidden="true" />
                  <span className="sr-only">Move image {index + 1} later</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "mt-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          dragOver ? "border-brand-green bg-brand-green-light" : "border-border"
        )}
      >
        <ImagePlus
          className="mx-auto size-6 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Drop photographs here, or
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => inputRef.current?.click()}
        >
          Choose files
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          JPEG, PNG, WebP or AVIF. Large photographs are shrunk here before
          upload, so a 6MB phone picture is not what gets served.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            // Lets the same file be picked again after a failure.
            event.target.value = "";
          }}
        />
      </div>

      {uploads.length > 0 && (
        <ul className="mt-2 space-y-1">
          {uploads.map((upload, index) => (
            <li
              key={`${upload.name}-${index}`}
              className="flex items-center gap-2 text-xs"
            >
              {upload.state === "failed" ? (
                <>
                  <X className="size-3 text-destructive" aria-hidden="true" />
                  <span className="text-destructive">
                    {upload.name} — {upload.error}
                  </span>
                </>
              ) : (
                <>
                  <Loader2
                    className="size-3 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">
                    {upload.name} — {upload.state === "resizing" ? "shrinking" : "uploading"}…
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
