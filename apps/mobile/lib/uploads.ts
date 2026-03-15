import * as ImagePicker from "expo-image-picker";
import { apiFetch } from "./api";

interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

async function getPresignedUrl(filename: string, contentType: string, contentLength: number): Promise<PresignResponse> {
  const res = await apiFetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, contentType, contentLength }),
  });
  if (!res.ok) throw new Error(`Presign failed: ${res.status}`);
  return res.json();
}

async function uploadToR2(uploadUrl: string, uri: string, contentType: string): Promise<void> {
  const response = await fetch(uri);
  const blob = await response.blob();
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });
}

export async function pickAndUploadImage(): Promise<{ publicUrl: string; key: string } | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const filename = asset.fileName ?? `photo-${Date.now()}.jpg`;
  const contentType = asset.mimeType ?? "image/jpeg";
  const contentLength = asset.fileSize ?? 0;

  const { uploadUrl, publicUrl, key } = await getPresignedUrl(filename, contentType, contentLength);
  await uploadToR2(uploadUrl, asset.uri, contentType);

  return { publicUrl, key };
}

export async function takeAndUploadPhoto(): Promise<{ publicUrl: string; key: string } | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const filename = asset.fileName ?? `photo-${Date.now()}.jpg`;
  const contentType = asset.mimeType ?? "image/jpeg";
  const contentLength = asset.fileSize ?? 0;

  const { uploadUrl, publicUrl, key } = await getPresignedUrl(filename, contentType, contentLength);
  await uploadToR2(uploadUrl, asset.uri, contentType);

  return { publicUrl, key };
}
