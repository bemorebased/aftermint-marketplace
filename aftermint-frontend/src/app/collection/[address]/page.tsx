import React from 'react';
import CollectionPageClient from './CollectionPageClient';

// Main collection page component - Server Component
export default async function CollectionPage({ 
  params 
}: { 
  params: Promise<{ address: string }> 
}) {
  const { address } = await params;
  return <CollectionPageClient address={address} />;
}