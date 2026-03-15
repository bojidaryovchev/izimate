"use client";

import Link from "next/link";
import { useState } from "react";
import { clientApiFetch } from "@/lib/client-api";

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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setSearching(true);
      setError(null);
      const res = await clientApiFetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=20`);
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data: SearchResponse = await res.json();
      setResults(data.results);
      setTotal(data.total);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
      setTotal(0);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 p-8 dark:bg-black">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">Search</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Full-text search across users</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-black placeholder-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {searching ? "..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {searched && !error && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {total} result{total !== 1 ? "s" : ""} found
          </p>
        )}

        <div className="space-y-2">
          {results.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {item.avatarUrl ? (
                <img src={item.avatarUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  {item.title.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-black dark:text-white">{item.title}</p>
                {item.subtitle && (
                  <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{item.subtitle}</p>
                )}
                <p className="text-xs uppercase text-zinc-400 dark:text-zinc-500">{item.type}</p>
              </div>
            </div>
          ))}
        </div>

        {searched && !searching && results.length === 0 && !error && (
          <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">No results found</p>
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
