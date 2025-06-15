"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { basedCollections, Collection } from '@/data/collections'; // Assuming Collection interface is exported
import NftCard from '@/components/NftCard'; // You might want a specific card for this page or reuse NftCard
import { ArrowRight, LayoutGrid, List } from 'lucide-react';

// Helper to generate placeholder NFTs for a collection
const generatePlaceholderNFTsForCollection = (collection: Collection, count: number) => {
  const nfts = [];
  for (let i = 0; i < count; i++) {
    nfts.push({
      id: `${collection.id}-${i}`,
      name: `${collection.name} #${Math.floor(Math.random() * 1000) + 1}`,
      imageUrl: collection.logoUrl, // Using logo as a placeholder image
      collectionName: collection.name,
      collectionAddress: collection.id,
      price: parseFloat((Math.random() * 2 + 0.1).toFixed(2)), // Placeholder price
    });
  }
  return nfts;
};

export default function TrendingPage() {
  const [galleryNfts, setGalleryNfts] = useState<any[]>([]);
  const [listNfts, setListNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Select a few collections and generate NFTs for them
    const galleryCollections = basedCollections.slice(0, 5); // Take first 5 collections
    let galleryItems: any[] = [];
    galleryCollections.forEach(col => {
      galleryItems = galleryItems.concat(generatePlaceholderNFTsForCollection(col, 2)); // 2 NFTs per collection
    });
    setGalleryNfts(galleryItems.slice(0, 10)); // Ensure we have exactly 10 for the gallery

    const listCollections = basedCollections.slice(5, 10); // Take next 5 collections
    let listItems: any[] = [];
    listCollections.forEach(col => {
      listItems = listItems.concat(generatePlaceholderNFTsForCollection(col, 2)); // 2 NFTs per collection
    });
    setListNfts(listItems.slice(0, 10)); // Ensure we have exactly 10 for the list

    setLoading(false);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <LayoutGrid className="text-theme-primary" size={28} />
          <h1 className="text-3xl md:text-4xl font-bold text-theme-text-primary">
            Top Viewed NFTs
          </h1>
        </div>
        <p className="text-theme-text-secondary text-lg">
          Catch up on what&apos;s been popular recently.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-16">
          {Array(10).fill(0).map((_, i) => (
            <div key={`gallery-placeholder-${i}`} className="animate-pulse">
              <div className="aspect-square bg-theme-surface rounded-xl mb-3"></div>
              <div className="h-4 bg-theme-surface rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-theme-surface rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-16">
          {galleryNfts.map((nft) => (
            <Link key={nft.id} href={`/nft/${nft.collectionAddress}/${nft.id.split('-').pop()}`} passHref>
              <div className="group bg-theme-surface rounded-xl border border-theme-border p-3 transition-all duration-300 hover:shadow-xl hover:border-theme-primary cursor-pointer">
                <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                  <Image src={nft.imageUrl || '/placeholder-image.png'} alt={nft.name} fill className="object-cover" />
                </div>
                <h3 className="font-semibold text-sm text-theme-text-primary truncate mb-1 group-hover:text-theme-primary">{nft.name}</h3>
                <p className="text-xs text-theme-text-secondary truncate">{nft.collectionName}</p>
                <p className="text-xs font-medium text-theme-primary mt-1">{nft.price} BASED</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <List className="text-theme-primary" size={28} />
          <h2 className="text-2xl md:text-3xl font-bold text-theme-text-primary">
            Next 10 Trending
          </h2>
        </div>
         <p className="text-theme-text-secondary text-lg">
          Continue discovering other popular items.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(10).fill(0).map((_, i) => (
            <div key={`list-placeholder-${i}`} className="animate-pulse flex items-center gap-4 p-3 bg-theme-surface rounded-xl">
              <div className="w-16 h-16 bg-theme-border rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-theme-border rounded w-3/5"></div>
                <div className="h-3 bg-theme-border rounded w-2/5"></div>
                <div className="h-3 bg-theme-border rounded w-1/4"></div>
              </div>
              <div className="w-20 h-4 bg-theme-border rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {listNfts.map((nft) => (
            <Link key={nft.id} href={`/nft/${nft.collectionAddress}/${nft.id.split('-').pop()}`} passHref>
              <div className="group flex items-center gap-4 p-3 bg-theme-surface rounded-xl border border-theme-border transition-all duration-300 hover:shadow-lg hover:border-theme-primary cursor-pointer">
                <div className="w-16 h-16 rounded-lg overflow-hidden relative flex-shrink-0">
                  <Image src={nft.imageUrl || '/placeholder-image.png'} alt={nft.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-md text-theme-text-primary truncate group-hover:text-theme-primary">{nft.name}</h3>
                  <p className="text-sm text-theme-text-secondary truncate">{nft.collectionName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-md text-theme-primary">{nft.price} BASED</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
       <div className="flex justify-center mt-12">
            <Link 
              href="/collections" // Link to your main collections page
              className="inline-flex items-center gap-2 px-6 py-3 border border-theme-primary text-theme-primary rounded-lg hover:bg-theme-primary/10 transition-colors font-medium"
            >
              View All Collections
              <ArrowRight size={18} />
            </Link>
        </div>
    </div>
  );
}
