"use client";

import { configureSocket, connectAll, disconnectAll, getSocket } from "@izimate/api-client";
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL!;

const SocketReadyContext = createContext(false);

export function useSocketReady() {
  return useContext(SocketReadyContext);
}

async function fetchToken(): Promise<string> {
  const res = await fetch("/api/token");
  if (!res.ok) throw new Error("Failed to fetch token");
  const { token } = await res.json();
  return token;
}

export function SocketProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!REALTIME_URL) return;

    // Only connect if user is authenticated
    let cancelled = false;
    fetchToken()
      .then(() => {
        if (cancelled) return;
        configureSocket({ url: REALTIME_URL, getToken: fetchToken });
        getSocket("/");
        getSocket("/presence");
        getSocket("/notifications");
        getSocket("/chat");
        connectAll();
        setReady(true);
      })
      .catch(() => {
        // Not authenticated — skip socket connection
      });

    return () => {
      cancelled = true;
      disconnectAll();
    };
  }, []);

  return <SocketReadyContext.Provider value={ready}>{children}</SocketReadyContext.Provider>;
}
