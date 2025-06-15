'use client';

import dynamic from 'next/dynamic';

const NetworkBanner = dynamic(() => import('./NetworkBanner'), { 
  ssr: false,
  loading: () => null 
});

export default function ClientOnlyNetworkBanner() {
  return <NetworkBanner />;
} 