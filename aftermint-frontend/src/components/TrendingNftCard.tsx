"use client";

import React from 'react';
import Link from 'next/link';

export interface TrendingNFTCardProps {
  nft: {
    id: number;
    name: string;
    image: string;
    price: number;
    lastSale?: number;
    tokenId: number;
    rarity?: number;
    collection: {
      name: string;
      contract: string;
      logo?: string;
    };
  };
}

const TrendingNftCard: React.FC<TrendingNFTCardProps> = ({ nft }) => {
  return (
    <Link 
      href={`/nft/${nft.collection.contract}/${nft.tokenId}`} 
      className="group block font-[var(--theme-font-family)]"
    >
      {/* Wrapper for the animated gradient border and scale effect */}
      <div className="animated-gradient-border-wrapper hover:scale-105 transition-all duration-300">
        {/* Content div that sits above the gradient, gets the card background and actual border */}
        <div className="animated-gradient-border-content relative overflow-hidden border border-theme-border">
          {/* Image */}
          <div className="aspect-square relative">
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ 
                backgroundImage: `url(${nft.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            
            {/* Collection badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1 max-w-[calc(100%-16px)] bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
              {nft.collection.logo && (
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${nft.collection.logo})`,
                  }}
                />
              )}
              <p className="text-[10px] text-white font-medium truncate">{nft.collection.name}</p>
            </div>
          </div>
          
          {/* NFT Info - solid background, no rank */}
          <div className="p-2 bg-theme-surface border-t border-theme-border">
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-theme-text-primary truncate">{`#${nft.tokenId}`}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-xs text-theme-primary">{nft.price} BASED</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-theme-text-secondary truncate">Price</p>
              </div>
              {nft.lastSale && (
                <p className="text-[10px] text-theme-text-secondary ml-1">Last: {nft.lastSale} BASED</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TrendingNftCard;