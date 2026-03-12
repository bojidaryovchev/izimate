"use client";

import dynamic from "next/dynamic";

const RealtimeTestContent = dynamic(() => import("./content"), { ssr: false });

export default function RealtimeTestPage() {
  return <RealtimeTestContent />;
}
