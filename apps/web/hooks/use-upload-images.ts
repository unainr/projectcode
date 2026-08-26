// apps/web/hooks/use-upload-images.ts
import { useMutation } from "@tanstack/react-query";
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/next";
import { client } from "@/lib/hono";


type UploadResult =
  | { success: true; file: File; url: string; fileId: string }
  | { success: false; file: File; error: string };

export function useUploadImages() {


  return useMutation({
    mutationFn: async ({
      files,
      folder = "/products",
      onProgress,
    }: {
      files: File[];
      folder?: string;
      onProgress?: (fileIndex: number, percent: number) => void;
    }): Promise<UploadResult[]> => {
      const res = await client.api.upload.$get()
      if (!res.ok) throw new Error("Failed to get upload auth");

      const results = await Promise.allSettled(
        files.map(async (file, i) => {
          // each auth param set is single-use, so fetch fresh per file
          const authRes = i === 0 ? res : await client.api.upload.$get()
          const { token, expire, signature, publicKey } = await authRes.json();

          const result = await upload({
            file,
            fileName: file.name,
            token,
            expire,
            signature,
            publicKey,
            folder,
            onProgress: (event) => {
              onProgress?.(i, (event.loaded / event.total) * 100);
            },
          });

          return { success: true as const, file, url: result.url!, fileId: result.fileId! };
        })
      );

      return results.map((res, i) => {
        if (res.status === "fulfilled") return res.value;

        const error = res.reason;
        let message = "Upload failed";
        if (error instanceof ImageKitAbortError) message = `Aborted: ${error.reason}`;
        else if (error instanceof ImageKitInvalidRequestError) message = error.message;
        else if (error instanceof ImageKitUploadNetworkError) message = error.message;
        else if (error instanceof ImageKitServerError) message = error.message;

        return { success: false as const, file: files[i], error: message };
      });
    },
  });
}