import { auth0 } from "@/lib/auth0";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const tokenSet = await auth0.getAccessToken();
  const headers = new Headers(init?.headers);
  if (tokenSet.token) {
    headers.set("Authorization", `Bearer ${tokenSet.token}`);
  }
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
