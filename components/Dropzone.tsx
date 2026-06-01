"use client";

import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { ImagePlus, UploadCloud, X } from "lucide-react";
import { MAX_IMAGE_BYTES } from "@/lib/types";
import { cn } from "./cn";

const MB = (MAX_IMAGE_BYTES / (1024 * 1024)).toFixed(0);

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

interface DropzoneProps {
  /** Current image as a base64 data URL, or null when empty. */
  value: string | null;
  fileName: string | null;
  onChange: (dataUrl: string | null, fileName: string | null) => void;
  onError: (message: string | null) => void;
  disabled?: boolean;
}

export function Dropzone({
  value,
  fileName,
  onChange,
  onError,
  disabled,
}: DropzoneProps) {
  const onDrop = useCallback(
    async (accepted: File[], rejections: FileRejection[]) => {
      onError(null);
      if (rejections.length > 0) {
        const code = rejections[0].errors[0]?.code;
        if (code === "file-too-large") {
          onError(`Whoa, big fella — keep the photo under ${MB} MB.`);
        } else if (code === "file-invalid-type") {
          onError("Images only, please (JPG, PNG, WebP or GIF).");
        } else {
          onError("That file didn't work. Try another photo.");
        }
        return;
      }
      const file = accepted[0];
      if (!file) return;
      try {
        const dataUrl = await readAsDataUrl(file);
        onChange(dataUrl, file.name);
      } catch {
        onError("Couldn't read that file. Try another photo.");
      }
    },
    [onChange, onError],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: MAX_IMAGE_BYTES,
    multiple: true, // we only keep the first; lets us message on bad drops
    maxFiles: 1,
    disabled,
    noClick: !!value, // when a preview is shown, the big button handles re-pick
    noKeyboard: !!value,
  });

  if (value) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative overflow-hidden rounded-2xl border border-hairline bg-night-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={fileName ? `Selected photo: ${fileName}` : "Selected photo"}
            className="max-h-60 w-auto object-contain"
          />
          <button
            type="button"
            onClick={() => {
              onChange(null, null);
              onError(null);
            }}
            disabled={disabled}
            aria-label="Remove photo"
            className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-night/80 text-ink backdrop-blur transition hover:bg-coral disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm text-ink-soft">
          <span className="max-w-[12rem] truncate">{fileName ?? "Photo ready"}</span>
          <button
            type="button"
            onClick={open}
            disabled={disabled}
            className="font-semibold text-mango underline-offset-2 hover:underline disabled:opacity-50"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition",
        "border-hairline bg-night-2/60 hover:border-mango/70 hover:bg-surface/60",
        isDragActive && "border-mango bg-surface scale-[1.01]",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <input {...getInputProps()} aria-label="Upload a photo" />
      <div className="grid h-14 w-14 place-items-center rounded-full bg-brand text-night shadow-lg shadow-coral/20">
        {isDragActive ? (
          <UploadCloud className="h-7 w-7" aria-hidden="true" />
        ) : (
          <ImagePlus className="h-7 w-7" aria-hidden="true" />
        )}
      </div>
      <div>
        <p className="text-base font-semibold text-ink">
          {isDragActive ? "Drop it like it's hot" : "Tap to add a photo"}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          or drag &amp; drop · JPG, PNG, WebP · up to {MB} MB
        </p>
      </div>
    </div>
  );
}
