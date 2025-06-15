"use client";

import { useState, useEffect } from 'react';
import { fetchCollectionWithNFTs, NFTData, CollectionData } from '../../collection/[address]/debug-helper';
import DirectNFTCard from '../../direct-nft-card';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function DirectMarketPage({ params }: { params: Promise<{ address: string }> }) {
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');
  const router = useRouter();
  
  // Resolve params Promise
  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setAddress(resolved.address);
    }
    resolveParams();
  }, [params]);
  
  useEffect(() => {
    if (!address) return;
    
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchCollectionWithNFTs(address);
        if (data) {
        setCollectionData(data.collection);
        setNfts(data.nfts);
        } else {
          throw new Error('Failed to load collection data');
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading collection data:', error);
        setError(error.message || 'Failed to load collection data');
        setLoading(false);
      }
    }
    
    fetchData();
  }, [address]);
  
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Force refresh the page
    router.refresh();
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex justify-center">
          <div className="animate-pulse text-xl">Loading collection data...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-600/20 border border-red-700 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
        <Link href="/collection" className="text-blue-400 hover:underline">
          View all collections
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="glass-card rounded-xl border border-theme-border p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="flex-grow">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {collectionData?.name}
              </h1>
              <p className="text-sm opacity-70 mb-2">
                {collectionData?.symbol} • {collectionData?.totalSupply || 0} items
              </p>
              <p className="text-sm mb-4 font-mono break-all">
                {address}
              </p>
              
              <div className="mt-4">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and sorting */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-xl font-semibold">All NFTs</h2>
          
          <div className="flex flex-wrap gap-2">
            <Link 
              href={`/debug-collection/${address}`}
              className="px-4 py-2 bg-theme-surface hover:bg-theme-surface/80 border border-theme-border rounded-lg"
            >
              Debug View
            </Link>
            <Link 
              href={`/collection/${address}`}
              className="px-4 py-2 bg-theme-surface hover:bg-theme-surface/80 border border-theme-border rounded-lg"
            >
              Standard View
            </Link>
          </div>
        </div>
      </div>
      
      {/* NFT grid */}
      {nfts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {nfts.map((nft) => (
            <DirectNFTCard
              key={nft.id}
              id={nft.id}
              tokenId={nft.tokenId}
              name={nft.name}
              image={nft.image}
              owner={nft.owner}
              isListed={nft.isListed}
              price={nft.price}
              seller={nft.listing?.seller || nft.owner}
              collection={{
                contract: address,
                name: collectionData?.name || 'Collection'
              }}
              contractAddress={address}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border border-theme-border rounded-lg bg-theme-surface/30">
          <h3 className="text-xl mb-2">No NFTs found</h3>
          <p className="opacity-70">This collection doesn't have any NFTs yet.</p>
        </div>
      )}
    </div>
  );
} 