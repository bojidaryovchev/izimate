"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { clientApiFetch } from "@/lib/client-api";

export default function UploadsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ publicUrl: string; key: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // Get presigned URL
      const presignRes = await clientApiFetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          contentLength: file.size,
        }),
      });
      if (!presignRes.ok) throw new Error(`Presign failed: ${presignRes.status}`);
      const { uploadUrl, publicUrl, key } = await presignRes.json();

      // Upload directly to R2
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setResult({ publicUrl, key });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 dark:bg-black">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">Image Upload</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Test uploading images to R2 via presigned URLs
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <label
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              uploading
                ? "border-zinc-200 dark:border-zinc-700"
                : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-black dark:border-zinc-600 dark:border-t-white" />
                <span className="text-sm text-zinc-500">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="h-10 w-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16.5V18a2.5 2.5 0 002.5 2.5h13A2.5 2.5 0 0021 18v-1.5"
                  />
                </svg>
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  Click to choose an image
                </span>
                <span className="text-xs text-zinc-400">JPEG, PNG, WebP, or GIF — max 10MB</span>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Upload successful!</p>
            <img
              src={result.publicUrl}
              alt="Uploaded"
              className="mx-auto h-48 w-48 rounded-lg object-cover"
            />
            <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              <p className="truncate">
                <span className="font-medium">Key:</span> {result.key}
              </p>
              <p className="truncate">
                <span className="font-medium">URL:</span> {result.publicUrl}
              </p>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
