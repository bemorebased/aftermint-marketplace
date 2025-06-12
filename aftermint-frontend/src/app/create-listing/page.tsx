'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Image from 'next/image';
import { Calendar, Info } from 'lucide-react';

// Mock selected NFT data
const mockSelectedNft = {
  id: 'nft-123',
  name: 'Cool Cat #1234',
  imageUrl: '/images/nfts/cat-1.jpg',
  collectionName: 'Cool Cats',
  tokenId: '1234',
};

export default function CreateListingPage() {
  const [price, setPrice] = useState('');
  const [expirationDays, setExpirationDays] = useState('7');
  const [isPrivateListing, setIsPrivateListing] = useState(false);
  const [buyerAddress, setBuyerAddress] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit the listing to your backend/contract
    console.log({
      nftId: mockSelectedNft.id,
      price,
      expirationDays,
      isPrivateListing,
      buyerAddress: isPrivateListing ? buyerAddress : null,
    });
  };
  
  return (
    <main>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create Listing</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* NFT Preview */}
          <div className="w-full lg:w-1/3">
            <div className="glass-card rounded-lg overflow-hidden">
              <div className="relative aspect-square w-full">
                <Image
                  src={mockSelectedNft.imageUrl}
                  alt={mockSelectedNft.name}
                  fill={true}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{mockSelectedNft.name}</h3>
                <p className="text-sm text-theme-text-secondary">
                  {mockSelectedNft.collectionName} #{mockSelectedNft.tokenId}
                </p>
              </div>
            </div>
          </div>
          
          {/* Listing Form */}
          <div className="w-full lg:w-2/3">
            <div className="glass-card rounded-lg p-6">
              <form onSubmit={handleSubmit}>
                {/* Price Input */}
                <div className="mb-6">
                  <label className="block text-theme-text-primary font-medium mb-2">
                    Price
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter price"
                      className="w-full p-3 rounded bg-theme-card-highlight border border-theme-border text-theme-text-primary pr-20"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-secondary">
                      BASED
                    </span>
                  </div>
                </div>
                
                {/* Fee Information */}
                <div className="mb-6 p-4 bg-theme-card-highlight rounded-lg border border-theme-border">
                  <div className="flex items-start gap-3">
                    <Info size={18} className="text-theme-text-secondary mt-0.5" />
                    <div>
                      <p className="text-theme-text-primary font-medium">Fees</p>
                      <p className="text-sm text-theme-text-secondary mt-1">
                        Standard marketplace fee: 2.5%<br />
                        You will receive: <span className="text-theme-primary font-medium">{price ? `${(parseFloat(price) * 0.975).toFixed(2)} BASED` : '0 BASED'}</span>
                      </p>
                      <p className="text-xs text-theme-primary mt-2">
                        Subscribe to AfterMint for zero fees!
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Expiration */}
                <div className="mb-6">
                  <label className="block text-theme-text-primary font-medium mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Expiration</span>
                  </label>
                  <select
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value)}
                    className="w-full p-3 rounded bg-theme-card-highlight border border-theme-border text-theme-text-primary"
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
                
                {/* Private Listing Toggle */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div 
                      className={`w-10 h-6 rounded-full relative ${
                        isPrivateListing ? 'bg-theme-primary' : 'bg-theme-border'
                      }`}
                      onClick={() => setIsPrivateListing(!isPrivateListing)}
                    >
                      <div 
                        className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${
                          isPrivateListing ? 'right-1' : 'left-1'
                        }`}
                      />
                    </div>
                    <span className="text-theme-text-primary font-medium">Private Listing</span>
                  </label>
                  <p className="text-sm text-theme-text-secondary mt-1 ml-13">
                    Only a specific wallet address can purchase this NFT
                  </p>
                </div>
                
                {/* Buyer Address (only shown for private listings) */}
                {isPrivateListing && (
                  <div className="mb-6">
                    <label className="block text-theme-text-primary font-medium mb-2">
                      Buyer Wallet Address
                    </label>
                    <input
                      type="text"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full p-3 rounded bg-theme-card-highlight border border-theme-border text-theme-text-primary"
                      required={isPrivateListing}
                    />
                  </div>
                )}
                
                {/* Submit button */}
                <div className="flex justify-end mt-8">
                  <button 
                    type="submit"
                    className="btn-futuristic text-lg py-3 px-8 rounded-md"
                  >
                    Complete Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
