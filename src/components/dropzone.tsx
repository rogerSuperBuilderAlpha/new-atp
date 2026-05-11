"use client";

import { ImageUp, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DropzoneProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  label?: string;
  description?: string;
  className?: string;
  compact?: boolean;
  onPreviewClick?: (url: string) => void;
};

export function Dropzone({
  file,
  onFileChange,
  label = "Drop label image here",
  description = "PNG, JPEG, GIF, or WEBP",
  className,
  compact = false,
  onPreviewClick,
}: DropzoneProps) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white/70 p-3 shadow-sm transition hover:border-slate-500",
        className,
      )}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const nextFile = event.dataTransfer.files.item(0);
        if (nextFile) onFileChange(nextFile);
      }}
    >
      <label
        className={cn(
          "flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl bg-slate-50/80 p-3 text-center",
          compact ? "min-h-64 sm:min-h-72 lg:min-h-48" : "min-h-72",
        )}
      >
        <input
          className="sr-only"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={(event) => onFileChange(event.target.files?.item(0) ?? null)}
        />
        {previewUrl ? (
          <button
            type="button"
            className="relative h-full w-full overflow-hidden rounded-2xl bg-white ring-offset-2 transition hover:ring-2 hover:ring-slate-950"
            onClick={(event) => {
              event.preventDefault();
              onPreviewClick?.(previewUrl);
            }}
          >
            <Image src={previewUrl} alt="Selected label preview" fill className="object-contain" />
            <span className="absolute bottom-3 right-3 rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
              View large
            </span>
          </button>
        ) : (
          <>
            <div className="mb-3 rounded-2xl bg-slate-900 p-3 text-white">
              <ImageUp className={compact ? "h-6 w-6" : "h-8 w-8"} aria-hidden />
            </div>
            <p className={cn("font-semibold text-slate-950", compact ? "text-base" : "text-xl")}>{label}</p>
            <p className="mt-2 max-w-sm text-sm text-slate-600">{description}</p>
          </>
        )}
      </label>
      {file ? (
        <div className="mt-2 flex shrink-0 items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 text-sm shadow-sm">
          <span className="truncate font-medium text-slate-800">{file.name}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => onFileChange(null)}>
            <X className="mr-1 h-4 w-4" aria-hidden />
            Remove
          </Button>
        </div>
      ) : null}
    </div>
  );
}
