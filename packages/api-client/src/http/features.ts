import type { FetchFn } from "./users.js";

interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  avatarUrl: string | null;
  rank: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  q: string;
}

export function createUploadsApi(apiFetch: FetchFn) {
  return {
    async presign(filename: string, contentType: string, contentLength: number): Promise<PresignResponse> {
      const res = await apiFetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, contentType, contentLength }),
      });
      if (!res.ok) throw new Error(`presign failed: ${res.status}`);
      return res.json() as Promise<PresignResponse>;
    },
  };
}

export function createSearchApi(apiFetch: FetchFn) {
  return {
    async search(q: string, opts?: { limit?: number; offset?: number }): Promise<SearchResponse> {
      const params = new URLSearchParams({ q });
      if (opts?.limit) params.set("limit", String(opts.limit));
      if (opts?.offset) params.set("offset", String(opts.offset));

      const res = await apiFetch(`/api/search?${params}`);
      if (!res.ok) throw new Error(`search failed: ${res.status}`);
      return res.json() as Promise<SearchResponse>;
    },
  };
}

export function createPaymentsApi(apiFetch: FetchFn) {
  return {
    async createCheckout(priceId: string, successUrl: string, cancelUrl: string): Promise<{ url: string }> {
      const res = await apiFetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, successUrl, cancelUrl }),
      });
      if (!res.ok) throw new Error(`createCheckout failed: ${res.status}`);
      return res.json() as Promise<{ url: string }>;
    },

    async createConnectLink(returnUrl: string, refreshUrl: string): Promise<{ url: string }> {
      const res = await apiFetch("/api/payments/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl, refreshUrl }),
      });
      if (!res.ok) throw new Error(`createConnectLink failed: ${res.status}`);
      return res.json() as Promise<{ url: string }>;
    },
  };
}
