const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export async function clientApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const { token } = await fetch("/api/token").then((r) => r.json());
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
