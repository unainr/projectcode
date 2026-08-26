// apps/web/components/image-uploader.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { useUploadImages } from "@/hooks/use-upload-images";

type PreviewFile = {
  file: File;
  previewUrl: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  uploadedUrl?: string;
  error?: string;
};

export function ImageUploader({
  multiple = true,
  folder = "/seer",
  onUploaded,
}: {
  multiple?: boolean;
  folder?: string;
  onUploaded?: (result: { url: string; fileId: string }) => void;
}) {
  const [items, setItems] = useState<PreviewFile[]>([]);
  const { mutateAsync: uploadImages } = useUploadImages();

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [items]);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const files = multiple ? Array.from(fileList) : [fileList[0]];
      const newItems: PreviewFile[] = files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: "pending",
      }));

      setItems((prev) => (multiple ? [...prev, ...newItems] : newItems));

      const results = await uploadImages({
        files,
        folder,
        onProgress: (fileIndex, percent) => {
          setItems((prev) =>
            prev.map((item) =>
              item.file === files[fileIndex]
                ? { ...item, status: "uploading", progress: percent }
                : item
            )
          );
        },
      });

      // fire side-effect callbacks OUTSIDE the setState updater —
      // calling parent setState from inside a setItems updater triggers
      // "Cannot update a component while rendering a different component"
      for (const result of results) {
        if (result.success) {
          onUploaded?.({ url: result.url, fileId: result.fileId });
        }
      }

      setItems((prev) =>
        prev.map((item) => {
          const result = results.find((r) => r.file === item.file);
          if (!result) return item;

          return result.success
            ? { ...item, status: "done", uploadedUrl: result.url, progress: 100 }
            : { ...item, status: "error", error: result.error };
        })
      );
    },
    [multiple, folder, uploadImages, onUploaded]
  );

  const removeItem = (previewUrl: string) => {
    setItems((prev) => prev.filter((item) => item.previewUrl !== previewUrl));
  };

  return (
    <div className="w-full space-y-4">
      <label
        htmlFor="image-upload"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 text-center cursor-pointer transition-colors hover:border-muted-foreground/50"
      >
        <Upload className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag & drop {multiple ? "images" : "an image"}, or click to browse
        </p>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.previewUrl}
              className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              <img
                src={item.uploadedUrl ?? item.previewUrl}
                alt={item.file.name}
                className="h-full w-full object-cover"
              />

              {item.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 text-white">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-xs">{Math.round(item.progress)}%</span>
                </div>
              )}

              {item.status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/70 p-1 text-center text-xs text-white">
                  {item.error}
                </div>
              )}

              <button
                type="button"
                onClick={() => removeItem(item.previewUrl)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}