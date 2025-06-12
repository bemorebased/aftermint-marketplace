"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Hardcoded mock NFT data to avoid API calls
const mockNfts = [
  {
    name: "MockNFT #0",
    description: "A mock NFT for testing the marketplace",
    image: "https://picsum.photos/seed/0/400/400",
    attributes: [
      { trait_type: "Background", value: "Blue" },
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Power", value: 50 }
    ]
  },
  {
    name: "MockNFT #1",
    description: "A mock NFT for testing the marketplace",
    image: "https://picsum.photos/seed/1/400/400",
    attributes: [
      { trait_type: "Background", value: "Red" },
      { trait_type: "Rarity", value: "Uncommon" },
      { trait_type: "Power", value: 60 }
    ]
  },
  {
    name: "MockNFT #2",
    description: "A mock NFT for testing the marketplace",
    image: "https://picsum.photos/seed/2/400/400",
    attributes: [
      { trait_type: "Background", value: "Green" },
      { trait_type: "Rarity", value: "Rare" },
      { trait_type: "Power", value: 70 }
    ]
  },
  {
    name: "MockNFT #3",
    description: "A mock NFT for testing the marketplace",
    image: "https://picsum.photos/seed/3/400/400",
    attributes: [
      { trait_type: "Background", value: "Yellow" },
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Power", value: 80 }
    ]
  },
  {
    name: "MockNFT #4",
    description: "A mock NFT for testing the marketplace",
    image: "https://picsum.photos/seed/4/400/400",
    attributes: [
      { trait_type: "Background", value: "Purple" },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Power", value: 90 }
    ]
  }
];

export default function TestNftPage() {
  const [nfts, setNfts] = useState(mockNfts);
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test NFT Metadata</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft, index) => (
          <div key={index} className="border border-theme-border rounded-lg p-4">
            <h2 className="text-xl mb-2">{nft.name}</h2>
            <div className="relative h-48 mb-4 bg-theme-card-highlight rounded-lg overflow-hidden">
              {nft.image && (
                <Image 
                  src={nft.image} 
                  alt={nft.name} 
                  fill 
                  className="object-cover"
                />
              )}
            </div>
            <p className="mb-2">{nft.description}</p>
            
            <div className="mt-4">
              <h3 className="font-bold mb-1">Attributes:</h3>
              <div className="grid grid-cols-2 gap-2">
                {nft.attributes?.map((attr: any, i: number) => (
                  <div key={i} className="bg-theme-surface p-2 rounded">
                    <span className="block text-xs text-theme-text-secondary">{attr.trait_type}</span>
                    <span className="font-medium">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4">
              <Link 
                href={`/buy/0x5FbDB2315678afecb367f032d93F642f64180aa3/${index}`}
                className="block w-full text-center py-2 px-4 bg-theme-primary text-black rounded-lg hover:bg-opacity-90 transition"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 