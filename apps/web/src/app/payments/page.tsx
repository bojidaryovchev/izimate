"use client";

import Link from "next/link";
import { useState } from "react";
import { clientApiFetch } from "@/lib/client-api";

export default function PaymentsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading("checkout");
      setError(null);
      const res = await clientApiFetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: "price_test_placeholder",
          successUrl: `${window.location.origin}/payments?status=success`,
          cancelUrl: `${window.location.origin}/payments?status=cancelled`,
        }),
      });
      if (!res.ok) throw new Error(`Checkout failed: ${res.status}`);
      const { url } = await res.json();
      window.open(url, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(null);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading("connect");
      setError(null);
      const res = await clientApiFetch("/api/payments/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/payments?connect=return`,
          refreshUrl: `${window.location.origin}/payments?connect=refresh`,
        }),
      });
      if (!res.ok) throw new Error(`Connect setup failed: ${res.status}`);
      const { url } = await res.json();
      window.open(url, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connect setup failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 dark:bg-black">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">Payments</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Test Stripe Checkout & Connect integration
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-black dark:text-white">Stripe Checkout</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Creates a checkout session and opens the Stripe payment page in a new tab
            </p>
            <button
              onClick={handleCheckout}
              disabled={loading !== null}
              className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading === "checkout" ? "Creating session..." : "Start Checkout"}
            </button>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-black dark:text-white">Stripe Connect</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Creates a Connect onboarding link for seller accounts
            </p>
            <button
              onClick={handleConnect}
              disabled={loading !== null}
              className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading === "connect" ? "Creating link..." : "Start Connect Onboarding"}
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
