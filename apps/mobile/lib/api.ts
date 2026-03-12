import * as SecureStore from "expo-secure-store";

const API_BASE = process.env.EXPO_PUBLIC_API_URL!;

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await SecureStore.getItemAsync("auth_token");
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
