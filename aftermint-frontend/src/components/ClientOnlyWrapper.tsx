"use client";

import dynamic from "next/dynamic";

// Import NetworkBanner with dynamic import (client-side only)
const NetworkBanner = dynamic(() => import("@/components/NetworkBanner"), { ssr: false });

export function ClientOnlyNetworkBanner() {
  return <NetworkBanner />;
} 