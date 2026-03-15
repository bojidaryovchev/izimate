import { apiFetch } from "./api";

interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function uploadFile(file: File): Promise<{ publicUrl: string; key: string }> {
  const { uploadUrl, publicUrl, key } = await presign(file.name, file.type, file.size);

  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  return { publicUrl, key };
}

async function presign(filename: string, contentType: string, contentLength: number): Promise<PresignResponse> {
  const res = await apiFetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, contentType, contentLength }),
  });
  if (!res.ok) throw new Error(`Presign failed: ${res.status}`);
  return res.json();
}
